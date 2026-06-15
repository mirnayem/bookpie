use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::{get, patch},
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{InventoryItem, InventoryListQuery, StockMovement, UpdateStockRequest},
    service::InventoryService,
};

pub fn inventory_router() -> Router<AppState> {
    Router::new()
        .route("/admin/inventory", get(list_inventory))
        .route("/admin/inventory/{book_id}", patch(update_stock))
        .route("/admin/inventory/movements", get(stock_movements))
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

#[derive(Deserialize)]
struct MovementQuery {
    #[serde(rename = "bookId")]
    book_id: Option<Uuid>,
}
