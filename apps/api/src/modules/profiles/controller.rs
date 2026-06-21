use axum::{
    Json, Router,
    extract::{Path, Query, State},
    routing::{delete, get, patch, post},
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
        AdminCustomerSummary, CreateSavedCardRequest, CreateSavedPaymentMethodRequest,
        CustomerAddress, CustomerListQuery, CustomerProfile, SavedCard, SavedPaymentMethod,
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
        .route(
            "/profile/saved-cards",
            get(saved_cards).post(create_saved_card),
        )
        .route("/profile/saved-cards/{card_id}", delete(delete_saved_card))
        .route(
            "/profile/saved-cards/{card_id}/default",
            patch(set_default_saved_card),
        )
        .route(
            "/profile/payment-methods",
            get(saved_payment_methods).post(create_saved_payment_method),
        )
        .route(
            "/profile/payment-methods/{method_id}",
            delete(delete_saved_payment_method),
        )
        .route(
            "/profile/payment-methods/{method_id}/default",
            patch(set_default_saved_payment_method),
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

async fn saved_cards(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<SavedCard>>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let cards = service.saved_cards(user.id).await?;
    Ok(Json(ApiResponse::ok(cards)))
}

async fn create_saved_card(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<CreateSavedCardRequest>,
) -> Result<Json<ApiResponse<SavedCard>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let card = service.create_saved_card(user.id, payload).await?;
    Ok(Json(ApiResponse::ok(card)))
}

async fn set_default_saved_card(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(card_id): Path<Uuid>,
) -> Result<Json<ApiResponse<SavedCard>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let card = service.set_default_saved_card(user.id, card_id).await?;
    Ok(Json(ApiResponse::ok(card)))
}

async fn delete_saved_card(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(card_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    service.delete_saved_card(user.id, card_id).await?;
    Ok(Json(ApiResponse::ok(())))
}

async fn saved_payment_methods(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<SavedPaymentMethod>>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let methods = service.saved_payment_methods(user.id).await?;
    Ok(Json(ApiResponse::ok(methods)))
}

async fn create_saved_payment_method(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<CreateSavedPaymentMethodRequest>,
) -> Result<Json<ApiResponse<SavedPaymentMethod>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let method = service
        .create_saved_payment_method(user.id, payload)
        .await?;
    Ok(Json(ApiResponse::ok(method)))
}

async fn set_default_saved_payment_method(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(method_id): Path<Uuid>,
) -> Result<Json<ApiResponse<SavedPaymentMethod>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    let method = service
        .set_default_saved_payment_method(user.id, method_id)
        .await?;
    Ok(Json(ApiResponse::ok(method)))
}

async fn delete_saved_payment_method(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(method_id): Path<Uuid>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    let service = ProfileService::new(state.pg_pool.clone());
    service
        .delete_saved_payment_method(user.id, method_id)
        .await?;
    Ok(Json(ApiResponse::ok(())))
}

async fn list_customers(
    State(state): State<AppState>,
    user: CurrentUser,
    Query(query): Query<CustomerListQuery>,
) -> Result<Json<ApiResponse<PaginatedResponse<AdminCustomerSummary>>>, ApiError> {
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
