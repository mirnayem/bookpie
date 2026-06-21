use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{
        CreateReviewRequest, ModerateReviewRequest, ProductRatingSummary, ProductReview,
        ReviewListQuery,
    },
    repository::ReviewRepository,
};

#[derive(Clone)]
pub struct ReviewService {
    repository: ReviewRepository,
}

impl ReviewService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: ReviewRepository::new(pool),
        }
    }

    pub async fn list_for_book(&self, book_id: Uuid) -> Result<Vec<ProductReview>, ApiError> {
        self.repository.list_for_book(book_id).await
    }

    pub async fn rating_summary(&self, book_id: Uuid) -> Result<ProductRatingSummary, ApiError> {
        self.repository.rating_summary(book_id).await
    }

    pub async fn admin_list(&self, query: ReviewListQuery) -> Result<Vec<ProductReview>, ApiError> {
        let status = query
            .status
            .as_deref()
            .filter(|value| matches!(*value, "pending" | "approved" | "rejected"));
        self.repository.admin_list(status).await
    }

    pub async fn create(
        &self,
        book_id: Uuid,
        user_id: UserId,
        payload: CreateReviewRequest,
    ) -> Result<ProductReview, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        if payload
            .photo_urls
            .as_ref()
            .is_some_and(|urls| urls.iter().any(|url| url.len() > 500))
        {
            return Err(ApiError::Validation("photo URL is too long".to_string()));
        }
        self.repository.create(book_id, user_id, &payload).await
    }

    pub async fn moderate(
        &self,
        id: Uuid,
        moderator: UserId,
        payload: ModerateReviewRequest,
    ) -> Result<ProductReview, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        if !matches!(payload.status.as_str(), "pending" | "approved" | "rejected") {
            return Err(ApiError::Validation("invalid review status".to_string()));
        }
        self.repository
            .moderate(id, &payload.status, moderator)
            .await
    }
}
