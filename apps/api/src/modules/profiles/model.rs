use chrono::NaiveDate;
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

#[derive(Clone, Debug, Deserialize)]
pub struct CustomerListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

impl CustomerListQuery {
    pub fn limit(&self) -> i64 {
        self.limit.unwrap_or(25).clamp(1, 100)
    }

    pub fn offset(&self) -> i64 {
        self.offset.unwrap_or(0).max(0)
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
