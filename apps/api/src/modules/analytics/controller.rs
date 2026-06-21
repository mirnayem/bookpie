use axum::{Json, Router, extract::State, routing::get};

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{
        CohortReport, DashboardMetrics, DeliveryReport, InventoryReport, MoneyReport,
        RetentionReport, WarehouseReport,
    },
    service::AnalyticsService,
};

pub fn analytics_router() -> Router<AppState> {
    Router::new()
        .route("/admin/analytics/dashboard", get(dashboard))
        .route("/admin/analytics/gmv", get(gmv_report))
        .route("/admin/analytics/revenue", get(revenue_report))
        .route("/admin/analytics/inventory", get(inventory_report))
        .route("/admin/analytics/warehouse", get(warehouse_report))
        .route("/admin/analytics/delivery", get(delivery_report))
        .route("/admin/analytics/cohorts", get(cohort_report))
        .route("/admin/analytics/retention", get(retention_report))
}

async fn dashboard(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<DashboardMetrics>>, ApiError> {
    user.require_admin()?;
    let service = AnalyticsService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.dashboard().await?)))
}

async fn gmv_report(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<MoneyReport>>, ApiError> {
    user.require_admin()?;
    let service = AnalyticsService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.money_report().await?)))
}

async fn revenue_report(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<MoneyReport>>, ApiError> {
    user.require_admin()?;
    let service = AnalyticsService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.money_report().await?)))
}

async fn inventory_report(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<InventoryReport>>, ApiError> {
    user.require_admin()?;
    let service = AnalyticsService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.inventory_report().await?)))
}

async fn warehouse_report(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<WarehouseReport>>, ApiError> {
    user.require_admin()?;
    let service = AnalyticsService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.warehouse_report().await?)))
}

async fn delivery_report(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<DeliveryReport>>, ApiError> {
    user.require_admin()?;
    let service = AnalyticsService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.delivery_report().await?)))
}

async fn cohort_report(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<CohortReport>>, ApiError> {
    user.require_admin()?;
    let service = AnalyticsService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.cohort_report().await?)))
}

async fn retention_report(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<RetentionReport>>, ApiError> {
    user.require_admin()?;
    let service = AnalyticsService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.retention_report().await?)))
}
