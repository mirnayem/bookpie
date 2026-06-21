use crate::error::ApiError;
use redis::AsyncCommands;
use serde::{Serialize, de::DeserializeOwned};

pub fn create_redis_client(redis_url: &str) -> Result<redis::Client, ApiError> {
    redis::Client::open(redis_url).map_err(ApiError::from)
}

pub async fn get_json<T: DeserializeOwned>(
    client: &redis::Client,
    key: &str,
) -> Result<Option<T>, ApiError> {
    let mut connection = client.get_multiplexed_async_connection().await?;
    let value: Option<String> = connection.get(key).await?;
    value
        .map(|json| {
            serde_json::from_str(&json).map_err(|error| ApiError::Config(error.to_string()))
        })
        .transpose()
}

pub async fn set_json<T: Serialize>(
    client: &redis::Client,
    key: &str,
    value: &T,
    ttl_seconds: u64,
) -> Result<(), ApiError> {
    let mut connection = client.get_multiplexed_async_connection().await?;
    let json = serde_json::to_string(value).map_err(|error| ApiError::Config(error.to_string()))?;
    let _: () = connection.set_ex(key, json, ttl_seconds).await?;
    Ok(())
}
