use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{get, patch, post},
};
use uuid::Uuid;

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{
        DeliveryEvent, DeliveryEventRequest, DeliveryFeeQuote, DeliveryFeeRequest, DeliveryZone,
        FailedDeliveryRequest, ProofUploadRequest, Rider, RoutePlan, RoutePlanRequest,
        UpsertDeliveryZoneRequest, UpsertRiderRequest,
    },
    service::DeliveryService,
};

pub fn delivery_router() -> Router<AppState> {
    Router::new()
        .route("/delivery/fee", post(delivery_fee))
        .route("/orders/{order_id}/tracking", get(order_tracking))
        .route("/delivery-agent/orders", get(rider_orders))
        .route("/admin/delivery/zones", get(zones).post(create_zone))
        .route("/admin/delivery/zones/{zone_id}", patch(update_zone))
        .route("/admin/delivery/riders", get(riders).post(create_rider))
        .route("/admin/delivery/riders/{rider_id}", patch(update_rider))
        .route(
            "/admin/delivery/riders/{rider_id}/onboard",
            post(onboard_rider),
        )
        .route("/admin/delivery/route-plan", post(route_plan))
        .route("/admin/delivery/events", post(create_event))
        .route("/admin/delivery/proofs", post(upload_proof))
        .route("/admin/delivery/failed", post(fail_delivery))
}

async fn delivery_fee(
    State(state): State<AppState>,
    Json(payload): Json<DeliveryFeeRequest>,
) -> Result<Json<ApiResponse<DeliveryFeeQuote>>, ApiError> {
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.fee_quote(payload).await?)))
}

async fn order_tracking(
    State(state): State<AppState>,
    Path(order_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Vec<DeliveryEvent>>>, ApiError> {
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.tracking(order_id).await?)))
}

async fn rider_orders(
    State(state): State<AppState>,
    _user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<DeliveryEvent>>>, ApiError> {
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.rider_orders().await?)))
}

async fn zones(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<DeliveryZone>>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.zones().await?)))
}

async fn create_zone(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertDeliveryZoneRequest>,
) -> Result<Json<ApiResponse<DeliveryZone>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.create_zone(payload).await?)))
}

async fn update_zone(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(zone_id): Path<Uuid>,
    Json(payload): Json<UpsertDeliveryZoneRequest>,
) -> Result<Json<ApiResponse<DeliveryZone>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.update_zone(zone_id, payload).await?,
    )))
}

async fn riders(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<Rider>>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.riders().await?)))
}

async fn create_rider(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertRiderRequest>,
) -> Result<Json<ApiResponse<Rider>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.create_rider(payload).await?)))
}

async fn update_rider(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(rider_id): Path<Uuid>,
    Json(payload): Json<UpsertRiderRequest>,
) -> Result<Json<ApiResponse<Rider>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.update_rider(rider_id, payload).await?,
    )))
}

async fn onboard_rider(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(rider_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Rider>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.onboard_rider(rider_id).await?,
    )))
}

async fn route_plan(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<RoutePlanRequest>,
) -> Result<Json<ApiResponse<RoutePlan>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.route_plan(payload).await?)))
}

async fn create_event(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<DeliveryEventRequest>,
) -> Result<Json<ApiResponse<DeliveryEvent>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.create_event(payload).await?)))
}

async fn upload_proof(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<ProofUploadRequest>,
) -> Result<Json<ApiResponse<DeliveryEvent>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.upload_proof(user.id, payload).await?,
    )))
}

async fn fail_delivery(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<FailedDeliveryRequest>,
) -> Result<Json<ApiResponse<DeliveryEvent>>, ApiError> {
    user.require_admin()?;
    let service = DeliveryService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.fail_delivery(user.id, payload).await?,
    )))
}
