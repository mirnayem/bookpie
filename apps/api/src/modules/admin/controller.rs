use axum::{Json, Router, extract::State, routing::get};

use crate::{
    cache, error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{model::AdminDashboardSummary, service::AdminService};

pub fn admin_router() -> Router<AppState> {
    Router::new().route("/admin/dashboard/summary", get(dashboard_summary))
}

async fn dashboard_summary(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<AdminDashboardSummary>>, ApiError> {
    user.require_admin()?;
    if let Ok(Some(summary)) = cache::get_json(&state.redis_client, "admin:dashboard:summary").await
    {
        return Ok(Json(ApiResponse::ok(summary)));
    }

    let service = AdminService::new(state.pg_pool.clone());
    let summary = service.dashboard_summary().await?;
    if let Err(error) =
        cache::set_json(&state.redis_client, "admin:dashboard:summary", &summary, 30).await
    {
        tracing::warn!(%error, "failed to cache admin dashboard summary");
    }
    Ok(Json(ApiResponse::ok(summary)))
}
