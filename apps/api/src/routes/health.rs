use axum::{Json, Router, extract::State, routing::get};
use serde::Serialize;
use sqlx::Executor;

use crate::{error::ApiError, response::ApiResponse, state::AppState};

pub fn health_router() -> Router<AppState> {
    Router::new()
        .route("/live", get(live))
        .route("/ready", get(ready))
}

#[derive(Debug, Serialize)]
struct HealthPayload {
    status: &'static str,
    app_env: String,
}

async fn live(State(state): State<AppState>) -> Json<ApiResponse<HealthPayload>> {
    Json(ApiResponse::ok(HealthPayload {
        status: "ok",
        app_env: state.config.app_env,
    }))
}

#[derive(Debug, Serialize)]
struct ReadinessPayload {
    postgres: &'static str,
    redis: &'static str,
}

async fn ready(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<ReadinessPayload>>, ApiError> {
    state.pg_pool.execute("SELECT 1").await?;

    let mut redis = state
        .redis_client
        .get_multiplexed_async_connection()
        .await?;
    let _: String = redis::cmd("PING").query_async(&mut redis).await?;

    Ok(Json(ApiResponse::ok(ReadinessPayload {
        postgres: "ok",
        redis: "ok",
    })))
}
