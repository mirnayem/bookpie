use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationEvent {
    pub id: Uuid,
    pub channel: String,
    pub recipient: String,
    pub subject: Option<String>,
    pub body: String,
    pub status: String,
    pub metadata: Value,
    pub created_at: DateTime<Utc>,
    pub sent_at: Option<DateTime<Utc>>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct SendNotificationRequest {
    #[validate(length(min = 3, max = 180))]
    pub recipient: String,
    #[validate(length(max = 160))]
    pub subject: Option<String>,
    #[validate(length(min = 1, max = 2000))]
    pub body: String,
    pub metadata: Option<Value>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct OrderNotificationRequest {
    pub order_id: Uuid,
    #[validate(length(min = 1, max = 80))]
    pub event: String,
    #[validate(length(min = 3, max = 180))]
    pub recipient: String,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct MarketingNotificationRequest {
    #[validate(length(min = 1, max = 160))]
    pub subject: String,
    #[validate(length(min = 1, max = 2000))]
    pub body: String,
    #[validate(length(min = 1, max = 4))]
    pub channels: Vec<String>,
    #[validate(length(min = 1, max = 100))]
    pub recipients: Vec<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RegisterPushTokenRequest {
    #[validate(length(min = 10, max = 512))]
    pub token: String,
    #[validate(length(min = 3, max = 12))]
    pub platform: String,
}
