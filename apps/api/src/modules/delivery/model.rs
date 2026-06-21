use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeliveryZone {
    pub id: Uuid,
    pub name: String,
    pub city: String,
    pub fee: i32,
    pub is_active: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertDeliveryZoneRequest {
    #[validate(length(min = 1, max = 120))]
    pub name: String,
    #[validate(length(min = 1, max = 80))]
    pub city: String,
    #[validate(range(min = 0))]
    pub fee: i32,
    pub is_active: Option<bool>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct DeliveryFeeRequest {
    #[validate(length(min = 1, max = 80))]
    pub city: String,
    #[validate(range(min = 0))]
    pub subtotal: i32,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeliveryFeeQuote {
    pub city: String,
    pub fee: i32,
    pub free_shipping: bool,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Rider {
    pub id: Uuid,
    pub name: String,
    pub phone: String,
    pub status: String,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertRiderRequest {
    #[validate(length(min = 1, max = 120))]
    pub name: String,
    #[validate(length(min = 6, max = 32))]
    pub phone: String,
    #[validate(length(max = 24))]
    pub status: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeliveryEvent {
    pub id: Uuid,
    pub order_id: Uuid,
    pub status: String,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub note: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct DeliveryEventRequest {
    pub order_id: Uuid,
    #[validate(length(min = 1, max = 80))]
    pub status: String,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    #[validate(length(max = 240))]
    pub note: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RoutePlanRequest {
    #[validate(length(min = 1, max = 50))]
    pub order_ids: Vec<Uuid>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RoutePlan {
    pub order_ids: Vec<Uuid>,
    pub estimated_minutes: i32,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct ProofUploadRequest {
    pub order_id: Uuid,
    #[validate(url)]
    pub proof_url: String,
    #[validate(length(max = 240))]
    pub note: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct FailedDeliveryRequest {
    pub order_id: Uuid,
    #[validate(length(min = 1, max = 240))]
    pub reason: String,
    pub next_attempt_at: Option<DateTime<Utc>>,
}
