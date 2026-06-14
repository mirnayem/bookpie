use crate::error::ApiError;

pub fn create_redis_client(redis_url: &str) -> Result<redis::Client, ApiError> {
    redis::Client::open(redis_url).map_err(ApiError::from)
}
