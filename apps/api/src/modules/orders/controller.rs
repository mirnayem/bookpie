use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::{get, patch, post},
};
use uuid::Uuid;

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{
        AssignDeliveryRequest, CreateOrderRequest, Order, OrderListQuery, UpdateOrderStatusRequest,
    },
    service::OrderService,
};

pub fn order_router() -> Router<AppState> {
    Router::new()
        .route("/orders", post(create_order).get(user_orders))
        .route("/orders/{order_id}", get(user_order))
        .route("/admin/orders", get(admin_orders))
        .route("/admin/orders/{order_id}", get(admin_order))
        .route("/admin/orders/{order_id}/status", patch(update_status))
        .route(
            "/admin/orders/{order_id}/delivery",
            post(assign_delivery).patch(assign_delivery),
        )
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

async fn admin_orders(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(query): Query<OrderListQuery>,
) -> Result<Json<ApiResponse<Vec<Order>>>, ApiError> {
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
