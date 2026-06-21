use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::{get, patch, post},
};
use uuid::Uuid;

use crate::{
    error::ApiError,
    middleware::auth::CurrentUser,
    response::{ApiResponse, PaginatedResponse},
    state::AppState,
};

use super::{
    model::{
        AssignDeliveryRequest, CreateOrderRequest, InitiatePaymentRequest, Invoice, Order,
        OrderActionRequest, OrderListQuery, PaymentGatewayResponse, PaymentProvider,
        RefundPaymentRequest, UpdateOrderStatusRequest, VerifyPaymentRequest,
    },
    service::OrderService,
};

pub fn order_router() -> Router<AppState> {
    Router::new()
        .route("/orders", post(create_order).get(user_orders))
        .route("/orders/{order_id}", get(user_order))
        .route("/orders/{order_id}/cancel", post(cancel_order))
        .route("/orders/{order_id}/refund", post(request_refund))
        .route("/orders/{order_id}/return", post(request_return))
        .route("/orders/{order_id}/invoice", get(order_invoice))
        .route("/payments/{provider}/initiate", post(initiate_payment))
        .route("/payments/{provider}/validate", post(validate_payment))
        .route("/payments/{provider}/callback", post(validate_payment))
        .route("/payments/{provider}/webhook", post(validate_payment))
        .route("/admin/payments/{provider}/refund", post(refund_payment))
        .route("/admin/orders", get(admin_orders))
        .route("/admin/orders/{order_id}", get(admin_order))
        .route("/admin/orders/{order_id}/status", patch(update_status))
        .route(
            "/admin/orders/{order_id}/delivery",
            post(assign_delivery).patch(assign_delivery),
        )
}

async fn initiate_payment(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(provider): Path<String>,
    Json(payload): Json<InitiatePaymentRequest>,
) -> Result<Json<ApiResponse<PaymentGatewayResponse>>, ApiError> {
    let provider = parse_provider(&provider)?;
    let service = OrderService::new(state.pg_pool.clone());
    let payment = service.initiate_payment(user.id, provider, payload).await?;
    Ok(Json(ApiResponse::ok(payment)))
}

async fn validate_payment(
    State(state): State<AppState>,
    Path(provider): Path<String>,
    Json(payload): Json<VerifyPaymentRequest>,
) -> Result<Json<ApiResponse<PaymentGatewayResponse>>, ApiError> {
    let provider = parse_provider(&provider)?;
    let service = OrderService::new(state.pg_pool.clone());
    let payment = service.verify_payment(provider, payload).await?;
    Ok(Json(ApiResponse::ok(payment)))
}

async fn refund_payment(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(provider): Path<String>,
    Json(payload): Json<RefundPaymentRequest>,
) -> Result<Json<ApiResponse<PaymentGatewayResponse>>, ApiError> {
    user.require_admin()?;
    let provider = parse_provider(&provider)?;
    let service = OrderService::new(state.pg_pool.clone());
    let payment = service.refund_payment(user.id, provider, payload).await?;
    Ok(Json(ApiResponse::ok(payment)))
}

async fn create_order(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<CreateOrderRequest>,
) -> Result<Json<ApiResponse<Order>>, ApiError> {
    let service = OrderService::new(state.pg_pool.clone());
    let order = service.create_order(user.id, payload).await?;
    Ok(Json(ApiResponse::ok(order)))
}

async fn user_orders(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<Order>>>, ApiError> {
    let service = OrderService::new(state.pg_pool.clone());
    let orders = service.user_orders(user.id).await?;
    Ok(Json(ApiResponse::ok(orders)))
}

async fn user_order(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Order>>, ApiError> {
    let service = OrderService::new(state.pg_pool.clone());
    let order = service.user_order(user.id, order_id).await?;
    Ok(Json(ApiResponse::ok(order)))
}

async fn cancel_order(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
    Json(payload): Json<OrderActionRequest>,
) -> Result<Json<ApiResponse<Order>>, ApiError> {
    let service = OrderService::new(state.pg_pool.clone());
    let order = service.cancel_order(user.id, order_id, payload).await?;
    Ok(Json(ApiResponse::ok(order)))
}

async fn request_refund(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
    Json(payload): Json<OrderActionRequest>,
) -> Result<Json<ApiResponse<Order>>, ApiError> {
    let service = OrderService::new(state.pg_pool.clone());
    let order = service.request_refund(user.id, order_id, payload).await?;
    Ok(Json(ApiResponse::ok(order)))
}

async fn request_return(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
    Json(payload): Json<OrderActionRequest>,
) -> Result<Json<ApiResponse<Order>>, ApiError> {
    let service = OrderService::new(state.pg_pool.clone());
    let order = service.request_return(user.id, order_id, payload).await?;
    Ok(Json(ApiResponse::ok(order)))
}

async fn order_invoice(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Invoice>>, ApiError> {
    let service = OrderService::new(state.pg_pool.clone());
    let invoice = service.invoice(user.id, order_id).await?;
    Ok(Json(ApiResponse::ok(invoice)))
}

async fn admin_orders(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(query): Query<OrderListQuery>,
) -> Result<Json<ApiResponse<PaginatedResponse<Order>>>, ApiError> {
    user.require_admin()?;
    let service = OrderService::new(state.pg_pool.clone());
    let orders = service.admin_orders(query).await?;
    Ok(Json(ApiResponse::ok(orders)))
}

async fn admin_order(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Order>>, ApiError> {
    user.require_admin()?;
    let service = OrderService::new(state.pg_pool.clone());
    let order = service.admin_order(order_id).await?;
    Ok(Json(ApiResponse::ok(order)))
}

async fn update_status(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
    Json(payload): Json<UpdateOrderStatusRequest>,
) -> Result<Json<ApiResponse<Order>>, ApiError> {
    user.require_admin()?;
    let service = OrderService::new(state.pg_pool.clone());
    let order = service.update_status(order_id, user.id, payload).await?;
    Ok(Json(ApiResponse::ok(order)))
}

async fn assign_delivery(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
    Json(payload): Json<AssignDeliveryRequest>,
) -> Result<Json<ApiResponse<Order>>, ApiError> {
    user.require_admin()?;
    let service = OrderService::new(state.pg_pool.clone());
    let order = service.assign_delivery(order_id, user.id, payload).await?;
    Ok(Json(ApiResponse::ok(order)))
}

fn parse_provider(provider: &str) -> Result<PaymentProvider, ApiError> {
    PaymentProvider::parse(provider)
        .ok_or_else(|| ApiError::Validation(format!("unsupported payment provider: {provider}")))
}
