use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId, response::PaginatedResponse};

use super::{
    model::{
        AssignDeliveryRequest, CreateOrderRequest, InitiatePaymentRequest, Invoice, InvoiceLine,
        Order, OrderActionRequest, OrderListQuery, OrderStatus, PaymentGatewayResponse,
        PaymentProvider, PaymentStatus, RefundPaymentRequest, UpdateOrderStatusRequest,
        VerifyPaymentRequest,
    },
    repository::OrderRepository,
};

#[derive(Clone)]
pub struct OrderService {
    repository: OrderRepository,
}

impl OrderService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: OrderRepository::new(pool),
        }
    }

    pub async fn create_order(
        &self,
        user_id: UserId,
        payload: CreateOrderRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.create_from_cart(user_id, payload).await
    }

    pub async fn user_orders(&self, user_id: UserId) -> Result<Vec<Order>, ApiError> {
        self.repository.user_orders(user_id).await
    }

    pub async fn user_order(&self, user_id: UserId, order_id: Uuid) -> Result<Order, ApiError> {
        self.repository.user_order(user_id, order_id).await
    }

    pub async fn admin_orders(
        &self,
        query: OrderListQuery,
    ) -> Result<PaginatedResponse<Order>, ApiError> {
        let limit = query.limit();
        let offset = query.offset();
        let total = self
            .repository
            .count_admin_orders(query.status.clone())
            .await?;
        let orders = self
            .repository
            .admin_orders(query.status, limit, offset)
            .await?;
        Ok(PaginatedResponse::new(orders, total, limit, offset))
    }

    pub async fn admin_order(&self, order_id: Uuid) -> Result<Order, ApiError> {
        self.repository.admin_order(order_id).await
    }

    pub async fn update_status(
        &self,
        order_id: Uuid,
        actor: UserId,
        payload: UpdateOrderStatusRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_status(order_id, payload.status, payload.note.as_deref(), actor)
            .await
    }

    pub async fn assign_delivery(
        &self,
        order_id: Uuid,
        actor: UserId,
        payload: AssignDeliveryRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .assign_delivery(order_id, &payload, actor)
            .await
    }

    pub async fn initiate_payment(
        &self,
        user_id: UserId,
        provider: PaymentProvider,
        payload: InitiatePaymentRequest,
    ) -> Result<PaymentGatewayResponse, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let order = self
            .repository
            .user_order(user_id, payload.order_id)
            .await?;
        let amount = payload.amount.unwrap_or(order.total);
        if amount != order.total {
            return Err(ApiError::Validation(
                "payment amount must match order total".to_string(),
            ));
        }

        self.repository
            .update_payment_state(
                payload.order_id,
                provider.clone(),
                PaymentStatus::Pending,
                "payment initiated",
                Some(user_id),
            )
            .await?;

        Ok(payment_response(
            provider,
            payload.order_id,
            PaymentStatus::Pending,
            "Payment initiated in mock-ready mode.",
        ))
    }

    pub async fn verify_payment(
        &self,
        provider: PaymentProvider,
        payload: VerifyPaymentRequest,
    ) -> Result<PaymentGatewayResponse, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let status = if payload.success {
            PaymentStatus::Paid
        } else {
            PaymentStatus::Failed
        };
        self.repository
            .update_payment_state(
                payload.order_id,
                provider.clone(),
                status.clone(),
                "payment verification callback processed",
                None,
            )
            .await?;

        Ok(payment_response(
            provider,
            payload.order_id,
            status,
            "Payment verification processed.",
        ))
    }

    pub async fn refund_payment(
        &self,
        actor: UserId,
        provider: PaymentProvider,
        payload: RefundPaymentRequest,
    ) -> Result<PaymentGatewayResponse, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let order = self.repository.admin_order(payload.order_id).await?;
        if payload.amount.unwrap_or(order.total) > order.total {
            return Err(ApiError::Validation(
                "refund amount cannot exceed order total".to_string(),
            ));
        }
        self.repository
            .update_payment_state(
                payload.order_id,
                provider.clone(),
                PaymentStatus::Refunded,
                payload.reason.as_deref().unwrap_or("payment refunded"),
                Some(actor),
            )
            .await?;

        Ok(payment_response(
            provider,
            payload.order_id,
            PaymentStatus::Refunded,
            "Refund recorded in mock-ready mode.",
        ))
    }

    pub async fn cancel_order(
        &self,
        user_id: UserId,
        order_id: Uuid,
        payload: OrderActionRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let order = self.repository.user_order(user_id, order_id).await?;
        if matches!(
            order.status,
            OrderStatus::Packed | OrderStatus::OutForDelivery | OrderStatus::Delivered
        ) {
            return Err(ApiError::Validation(
                "order cannot be cancelled after packing".to_string(),
            ));
        }

        self.repository
            .update_status(
                order_id,
                OrderStatus::Cancelled,
                payload
                    .reason
                    .as_deref()
                    .or(Some("customer cancelled order")),
                user_id,
            )
            .await
    }

    pub async fn request_refund(
        &self,
        user_id: UserId,
        order_id: Uuid,
        payload: OrderActionRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.user_order(user_id, order_id).await?;
        self.repository
            .update_status(
                order_id,
                OrderStatus::Refunded,
                payload
                    .reason
                    .as_deref()
                    .or(Some("customer refund request")),
                user_id,
            )
            .await
    }

    pub async fn request_return(
        &self,
        user_id: UserId,
        order_id: Uuid,
        payload: OrderActionRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.user_order(user_id, order_id).await?;
        self.repository
            .append_timeline(
                order_id,
                "return_requested",
                payload
                    .reason
                    .as_deref()
                    .or(Some("customer return request")),
                user_id,
            )
            .await
    }

    pub async fn invoice(&self, user_id: UserId, order_id: Uuid) -> Result<Invoice, ApiError> {
        let order = self.repository.user_order(user_id, order_id).await?;
        Ok(Invoice {
            order_id: order.id,
            invoice_number: format!("INV-{}", order.id.simple()),
            issued_at: Utc::now(),
            customer_id: order.user_id,
            subtotal: order.subtotal,
            shipping_fee: order.shipping_fee,
            discount_total: order.discount_total,
            tax_total: order.tax_total,
            total: order.total,
            lines: order
                .items
                .iter()
                .map(|item| InvoiceLine {
                    label: item.title.clone(),
                    quantity: item.quantity,
                    amount: item.line_total,
                })
                .collect(),
        })
    }
}

fn payment_response(
    provider: PaymentProvider,
    order_id: Uuid,
    status: PaymentStatus,
    message: &str,
) -> PaymentGatewayResponse {
    let status_suffix = status.as_str();
    let transaction_id = format!("{}-{order_id}-{status_suffix}", provider.as_str());
    let redirect_url = match provider {
        PaymentProvider::Sslcommerz => Some(format!(
            "https://sandbox.sslcommerz.com/mock/pay/{transaction_id}"
        )),
        PaymentProvider::Bkash => Some(format!(
            "https://sandbox.bkash.com/mock/pay/{transaction_id}"
        )),
        PaymentProvider::Stripe => Some(format!("https://stripe.local/mock/pay/{transaction_id}")),
        PaymentProvider::Nagad => Some(format!(
            "https://sandbox.nagad.com/mock/pay/{transaction_id}"
        )),
    };

    PaymentGatewayResponse {
        provider,
        order_id,
        transaction_id,
        redirect_url,
        status,
        message: message.to_string(),
    }
}
