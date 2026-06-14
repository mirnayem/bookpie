use std::str::FromStr;

use sqlx::{PgPool, postgres::PgConnectOptions};

use crate::error::ApiError;

pub fn create_pg_pool(database_url: &str) -> Result<PgPool, ApiError> {
    let options = PgConnectOptions::from_str(database_url)
        .map_err(|error| ApiError::Config(format!("invalid DATABASE_URL: {error}")))?;

    Ok(PgPool::connect_lazy_with(options))
}
