use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::{get, patch, post},
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{
        AssignPickerRequest, BarcodeScanRequest, BarcodeScanResult, BatchPickingRequest,
        DispatchRequest, InventoryItem, InventoryListQuery, PackingVerificationRequest,
        StockMovement, UpdateStockRequest, WarehouseOrder,
    },
    service::InventoryService,
};

pub fn inventory_router() -> Router<AppState> {
    Router::new()
        .route("/admin/inventory", get(list_inventory))
        .route("/admin/inventory/{book_id}", patch(update_stock))
        .route("/admin/inventory/movements", get(stock_movements))
        .route("/admin/warehouse/picking-queue", get(picking_queue))
        .route("/admin/warehouse/packing-queue", get(packing_queue))
        .route("/admin/warehouse/batch-picking", post(batch_picking))
        .route(
            "/admin/warehouse/orders/{order_id}/picker",
            post(assign_picker),
        )
        .route("/admin/warehouse/barcode-scan", post(scan_barcode))
        .route(
            "/admin/warehouse/packing-verification",
            post(verify_packing),
        )
        .route("/admin/warehouse/dispatch", post(dispatch))
}

async fn list_inventory(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(query): Query<InventoryListQuery>,
) -> Result<Json<ApiResponse<Vec<InventoryItem>>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let inventory = service.list_inventory(query).await?;
    Ok(Json(ApiResponse::ok(inventory)))
}

async fn update_stock(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(book_id): Path<Uuid>,
    Json(payload): Json<UpdateStockRequest>,
) -> Result<Json<ApiResponse<InventoryItem>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let item = service.update_stock(book_id, user.id, payload).await?;
    Ok(Json(ApiResponse::ok(item)))
}

async fn stock_movements(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(query): Query<MovementQuery>,
) -> Result<Json<ApiResponse<Vec<StockMovement>>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let movements = service.movements(query.book_id).await?;
    Ok(Json(ApiResponse::ok(movements)))
}

async fn picking_queue(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<WarehouseOrder>>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let orders = service.picking_queue().await?;
    Ok(Json(ApiResponse::ok(orders)))
}

async fn packing_queue(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<WarehouseOrder>>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let orders = service.packing_queue().await?;
    Ok(Json(ApiResponse::ok(orders)))
}

async fn batch_picking(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<BatchPickingRequest>,
) -> Result<Json<ApiResponse<Vec<WarehouseOrder>>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let orders = service.batch_picking(user.id, payload).await?;
    Ok(Json(ApiResponse::ok(orders)))
}

async fn assign_picker(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(order_id): Path<Uuid>,
    Json(payload): Json<AssignPickerRequest>,
) -> Result<Json<ApiResponse<WarehouseOrder>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let order = service.assign_picker(order_id, user.id, payload).await?;
    Ok(Json(ApiResponse::ok(order)))
}

async fn scan_barcode(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<BarcodeScanRequest>,
) -> Result<Json<ApiResponse<BarcodeScanResult>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let result = service.scan_barcode(payload).await?;
    Ok(Json(ApiResponse::ok(result)))
}

async fn verify_packing(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<PackingVerificationRequest>,
) -> Result<Json<ApiResponse<Vec<WarehouseOrder>>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let orders = service.verify_packing(user.id, payload).await?;
    Ok(Json(ApiResponse::ok(orders)))
}

async fn dispatch(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<DispatchRequest>,
) -> Result<Json<ApiResponse<Vec<WarehouseOrder>>>, ApiError> {
    user.require_admin()?;
    let service = InventoryService::new(state.pg_pool.clone());
    let orders = service.dispatch(user.id, payload).await?;
    Ok(Json(ApiResponse::ok(orders)))
}

#[derive(Deserialize)]
struct MovementQuery {
    #[serde(rename = "bookId")]
    book_id: Option<Uuid>,
}
