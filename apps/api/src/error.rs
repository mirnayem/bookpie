use std::{net::AddrParseError, num::ParseIntError};

use axum::{Json, http::StatusCode, response::IntoResponse};
use thiserror::Error;

use crate::response::ApiResponse;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("configuration error: {0}")]
    Config(String),
    #[error("unauthorized")]
    Unauthorized,
    #[error("forbidden")]
    Forbidden,
    #[error("postgres error: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("redis error: {0}")]
    Redis(#[from] redis::RedisError),
    #[error("jwt error: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid address: {0}")]
    AddrParse(#[from] AddrParseError),
    #[error("invalid number: {0}")]
    ParseInt(#[from] ParseIntError),
}

impl ApiError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
            Self::Forbidden => StatusCode::FORBIDDEN,
            Self::Config(_)
            | Self::Sqlx(_)
            | Self::Redis(_)
            | Self::Jwt(_)
            | Self::Io(_)
            | Self::AddrParse(_)
            | Self::ParseInt(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    pub fn code(&self) -> &'static str {
        match self {
            Self::Config(_) => "CONFIG_ERROR",
            Self::Unauthorized => "UNAUTHORIZED",
            Self::Forbidden => "FORBIDDEN",
            Self::Sqlx(_) => "DATABASE_ERROR",
            Self::Redis(_) => "REDIS_ERROR",
            Self::Jwt(_) => "TOKEN_ERROR",
            Self::Io(_) => "IO_ERROR",
            Self::AddrParse(_) | Self::ParseInt(_) => "PARSE_ERROR",
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        let status = self.status_code();
        let message = self.to_string();
        let body = ApiResponse::fail(self.code(), message);

        (status, Json(body)).into_response()
    }
}
