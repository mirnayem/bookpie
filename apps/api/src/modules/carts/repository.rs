use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId};

use super::model::{Cart, CartItem};

#[derive(Clone)]
pub struct CartRepository {
    pool: PgPool,
}

impl CartRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn get_or_create_cart(&self, user_id: UserId) -> Result<Cart, ApiError> {
        let cart_id = self.ensure_cart(user_id).await?;
        self.cart_by_id(cart_id, user_id).await
    }

    pub async fn add_item(
        &self,
        user_id: UserId,
        book_id: Uuid,
        quantity: i32,
    ) -> Result<Cart, ApiError> {
        let stock = self.book_stock(book_id).await?;

        if quantity > stock {
            return Err(ApiError::Validation(
                "requested quantity exceeds stock".to_string(),
            ));
        }

        let cart_id = self.ensure_cart(user_id).await?;

        sqlx::query(
            r#"
            INSERT INTO cart_items (cart_id, book_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (cart_id, book_id)
            DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $4),
                          updated_at = now()
            "#,
        )
        .bind(cart_id)
        .bind(book_id)
        .bind(quantity)
        .bind(stock)
        .execute(&self.pool)
        .await?;

        self.cart_by_id(cart_id, user_id).await
    }

    pub async fn update_item(
        &self,
        user_id: UserId,
        book_id: Uuid,
        quantity: i32,
    ) -> Result<Cart, ApiError> {
        let stock = self.book_stock(book_id).await?;

        if quantity > stock {
            return Err(ApiError::Validation(
                "requested quantity exceeds stock".to_string(),
            ));
        }

        let cart_id = self.ensure_cart(user_id).await?;
        let result = sqlx::query(
            r#"
            UPDATE cart_items
            SET quantity = $3, updated_at = now()
            WHERE cart_id = $1 AND book_id = $2
            "#,
        )
        .bind(cart_id)
        .bind(book_id)
        .bind(quantity)
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(ApiError::NotFound);
        }

        self.cart_by_id(cart_id, user_id).await
    }

    pub async fn remove_item(&self, user_id: UserId, book_id: Uuid) -> Result<Cart, ApiError> {
        let cart_id = self.ensure_cart(user_id).await?;
        let result = sqlx::query("DELETE FROM cart_items WHERE cart_id = $1 AND book_id = $2")
            .bind(cart_id)
            .bind(book_id)
            .execute(&self.pool)
            .await?;

        if result.rows_affected() == 0 {
            return Err(ApiError::NotFound);
        }

        self.cart_by_id(cart_id, user_id).await
    }

    pub async fn clear_cart(&self, user_id: UserId) -> Result<Cart, ApiError> {
        let cart_id = self.ensure_cart(user_id).await?;
        sqlx::query("DELETE FROM cart_items WHERE cart_id = $1")
            .bind(cart_id)
            .execute(&self.pool)
            .await?;

        self.cart_by_id(cart_id, user_id).await
    }

    async fn ensure_cart(&self, user_id: UserId) -> Result<Uuid, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO carts (user_id)
            VALUES ($1)
            ON CONFLICT (user_id)
            DO UPDATE SET updated_at = now()
            RETURNING id
            "#,
        )
        .bind(user_id.0)
        .fetch_one(&self.pool)
        .await?;

        Ok(row.try_get("id")?)
    }

    async fn cart_by_id(&self, cart_id: Uuid, user_id: UserId) -> Result<Cart, ApiError> {
        let rows = sqlx::query(CART_ITEMS_SELECT)
            .bind(cart_id)
            .fetch_all(&self.pool)
            .await?;

        let items = rows.into_iter().map(cart_item_from_row).collect::<Vec<_>>();
        let subtotal = items.iter().map(|item| item.line_total).sum();

        Ok(Cart {
            id: cart_id,
            user_id: user_id.0,
            items,
            subtotal,
        })
    }

    async fn book_stock(&self, book_id: Uuid) -> Result<i32, ApiError> {
        let row = sqlx::query("SELECT stock FROM books WHERE id = $1")
            .bind(book_id)
            .fetch_optional(&self.pool)
            .await?;

        row.map(|row| row.get("stock")).ok_or(ApiError::NotFound)
    }
}

fn cart_item_from_row(row: PgRow) -> CartItem {
    let unit_price = row.get("sale_price");
    let quantity = row.get("quantity");

    CartItem {
        book_id: row.get("book_id"),
        title: row.get("title"),
        slug: row.get("slug"),
        cover_image_url: row.get("cover_image_url"),
        unit_price,
        original_price: row.get("price"),
        quantity,
        line_total: unit_price * quantity,
        available_stock: row.get("stock"),
    }
}

const CART_ITEMS_SELECT: &str = r#"
    SELECT
        ci.book_id,
        ci.quantity,
        b.title,
        b.slug,
        b.price,
        b.sale_price,
        b.stock,
        b.cover_image_url
    FROM cart_items ci
    INNER JOIN books b ON b.id = ci.book_id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at DESC
"#;
