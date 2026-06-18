use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomerProfile {
    pub user_id: Uuid,
    pub name: String,
    pub email: String,
    pub display_name: Option<String>,
    pub phone: Option<String>,
    pub date_of_birth: Option<NaiveDate>,
    pub addresses: Vec<CustomerAddress>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomerAddress {
    pub id: Uuid,
    pub user_id: Uuid,
    pub label: String,
    pub recipient_name: String,
    pub phone: String,
    pub address_line1: String,
    pub address_line2: Option<String>,
    pub city: String,
    pub zone: Option<String>,
    pub postal_code: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub is_default: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedCard {
    pub id: Uuid,
    pub user_id: Uuid,
    pub provider: String,
    pub card_brand: String,
    pub last4: String,
    pub exp_month: i32,
    pub exp_year: i32,
    pub is_default: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedPaymentMethod {
    pub id: Uuid,
    pub user_id: Uuid,
    pub provider: String,
    pub method_type: String,
    pub display_label: String,
    pub wallet_phone: Option<String>,
    pub is_default: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProfileRequest {
    #[validate(length(min = 1, max = 160))]
    pub display_name: Option<String>,
    #[validate(length(min = 6, max = 32))]
    pub phone: Option<String>,
    pub date_of_birth: Option<NaiveDate>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertAddressRequest {
    #[validate(length(min = 1, max = 80))]
    pub label: String,
    #[validate(length(min = 1, max = 160))]
    pub recipient_name: String,
    #[validate(length(min = 6, max = 32))]
    pub phone: String,
    #[validate(length(min = 5, max = 240))]
    pub address_line1: String,
    #[validate(length(max = 240))]
    pub address_line2: Option<String>,
    #[validate(length(min = 1, max = 120))]
    pub city: String,
    #[validate(length(max = 120))]
    pub zone: Option<String>,
    #[validate(length(max = 32))]
    pub postal_code: Option<String>,
    #[validate(range(min = -90.0, max = 90.0))]
    pub latitude: Option<f64>,
    #[validate(range(min = -180.0, max = 180.0))]
    pub longitude: Option<f64>,
    pub is_default: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateSavedCardRequest {
    #[validate(length(min = 1, max = 32))]
    pub provider: String,
    #[validate(length(min = 1, max = 32))]
    pub card_brand: String,
    #[validate(length(equal = 4))]
    pub last4: String,
    #[validate(range(min = 1, max = 12))]
    pub exp_month: i32,
    #[validate(range(min = 2026, max = 2100))]
    pub exp_year: i32,
    #[validate(length(min = 8, max = 180))]
    pub token_reference: String,
    pub is_default: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateSavedPaymentMethodRequest {
    #[validate(length(min = 1, max = 32))]
    pub provider: String,
    #[validate(length(min = 1, max = 32))]
    pub method_type: String,
    #[validate(length(min = 1, max = 120))]
    pub display_label: String,
    #[validate(length(min = 6, max = 32))]
    pub wallet_phone: Option<String>,
    #[validate(length(min = 8, max = 180))]
    pub token_reference: Option<String>,
    pub is_default: bool,
}

#[derive(Clone, Debug, Deserialize)]
pub struct CustomerListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub search: Option<String>,
}

impl CustomerListQuery {
    pub fn limit(&self) -> i64 {
        self.limit.unwrap_or(25).clamp(1, 100)
    }

    pub fn offset(&self) -> i64 {
        self.offset.unwrap_or(0).max(0)
    }

    pub fn search(&self) -> Option<String> {
        self.search
            .as_deref()
            .map(str::trim)
            .filter(|value| value.len() >= 3)
            .map(|value| format!("%{value}%"))
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminCustomerSummary {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub address_count: i64,
}
