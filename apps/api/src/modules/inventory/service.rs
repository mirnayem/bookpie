use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{InventoryItem, InventoryListQuery, StockMovement, UpdateStockRequest},
    repository::InventoryRepository,
};

#[derive(Clone)]
pub struct InventoryService {
    repository: InventoryRepository,
}

impl InventoryService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: InventoryRepository::new(pool),
        }
    }

    pub async fn list_inventory(
        &self,
        query: InventoryListQuery,
    ) -> Result<Vec<InventoryItem>, ApiError> {
        self.repository
            .list_inventory(
                query.limit(),
                query.offset(),
                query.search(),
                query.stock_status(),
            )
            .await
    }

    pub async fn update_stock(
        &self,
        book_id: Uuid,
        actor: UserId,
        payload: UpdateStockRequest,
    ) -> Result<InventoryItem, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_stock(book_id, payload.stock, payload.note.as_deref(), actor)
            .await
    }

    pub async fn movements(&self, book_id: Option<Uuid>) -> Result<Vec<StockMovement>, ApiError> {
        self.repository.movements(book_id, 100).await
    }
}
