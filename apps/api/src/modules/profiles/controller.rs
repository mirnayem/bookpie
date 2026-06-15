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
        AdminCustomerSummary, CustomerAddress, CustomerListQuery, CustomerProfile,
        UpdateProfileRequest, UpsertAddressRequest,
    },
    service::ProfileService,
};

pub fn profile_router() -> Router<AppState> {
    Router::new()
        .route("/profile", get(profile).patch(update_profile))
        .route("/profile/addresses", post(create_address))
        .route(
            "/profile/addresses/{address_id}",
            patch(update_address).delete(delete_address),
        )
        .route("/admin/customers", get(list_customers))
        .route("/admin/customers/{customer_id}", get(customer_detail))
}

async fn profile(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<CustomerProfile>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let profile = service.profile(user.id).await?;
    Ok(Json(ApiResponse::ok(profile)))
}

async fn update_profile(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpdateProfileRequest>,
) -> Result<Json<ApiResponse<CustomerProfile>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let profile = service.update_profile(user.id, payload).await?;
    Ok(Json(ApiResponse::ok(profile)))
}

async fn create_address(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertAddressRequest>,
) -> Result<Json<ApiResponse<CustomerAddress>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let address = service.create_address(user.id, payload).await?;
    Ok(Json(ApiResponse::ok(address)))
}

async fn update_address(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(address_id): Path<Uuid>,
    Json(payload): Json<UpsertAddressRequest>,
) -> Result<Json<ApiResponse<CustomerAddress>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let address = service.update_address(user.id, address_id, payload).await?;
    Ok(Json(ApiResponse::ok(address)))
}

async fn delete_address(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(address_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    service.delete_address(user.id, address_id).await?;
    Ok(Json(ApiResponse::ok(())))
}

async fn list_customers(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(query): Query<CustomerListQuery>,
) -> Result<Json<ApiResponse<Vec<AdminCustomerSummary>>>, ApiError> {
    user.require_admin()?;
    let service = ProfileService::new(state.pg_pool.clone());
    let customers = service.list_customers(query).await?;
    Ok(Json(ApiResponse::ok(customers)))
}

async fn customer_detail(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(customer_id): Path<Uuid>,
) -> Result<Json<ApiResponse<CustomerProfile>>, ApiError> {
    user.require_admin()?;
    let service = ProfileService::new(state.pg_pool.clone());
    let profile = service
        .profile(crate::models::ids::UserId(customer_id))
        .await?;
    Ok(Json(ApiResponse::ok(profile)))
}
