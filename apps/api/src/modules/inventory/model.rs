use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InventoryItem {
    pub book_id: Uuid,
    pub title: String,
    pub slug: String,
    pub cover_image_url: Option<String>,
    pub stock: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StockMovement {
    pub id: Uuid,
    pub warehouse_id: Uuid,
    pub book_id: Uuid,
    pub quantity_delta: i32,
    pub reason: String,
    pub note: Option<String>,
    pub created_by: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct InventoryListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

impl InventoryListQuery {
    pub fn limit(&self) -> i64 {
        self.limit.unwrap_or(50).clamp(1, 100)
    }

    pub fn offset(&self) -> i64 {
        self.offset.unwrap_or(0).max(0)
    }
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateStockRequest {
    #[validate(range(min = 0))]
    pub stock: i32,
    #[validate(length(max = 240))]
    pub note: Option<String>,
}
