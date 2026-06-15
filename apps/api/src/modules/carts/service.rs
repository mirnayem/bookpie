use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{AddCartItemRequest, Cart, UpdateCartItemRequest},
    repository::CartRepository,
};

#[derive(Clone)]
pub struct CartService {
    repository: CartRepository,
}

impl CartService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: CartRepository::new(pool),
        }
    }

    pub async fn get_cart(&self, user_id: UserId) -> Result<Cart, ApiError> {
        self.repository.get_or_create_cart(user_id).await
    }

    pub async fn add_item(
        &self,
        user_id: UserId,
        payload: AddCartItemRequest,
    ) -> Result<Cart, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .add_item(user_id, payload.book_id, payload.quantity)
            .await
    }

    pub async fn update_item(
        &self,
        user_id: UserId,
        book_id: Uuid,
        payload: UpdateCartItemRequest,
    ) -> Result<Cart, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_item(user_id, book_id, payload.quantity)
            .await
    }

    pub async fn remove_item(&self, user_id: UserId, book_id: Uuid) -> Result<Cart, ApiError> {
        self.repository.remove_item(user_id, book_id).await
    }

    pub async fn clear_cart(&self, user_id: UserId) -> Result<Cart, ApiError> {
        self.repository.clear_cart(user_id).await
    }
}
