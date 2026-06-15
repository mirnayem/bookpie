use std::{env, net::IpAddr};

use crate::error::ApiError;

#[derive(Clone, Debug)]
pub struct Config {
    pub app_env: String,
    pub api_host: IpAddr,
    pub api_port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub meili_url: String,
    pub meili_api_key: Option<String>,
    pub meili_books_index: String,
    pub jwt_secret: String,
    pub jwt_issuer: String,
    pub cors_origins: Vec<String>,
}

impl Config {
    pub fn from_env() -> Result<Self, ApiError> {
        Ok(Self {
            app_env: env_string("APP_ENV", "development"),
            api_host: env_string("API_HOST", "127.0.0.1").parse()?,
            api_port: env_string("API_PORT", "4000").parse()?,
            database_url: env_required("DATABASE_URL")?,
            redis_url: env_string("REDIS_URL", "redis://127.0.0.1:6379"),
            meili_url: env_string("MEILI_URL", "http://127.0.0.1:7700"),
            meili_api_key: env_optional("MEILI_API_KEY"),
            meili_books_index: env_string("MEILI_BOOKS_INDEX", "books"),
            jwt_secret: env_required("JWT_SECRET")?,
            jwt_issuer: env_string("JWT_ISSUER", "bookpie-api"),
            cors_origins: env_string("CORS_ORIGINS", "http://localhost:3000")
                .split(',')
                .map(str::trim)
                .filter(|origin| !origin.is_empty())
                .map(ToOwned::to_owned)
                .collect(),
        })
    }
}

fn env_required(key: &str) -> Result<String, ApiError> {
    env::var(key).map_err(|_| ApiError::Config(format!("{key} is required")))
}

fn env_string(key: &str, fallback: &str) -> String {
    env::var(key).unwrap_or_else(|_| fallback.to_owned())
}

fn env_optional(key: &str) -> Option<String> {
    env::var(key)
        .ok()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty())
}
