use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId};

use super::model::{CreateReviewRequest, ProductRatingSummary, ProductReview};

#[derive(Clone)]
pub struct ReviewRepository {
    pool: PgPool,
}

impl ReviewRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn list_for_book(&self, book_id: Uuid) -> Result<Vec<ProductReview>, ApiError> {
        let rows = sqlx::query(
            r#"
            SELECT id, book_id, user_id, rating, title, body, status, photo_urls, moderated_by, moderated_at, created_at
            FROM product_reviews
            WHERE book_id = $1 AND status = 'approved'
            ORDER BY created_at DESC
            "#,
        )
        .bind(book_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(review_from_row).collect())
    }

    pub async fn admin_list(&self, status: Option<&str>) -> Result<Vec<ProductReview>, ApiError> {
        let rows = sqlx::query(
            r#"
            SELECT id, book_id, user_id, rating, title, body, status, photo_urls, moderated_by, moderated_at, created_at
            FROM product_reviews
            WHERE ($1::TEXT IS NULL OR status = $1)
            ORDER BY created_at DESC
            LIMIT 200
            "#,
        )
        .bind(status)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(review_from_row).collect())
    }

    pub async fn create(
        &self,
        book_id: Uuid,
        user_id: UserId,
        payload: &CreateReviewRequest,
    ) -> Result<ProductReview, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO product_reviews (book_id, user_id, rating, title, body, photo_urls)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, book_id, user_id, rating, title, body, status, photo_urls, moderated_by, moderated_at, created_at
            "#,
        )
        .bind(book_id)
        .bind(user_id.0)
        .bind(payload.rating)
        .bind(payload.title.as_deref().map(str::trim))
        .bind(payload.body.trim())
        .bind(payload.photo_urls.clone().unwrap_or_default())
        .fetch_one(&self.pool)
        .await?;
        Ok(review_from_row(row))
    }

    pub async fn moderate(
        &self,
        id: Uuid,
        status: &str,
        moderator: UserId,
    ) -> Result<ProductReview, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE product_reviews
            SET status = $2, moderated_by = $3, moderated_at = now(), updated_at = now()
            WHERE id = $1
            RETURNING id, book_id, user_id, rating, title, body, status, photo_urls, moderated_by, moderated_at, created_at
            "#,
        )
        .bind(id)
        .bind(status)
        .bind(moderator.0)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(ApiError::NotFound)?;
        Ok(review_from_row(row))
    }

    pub async fn rating_summary(&self, book_id: Uuid) -> Result<ProductRatingSummary, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT $1::UUID AS book_id,
                   COALESCE(AVG(rating), 0)::FLOAT8 AS average_rating,
                   COUNT(*)::BIGINT AS review_count
            FROM product_reviews
            WHERE book_id = $1 AND status = 'approved'
            "#,
        )
        .bind(book_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(ProductRatingSummary {
            book_id: row.get("book_id"),
            average_rating: row.get("average_rating"),
            review_count: row.get("review_count"),
        })
    }
}

fn review_from_row(row: PgRow) -> ProductReview {
    ProductReview {
        id: row.get("id"),
        book_id: row.get("book_id"),
        user_id: row.get("user_id"),
        rating: row.get("rating"),
        title: row.get("title"),
        body: row.get("body"),
        status: row.get("status"),
        photo_urls: row.get("photo_urls"),
        moderated_by: row.get("moderated_by"),
        moderated_at: row.get("moderated_at"),
        created_at: row.get("created_at"),
    }
}
