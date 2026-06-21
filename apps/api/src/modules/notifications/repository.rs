use sqlx::{PgPool, Row, postgres::PgRow};
use crate::{error::ApiError, models::ids::UserId};

use super::model::NotificationEvent;

#[derive(Clone)]
pub struct NotificationRepository {
    pool: PgPool,
}

impl NotificationRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn events(&self, limit: i64) -> Result<Vec<NotificationEvent>, ApiError> {
        let rows = sqlx::query(
            r#"
            SELECT id, channel, recipient, subject, body, status, metadata, created_at, sent_at
            FROM notification_events
            ORDER BY created_at DESC
            LIMIT $1
            "#,
        )
        .bind(limit.clamp(1, 200))
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(event_from_row).collect())
    }

    pub async fn queue(
        &self,
        channel: &str,
        recipient: &str,
        subject: Option<&str>,
        body: &str,
        metadata: serde_json::Value,
    ) -> Result<NotificationEvent, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO notification_events (channel, recipient, subject, body, status, metadata)
            VALUES ($1, $2, $3, $4, 'queued', $5)
            RETURNING id, channel, recipient, subject, body, status, metadata, created_at, sent_at
            "#,
        )
        .bind(channel)
        .bind(recipient)
        .bind(subject)
        .bind(body)
        .bind(metadata)
        .fetch_one(&self.pool)
        .await?;
        Ok(event_from_row(row))
    }

    pub async fn register_push_token(
        &self,
        user_id: UserId,
        token: &str,
        platform: &str,
    ) -> Result<(), ApiError> {
        sqlx::query(
            r#"
            INSERT INTO push_tokens (user_id, token, platform, is_active)
            VALUES ($1, $2, $3, true)
            ON CONFLICT (token) DO UPDATE
            SET user_id = EXCLUDED.user_id,
                platform = EXCLUDED.platform,
                is_active = true,
                updated_at = now()
            "#,
        )
        .bind(user_id.0)
        .bind(token)
        .bind(platform)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

}

fn event_from_row(row: PgRow) -> NotificationEvent {
    NotificationEvent {
        id: row.get("id"),
        channel: row.get("channel"),
        recipient: row.get("recipient"),
        subject: row.get("subject"),
        body: row.get("body"),
        status: row.get("status"),
        metadata: row.get("metadata"),
        created_at: row.get("created_at"),
        sent_at: row.get("sent_at"),
    }
}
