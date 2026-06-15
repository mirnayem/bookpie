use axum::{Json, Router, extract::State, routing::get};

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
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
    let service = AdminService::new(state.pg_pool.clone());
    let summary = service.dashboard_summary().await?;
    Ok(Json(ApiResponse::ok(summary)))
}
