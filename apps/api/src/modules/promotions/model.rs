use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Coupon {
    pub id: Uuid,
    pub code: String,
    pub name: String,
    pub discount_type: String,
    pub discount_value: i32,
    pub min_order_total: i32,
    pub usage_limit: Option<i32>,
    pub used_count: i32,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub is_active: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertCouponRequest {
    #[validate(length(min = 2, max = 40))]
    pub code: String,
    #[validate(length(min = 1, max = 120))]
    pub name: String,
    #[validate(length(min = 1, max = 24))]
    pub discount_type: String,
    #[validate(range(min = 0))]
    pub discount_value: i32,
    #[validate(range(min = 0))]
    pub min_order_total: i32,
    #[validate(range(min = 1))]
    pub usage_limit: Option<i32>,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub is_active: Option<bool>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct ValidateCouponRequest {
    #[validate(length(min = 2, max = 40))]
    pub code: String,
    #[validate(range(min = 0))]
    pub subtotal: i32,
    #[validate(range(min = 0))]
    pub shipping_fee: Option<i32>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CouponValidation {
    pub valid: bool,
    pub code: String,
    pub discount: i32,
    pub free_shipping: bool,
    pub message: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BuyXGetYRule {
    pub id: Uuid,
    pub name: String,
    pub buy_book_id: Uuid,
    pub get_book_id: Uuid,
    pub buy_quantity: i32,
    pub get_quantity: i32,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub is_active: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertBuyXGetYRuleRequest {
    #[validate(length(min = 1, max = 120))]
    pub name: String,
    pub buy_book_id: Uuid,
    pub get_book_id: Uuid,
    #[validate(range(min = 1))]
    pub buy_quantity: i32,
    #[validate(range(min = 1))]
    pub get_quantity: i32,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub is_active: Option<bool>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FlashSaleCampaign {
    pub id: Uuid,
    pub name: String,
    pub starts_at: DateTime<Utc>,
    pub ends_at: DateTime<Utc>,
    pub is_active: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertFlashSaleCampaignRequest {
    #[validate(length(min = 1, max = 120))]
    pub name: String,
    pub starts_at: DateTime<Utc>,
    pub ends_at: DateTime<Utc>,
    pub is_active: Option<bool>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReferralSummary {
    pub code: String,
    pub reward_points: i32,
    pub referrals: i64,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateReferralRequest {
    #[validate(length(min = 2, max = 40))]
    pub code: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoyaltyAccount {
    pub user_id: Uuid,
    pub points: i32,
    pub tier: String,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct AdjustLoyaltyRequest {
    pub user_id: Uuid,
    pub points_delta: i32,
    #[validate(length(min = 1, max = 160))]
    pub reason: String,
    pub order_id: Option<Uuid>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CashbackRule {
    pub id: Uuid,
    pub name: String,
    pub percent: i32,
    pub max_cashback: Option<i32>,
    pub min_order_total: i32,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub is_active: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertCashbackRuleRequest {
    #[validate(length(min = 1, max = 120))]
    pub name: String,
    #[validate(range(min = 0, max = 100))]
    pub percent: i32,
    #[validate(range(min = 0))]
    pub max_cashback: Option<i32>,
    #[validate(range(min = 0))]
    pub min_order_total: i32,
    pub starts_at: Option<DateTime<Utc>>,
    pub ends_at: Option<DateTime<Utc>>,
    pub is_active: Option<bool>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MembershipPlan {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub price: i32,
    pub duration_days: i32,
    pub benefits: Value,
    pub is_active: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpsertMembershipPlanRequest {
    #[validate(length(min = 1, max = 120))]
    pub name: String,
    #[validate(length(min = 2, max = 80))]
    pub slug: String,
    #[validate(range(min = 0))]
    pub price: i32,
    #[validate(range(min = 1))]
    pub duration_days: i32,
    pub benefits: Value,
    pub is_active: Option<bool>,
}
