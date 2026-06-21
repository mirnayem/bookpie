use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum OrderStatus {
    Pending,
    Confirmed,
    Picking,
    Packed,
    OutForDelivery,
    Delivered,
    Cancelled,
    Refunded,
}

impl OrderStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Confirmed => "confirmed",
            Self::Picking => "picking",
            Self::Packed => "packed",
            Self::OutForDelivery => "out_for_delivery",
            Self::Delivered => "delivered",
            Self::Cancelled => "cancelled",
            Self::Refunded => "refunded",
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentProvider {
    Sslcommerz,
    Bkash,
    Stripe,
    Nagad,
}

impl PaymentProvider {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Sslcommerz => "sslcommerz",
            Self::Bkash => "bkash",
            Self::Stripe => "stripe",
            Self::Nagad => "nagad",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "sslcommerz" => Some(Self::Sslcommerz),
            "bkash" => Some(Self::Bkash),
            "stripe" => Some(Self::Stripe),
            "nagad" => Some(Self::Nagad),
            _ => None,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum PaymentStatus {
    Pending,
    Paid,
    Failed,
    Cancelled,
    Refunded,
}

impl PaymentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Paid => "paid",
            Self::Failed => "failed",
            Self::Cancelled => "cancelled",
            Self::Refunded => "refunded",
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Order {
    pub id: Uuid,
    pub user_id: Uuid,
    pub address_id: Option<Uuid>,
    pub status: OrderStatus,
    pub payment_provider: Option<PaymentProvider>,
    pub payment_status: PaymentStatus,
    pub subtotal: i32,
    pub shipping_fee: i32,
    pub discount_total: i32,
    pub tax_total: i32,
    pub total: i32,
    pub items: Vec<OrderItem>,
    pub delivery: Option<DeliveryAssignment>,
    pub created_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderItem {
    pub book_id: Uuid,
    pub title: String,
    pub quantity: i32,
    pub unit_price: i32,
    pub line_total: i32,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum DeliveryStatus {
    Assigned,
    PickedUp,
    Delivered,
    Failed,
}

impl DeliveryStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Assigned => "assigned",
            Self::PickedUp => "picked_up",
            Self::Delivered => "delivered",
            Self::Failed => "failed",
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeliveryAssignment {
    pub id: Uuid,
    pub order_id: Uuid,
    pub agent_name: String,
    pub agent_phone: String,
    pub status: DeliveryStatus,
    pub note: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct CreateOrderRequest {
    pub address_id: Uuid,
    pub payment_provider: Option<PaymentProvider>,
    #[validate(range(min = 0))]
    pub shipping_fee: Option<i32>,
    #[validate(range(min = 0))]
    pub coupon_discount: Option<i32>,
    #[validate(range(min = 0))]
    pub tax_total: Option<i32>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UpdateOrderStatusRequest {
    pub status: OrderStatus,
    #[validate(length(max = 240))]
    pub note: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct AssignDeliveryRequest {
    #[validate(length(min = 1, max = 160))]
    pub agent_name: String,
    #[validate(length(min = 6, max = 32))]
    pub agent_phone: String,
    pub status: Option<DeliveryStatus>,
    #[validate(length(max = 240))]
    pub note: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct InitiatePaymentRequest {
    pub order_id: Uuid,
    #[validate(range(min = 1))]
    pub amount: Option<i32>,
    #[validate(length(min = 3, max = 3))]
    pub currency: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct VerifyPaymentRequest {
    pub order_id: Uuid,
    #[validate(length(min = 6, max = 120))]
    pub transaction_id: String,
    pub success: bool,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RefundPaymentRequest {
    pub order_id: Uuid,
    #[validate(length(min = 6, max = 120))]
    pub transaction_id: String,
    #[validate(range(min = 1))]
    pub amount: Option<i32>,
    #[validate(length(max = 240))]
    pub reason: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentGatewayResponse {
    pub provider: PaymentProvider,
    pub order_id: Uuid,
    pub transaction_id: String,
    pub redirect_url: Option<String>,
    pub status: PaymentStatus,
    pub message: String,
}

#[derive(Clone, Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct OrderActionRequest {
    #[validate(length(max = 240))]
    pub reason: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InvoiceLine {
    pub label: String,
    pub quantity: i32,
    pub amount: i32,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Invoice {
    pub order_id: Uuid,
    pub invoice_number: String,
    pub issued_at: DateTime<Utc>,
    pub customer_id: Uuid,
    pub subtotal: i32,
    pub shipping_fee: i32,
    pub discount_total: i32,
    pub tax_total: i32,
    pub total: i32,
    pub lines: Vec<InvoiceLine>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct OrderListQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub status: Option<OrderStatus>,
}

impl OrderListQuery {
    pub fn limit(&self) -> i64 {
        self.limit.unwrap_or(25).clamp(1, 100)
    }

    pub fn offset(&self) -> i64 {
        self.offset.unwrap_or(0).max(0)
    }
}
