use axum::{
    Json, Router,
    extract::State,
    routing::{get, post},
};

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{
        MarketingNotificationRequest, NotificationEvent, OrderNotificationRequest,
        RegisterPushTokenRequest, SendNotificationRequest,
    },
    service::NotificationService,
};

pub fn notification_router() -> Router<AppState> {
    Router::new()
        .route("/notifications/push-token", post(register_push_token))
        .route("/admin/notifications", get(events))
        .route("/admin/notifications/email", post(send_email))
        .route("/admin/notifications/sms", post(send_sms))
        .route("/admin/notifications/push", post(send_push))
        .route("/admin/notifications/whatsapp", post(send_whatsapp))
        .route("/admin/notifications/order", post(order_notification))
        .route("/admin/notifications/marketing", post(marketing_notifications))
}

async fn events(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<NotificationEvent>>>, ApiError> {
    user.require_admin()?;
    let service = NotificationService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.events().await?)))
}

async fn send_email(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<SendNotificationRequest>,
) -> Result<Json<ApiResponse<NotificationEvent>>, ApiError> {
    user.require_admin()?;
    send_channel(state, "email", payload).await
}

async fn send_sms(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<SendNotificationRequest>,
) -> Result<Json<ApiResponse<NotificationEvent>>, ApiError> {
    user.require_admin()?;
    send_channel(state, "sms", payload).await
}

async fn send_push(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<SendNotificationRequest>,
) -> Result<Json<ApiResponse<NotificationEvent>>, ApiError> {
    user.require_admin()?;
    send_channel(state, "push", payload).await
}

async fn send_whatsapp(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<SendNotificationRequest>,
) -> Result<Json<ApiResponse<NotificationEvent>>, ApiError> {
    user.require_admin()?;
    send_channel(state, "whatsapp", payload).await
}

async fn send_channel(
    state: AppState,
    channel: &str,
    payload: SendNotificationRequest,
) -> Result<Json<ApiResponse<NotificationEvent>>, ApiError> {
    let service = NotificationService::new(state.pg_pool);
    Ok(Json(ApiResponse::ok(service.send(channel, payload).await?)))
}

async fn order_notification(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<OrderNotificationRequest>,
) -> Result<Json<ApiResponse<NotificationEvent>>, ApiError> {
    user.require_admin()?;
    let service = NotificationService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.order_notification(payload).await?,
    )))
}

async fn marketing_notifications(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<MarketingNotificationRequest>,
) -> Result<Json<ApiResponse<Vec<NotificationEvent>>>, ApiError> {
    user.require_admin()?;
    let service = NotificationService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.marketing_notifications(payload).await?,
    )))
}

async fn register_push_token(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<RegisterPushTokenRequest>,
) -> Result<Json<ApiResponse<()>>, ApiError> {
    let service = NotificationService::new(state.pg_pool.clone());
    service.register_push_token(user.id, payload).await?;
    Ok(Json(ApiResponse::ok(())))
}
