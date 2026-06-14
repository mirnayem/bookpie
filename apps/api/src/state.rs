use sqlx::PgPool;

use crate::{cache, config::Config, db, error::ApiError};

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub pg_pool: PgPool,
    pub redis_client: redis::Client,
}

impl AppState {
    pub fn new(config: Config) -> Result<Self, ApiError> {
        let pg_pool = db::create_pg_pool(&config.database_url)?;
        let redis_client = cache::create_redis_client(&config.redis_url)?;

        Ok(Self {
            config,
            pg_pool,
            redis_client,
        })
    }
}
