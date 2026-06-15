use axum::{Json, Router, extract::State, routing::post};
use validator::Validate;

use crate::{
    error::ApiError,
    modules::auth::{
        model::{AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest},
        service::AuthService,
    },
    response::ApiResponse,
    state::AppState,
};

pub fn auth_router() -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/refresh", post(refresh))
}

async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    let service = AuthService::new(state);
    let response = service.register(payload).await?;

    Ok(Json(ApiResponse::ok(response)))
}

async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    let service = AuthService::new(state);
    let response = service.login(payload).await?;

    Ok(Json(ApiResponse::ok(response)))
}

async fn refresh(
    State(state): State<AppState>,
    Json(payload): Json<RefreshTokenRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    let service = AuthService::new(state);
    let response = service.refresh(payload).await?;

    Ok(Json(ApiResponse::ok(response)))
}
