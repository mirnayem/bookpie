use chrono::{DateTime, Utc};
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::{
    error::ApiError,
    middleware::auth::UserRole,
    modules::auth::model::{RegisterRequest, UserRecord},
};

#[derive(Clone)]
pub struct AuthRepository {
    pool: PgPool,
}

impl AuthRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn find_user_by_email(&self, email: &str) -> Result<Option<UserRecord>, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT id, name, email, password_hash, role, created_at
            FROM users
            WHERE lower(email) = lower($1)
            "#,
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await?;

        row.map(user_from_row).transpose()
    }

    pub async fn find_user_by_id(&self, id: Uuid) -> Result<Option<UserRecord>, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT id, name, email, password_hash, role, created_at
            FROM users
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        row.map(user_from_row).transpose()
    }

    pub async fn create_user(
        &self,
        payload: &RegisterRequest,
        password_hash: &str,
    ) -> Result<UserRecord, ApiError> {
        let id = Uuid::new_v4();
        let row = sqlx::query(
            r#"
            INSERT INTO users (id, name, email, password_hash, role)
            VALUES ($1, $2, lower($3), $4, 'customer')
            RETURNING id, name, email, password_hash, role, created_at
            "#,
        )
        .bind(id)
        .bind(payload.name.trim())
        .bind(payload.email.trim())
        .bind(password_hash)
        .fetch_one(&self.pool)
        .await?;

        user_from_row(row)
    }

    pub async fn store_refresh_token(
        &self,
        user_id: Uuid,
        token_hash: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), ApiError> {
        sqlx::query(
            r#"
            INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
            VALUES ($1, $2, $3, $4)
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(token_hash)
        .bind(expires_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn find_active_refresh_user_id(
        &self,
        token_hash: &str,
    ) -> Result<Option<Uuid>, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT user_id
            FROM refresh_tokens
            WHERE token_hash = $1
              AND revoked_at IS NULL
              AND expires_at > now()
            "#,
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|row| row.get("user_id")))
    }

    pub async fn revoke_refresh_token(&self, token_hash: &str) -> Result<(), ApiError> {
        sqlx::query(
            r#"
            UPDATE refresh_tokens
            SET revoked_at = now()
            WHERE token_hash = $1
              AND revoked_at IS NULL
            "#,
        )
        .bind(token_hash)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}

fn user_from_row(row: sqlx::postgres::PgRow) -> Result<UserRecord, ApiError> {
    let role = parse_role(row.get::<String, _>("role").as_str())?;

    Ok(UserRecord {
        id: row.get("id"),
        name: row.get("name"),
        email: row.get("email"),
        password_hash: row.get("password_hash"),
        role,
        created_at: row.get("created_at"),
    })
}

fn parse_role(role: &str) -> Result<UserRole, ApiError> {
    match role {
        "customer" => Ok(UserRole::Customer),
        "admin" => Ok(UserRole::Admin),
        other => Err(ApiError::Config(format!(
            "unknown user role in database: {other}"
        ))),
    }
}
