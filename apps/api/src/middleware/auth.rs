use axum::{
    Json,
    extract::FromRequestParts,
    http::{HeaderMap, request::Parts},
};
use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId, response::ApiResponse, state::AppState};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub enum UserRole {
    Customer,
    Admin,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Claims {
    pub sub: Uuid,
    pub role: UserRole,
    pub exp: i64,
    pub iss: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct CurrentUser {
    pub id: UserId,
    pub role: UserRole,
}

impl CurrentUser {
    pub fn require_admin(&self) -> Result<(), ApiError> {
        match self.role {
            UserRole::Admin => Ok(()),
            UserRole::Customer => Err(ApiError::Forbidden),
        }
    }
}

impl FromRequestParts<AppState> for CurrentUser {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let token = bearer_token(&parts.headers)?;
        let claims = decode_jwt(token, state)?;

        Ok(Self {
            id: UserId(claims.sub),
            role: claims.role,
        })
    }
}

pub async fn me(user: CurrentUser) -> Json<ApiResponse<CurrentUser>> {
    Json(ApiResponse::ok(user))
}

pub async fn admin_ping(user: CurrentUser) -> Result<Json<ApiResponse<&'static str>>, ApiError> {
    user.require_admin()?;

    Ok(Json(ApiResponse::ok("admin-ok")))
}

fn decode_jwt(token: &str, state: &AppState) -> Result<Claims, ApiError> {
    let mut validation = Validation::new(Algorithm::HS256);
    validation.set_issuer(&[state.config.jwt_issuer.as_str()]);

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.config.jwt_secret.as_bytes()),
        &validation,
    )?;

    Ok(token_data.claims)
}

fn bearer_token(headers: &HeaderMap) -> Result<&str, ApiError> {
    let header = headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .ok_or(ApiError::Unauthorized)?;

    header
        .strip_prefix("Bearer ")
        .filter(|token| !token.trim().is_empty())
        .ok_or(ApiError::Unauthorized)
}
