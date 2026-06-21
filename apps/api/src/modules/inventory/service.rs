use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId, response::PaginatedResponse};

use super::{
    model::{
        AssignPickerRequest, BarcodeScanRequest, BarcodeScanResult, BatchPickingRequest,
        DispatchRequest, InventoryItem, InventoryListQuery, PackingVerificationRequest,
        StockMovement, UpdateStockRequest, WarehouseOrder,
    },
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
    ) -> Result<PaginatedResponse<InventoryItem>, ApiError> {
        let limit = query.limit();
        let offset = query.offset();
        let search = query.search();
        let stock_status = query.stock_status();
        let total = self
            .repository
            .count_inventory(search.clone(), stock_status)
            .await?;
        let inventory = self
            .repository
            .list_inventory(limit, offset, search, stock_status)
            .await?;

        Ok(PaginatedResponse::new(inventory, total, limit, offset))
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

    pub async fn picking_queue(&self) -> Result<Vec<WarehouseOrder>, ApiError> {
        self.repository
            .warehouse_queue(&["pending", "confirmed"])
            .await
    }

    pub async fn packing_queue(&self) -> Result<Vec<WarehouseOrder>, ApiError> {
        self.repository.warehouse_queue(&["picking"]).await
    }

    pub async fn batch_picking(
        &self,
        actor: UserId,
        payload: BatchPickingRequest,
    ) -> Result<Vec<WarehouseOrder>, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_orders_status(
                &payload.order_ids,
                "picking",
                payload.note.as_deref(),
                actor,
            )
            .await
    }

    pub async fn assign_picker(
        &self,
        order_id: Uuid,
        actor: UserId,
        payload: AssignPickerRequest,
    ) -> Result<WarehouseOrder, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let note = payload
            .note
            .unwrap_or_else(|| format!("assigned picker {}", payload.picker_id));
        self.repository
            .append_order_timeline(order_id, "picker_assigned", Some(&note), actor)
            .await
    }

    pub async fn scan_barcode(
        &self,
        payload: BarcodeScanRequest,
    ) -> Result<BarcodeScanResult, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .scan_barcode(payload.order_id, payload.barcode.trim())
            .await
    }

    pub async fn verify_packing(
        &self,
        actor: UserId,
        payload: PackingVerificationRequest,
    ) -> Result<Vec<WarehouseOrder>, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let note = payload.note.unwrap_or_else(|| {
            format!("packing verified with {} package(s)", payload.package_count)
        });
        self.repository
            .update_orders_status(&[payload.order_id], "packed", Some(&note), actor)
            .await
    }

    pub async fn dispatch(
        &self,
        actor: UserId,
        payload: DispatchRequest,
    ) -> Result<Vec<WarehouseOrder>, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let note = payload.note.unwrap_or_else(|| {
            format!(
                "dispatched via {} {}",
                payload
                    .carrier
                    .unwrap_or_else(|| "manual carrier".to_string()),
                payload.tracking_number.unwrap_or_default()
            )
        });
        self.repository
            .update_orders_status(&[payload.order_id], "out_for_delivery", Some(&note), actor)
            .await
    }
}
