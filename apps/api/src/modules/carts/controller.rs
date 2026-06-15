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
    model::{AddCartItemRequest, Cart, UpdateCartItemRequest},
    service::CartService,
};

pub fn cart_router() -> Router<AppState> {
    Router::new()
        .route("/cart", get(get_cart).delete(clear_cart))
        .route("/cart/items", post(add_item))
        .route(
            "/cart/items/{book_id}",
            patch(update_item).delete(remove_item),
        )
}

async fn get_cart(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Cart>>, ApiError> {
    let service = CartService::new(state.pg_pool.clone());
    let cart = service.get_cart(user.id).await?;

    Ok(Json(ApiResponse::ok(cart)))
}

async fn add_item(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<AddCartItemRequest>,
) -> Result<Json<ApiResponse<Cart>>, ApiError> {
    let service = CartService::new(state.pg_pool.clone());
    let cart = service.add_item(user.id, payload).await?;

    Ok(Json(ApiResponse::ok(cart)))
}

async fn update_item(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(book_id): Path<Uuid>,
    Json(payload): Json<UpdateCartItemRequest>,
) -> Result<Json<ApiResponse<Cart>>, ApiError> {
    let service = CartService::new(state.pg_pool.clone());
    let cart = service.update_item(user.id, book_id, payload).await?;

    Ok(Json(ApiResponse::ok(cart)))
}

async fn remove_item(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(book_id): Path<Uuid>,
) -> Result<Json<ApiResponse<Cart>>, ApiError> {
    let service = CartService::new(state.pg_pool.clone());
    let cart = service.remove_item(user.id, book_id).await?;

    Ok(Json(ApiResponse::ok(cart)))
}

async fn clear_cart(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Cart>>, ApiError> {
    let service = CartService::new(state.pg_pool.clone());
    let cart = service.clear_cart(user.id).await?;

    Ok(Json(ApiResponse::ok(cart)))
}
