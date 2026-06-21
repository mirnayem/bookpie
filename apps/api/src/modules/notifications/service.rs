use serde_json::json;
use sqlx::PgPool;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{
        MarketingNotificationRequest, NotificationEvent, OrderNotificationRequest,
        RegisterPushTokenRequest, SendNotificationRequest,
    },
    repository::NotificationRepository,
};

#[derive(Clone)]
pub struct NotificationService {
    repository: NotificationRepository,
}

impl NotificationService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: NotificationRepository::new(pool),
        }
    }

    pub async fn events(&self) -> Result<Vec<NotificationEvent>, ApiError> {
        self.repository.events(100).await
    }

    pub async fn send(
        &self,
        channel: &str,
        payload: SendNotificationRequest,
    ) -> Result<NotificationEvent, ApiError> {
        validate_channel(channel)?;
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .queue(
                channel,
                payload.recipient.trim(),
                payload.subject.as_deref(),
                payload.body.trim(),
                payload.metadata.unwrap_or_else(|| json!({ "mockReady": true })),
            )
            .await
    }

    pub async fn order_notification(
        &self,
        payload: OrderNotificationRequest,
    ) -> Result<NotificationEvent, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let body = format!("Order {} update: {}", payload.order_id, payload.event);
        self.repository
            .queue(
                "email",
                payload.recipient.trim(),
                Some("BookPie order update"),
                &body,
                json!({ "orderId": payload.order_id, "event": payload.event }),
            )
            .await
    }

    pub async fn marketing_notifications(
        &self,
        payload: MarketingNotificationRequest,
    ) -> Result<Vec<NotificationEvent>, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let mut events = Vec::new();
        for channel in &payload.channels {
            validate_channel(channel)?;
            for recipient in &payload.recipients {
                events.push(
                    self.repository
                        .queue(
                            channel,
                            recipient.trim(),
                            Some(payload.subject.trim()),
                            payload.body.trim(),
                            json!({ "campaignType": "marketing" }),
                        )
                        .await?,
                );
            }
        }
        Ok(events)
    }

    pub async fn register_push_token(
        &self,
        user_id: UserId,
        payload: RegisterPushTokenRequest,
    ) -> Result<(), ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        if !matches!(payload.platform.as_str(), "web" | "ios" | "android") {
            return Err(ApiError::Validation("invalid platform".to_string()));
        }
        self.repository
            .register_push_token(user_id, payload.token.trim(), payload.platform.as_str())
            .await
    }
}

fn validate_channel(channel: &str) -> Result<(), ApiError> {
    if matches!(channel, "email" | "sms" | "push" | "whatsapp") {
        return Ok(());
    }
    Err(ApiError::Validation("invalid notification channel".to_string()))
}
