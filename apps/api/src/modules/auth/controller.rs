use axum::{Json, Router, extract::State, routing::post};
use validator::Validate;

use crate::{
    error::ApiError,
    modules::auth::{
        model::{
            AuthResponse, LoginRequest, LogoutRequest, OtpRequest, OtpResponse,
            PasswordResetConfirmRequest, PasswordResetRequest, PasswordResetResponse,
            RefreshTokenRequest, RegisterRequest, VerificationResponse, VerifyOtpRequest,
        },
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
        .route("/logout", post(logout))
        .route("/password-reset", post(request_password_reset))
        .route("/password-reset/confirm", post(confirm_password_reset))
        .route("/otp", post(request_otp))
        .route("/otp/verify", post(verify_otp))
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

async fn logout(
    State(state): State<AppState>,
    Json(payload): Json<LogoutRequest>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    let service = AuthService::new(state);
    service.logout(payload).await?;

    Ok(Json(ApiResponse::ok(())))
}

async fn request_password_reset(
    State(state): State<AppState>,
    Json(payload): Json<PasswordResetRequest>,
) -> Result<Json<ApiResponse<PasswordResetResponse>>, ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    let service = AuthService::new(state);
    let response = service.request_password_reset(payload).await?;

    Ok(Json(ApiResponse::ok(response)))
}

async fn confirm_password_reset(
    State(state): State<AppState>,
    Json(payload): Json<PasswordResetConfirmRequest>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    let service = AuthService::new(state);
    service.confirm_password_reset(payload).await?;

    Ok(Json(ApiResponse::ok(())))
}

async fn request_otp(
    State(state): State<AppState>,
    Json(payload): Json<OtpRequest>,
) -> Result<Json<ApiResponse<OtpResponse>>, ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    let service = AuthService::new(state);
    let response = service.request_otp(payload).await?;

    Ok(Json(ApiResponse::ok(response)))
}

async fn verify_otp(
    State(state): State<AppState>,
    Json(payload): Json<VerifyOtpRequest>,
) -> Result<Json<ApiResponse<VerificationResponse>>, ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;

    let service = AuthService::new(state);
    let response = service.verify_otp(payload).await?;

    Ok(Json(ApiResponse::ok(response)))
}
