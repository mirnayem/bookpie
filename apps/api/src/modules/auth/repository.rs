use chrono::{DateTime, Utc};
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::{
    error::ApiError,
    middleware::auth::UserRole,
    modules::auth::model::{AdminUpdateUserRequest, OtpPurpose, RegisterRequest, UserRecord},
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
            SELECT id, name, email, password_hash, role, is_active, created_at
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
            SELECT id, name, email, password_hash, role, is_active, created_at
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
            RETURNING id, name, email, password_hash, role, is_active, created_at
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

    pub async fn admin_update_user(
        &self,
        id: Uuid,
        payload: &AdminUpdateUserRequest,
    ) -> Result<UserRecord, ApiError> {
        let existing = self.find_user_by_id(id).await?.ok_or(ApiError::NotFound)?;
        let role = payload.role.clone().unwrap_or(existing.role);
        let is_active = payload.is_active.unwrap_or(existing.is_active);
        let row = sqlx::query(
            r#"
            UPDATE users
            SET role = $2, is_active = $3, updated_at = now()
            WHERE id = $1
            RETURNING id, name, email, password_hash, role, is_active, created_at
            "#,
        )
        .bind(id)
        .bind(role_as_str(&role))
        .bind(is_active)
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

    pub async fn revoke_all_refresh_tokens(&self, user_id: Uuid) -> Result<(), ApiError> {
        sqlx::query(
            r#"
            UPDATE refresh_tokens
            SET revoked_at = now()
            WHERE user_id = $1
              AND revoked_at IS NULL
            "#,
        )
        .bind(user_id)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn store_password_reset_token(
        &self,
        user_id: Uuid,
        token_hash: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), ApiError> {
        sqlx::query(
            r#"
            INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
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

    pub async fn consume_password_reset_token(
        &self,
        token_hash: &str,
    ) -> Result<Option<Uuid>, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE password_reset_tokens
            SET used_at = now()
            WHERE token_hash = $1
              AND used_at IS NULL
              AND expires_at > now()
            RETURNING user_id
            "#,
        )
        .bind(token_hash)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|row| row.get("user_id")))
    }

    pub async fn update_password(
        &self,
        user_id: Uuid,
        password_hash: &str,
    ) -> Result<(), ApiError> {
        let result = sqlx::query(
            r#"
            UPDATE users
            SET password_hash = $2,
                updated_at = now()
            WHERE id = $1
            "#,
        )
        .bind(user_id)
        .bind(password_hash)
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(ApiError::NotFound);
        }

        Ok(())
    }

    pub async fn store_otp(
        &self,
        user_id: Uuid,
        purpose: &OtpPurpose,
        destination: &str,
        code_hash: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), ApiError> {
        sqlx::query(
            r#"
            INSERT INTO auth_otps (id, user_id, purpose, destination, code_hash, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_id)
        .bind(purpose.as_str())
        .bind(destination)
        .bind(code_hash)
        .bind(expires_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn consume_otp(
        &self,
        user_id: Uuid,
        purpose: &OtpPurpose,
        code_hash: &str,
    ) -> Result<bool, ApiError> {
        let result = sqlx::query(
            r#"
            UPDATE auth_otps
            SET consumed_at = now()
            WHERE user_id = $1
              AND purpose = $2
              AND code_hash = $3
              AND consumed_at IS NULL
              AND expires_at > now()
            "#,
        )
        .bind(user_id)
        .bind(purpose.as_str())
        .bind(code_hash)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn mark_verified(&self, user_id: Uuid, purpose: &OtpPurpose) -> Result<(), ApiError> {
        let statement = match purpose {
            OtpPurpose::EmailVerification => {
                "UPDATE users SET email_verified_at = now(), updated_at = now() WHERE id = $1"
            }
            OtpPurpose::PhoneVerification => {
                "UPDATE users SET phone_verified_at = now(), updated_at = now() WHERE id = $1"
            }
        };

        sqlx::query(statement)
            .bind(user_id)
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
        is_active: row.get("is_active"),
        created_at: row.get("created_at"),
    })
}

fn parse_role(role: &str) -> Result<UserRole, ApiError> {
    match role {
        "customer" => Ok(UserRole::Customer),
        "warehouse_manager" => Ok(UserRole::WarehouseManager),
        "delivery_agent" => Ok(UserRole::DeliveryAgent),
        "admin" => Ok(UserRole::Admin),
        "super_admin" => Ok(UserRole::SuperAdmin),
        other => Err(ApiError::Config(format!(
            "unknown user role in database: {other}"
        ))),
    }
}

fn role_as_str(role: &UserRole) -> &'static str {
    match role {
        UserRole::Customer => "customer",
        UserRole::WarehouseManager => "warehouse_manager",
        UserRole::DeliveryAgent => "delivery_agent",
        UserRole::Admin => "admin",
        UserRole::SuperAdmin => "super_admin",
    }
}

impl OtpPurpose {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::EmailVerification => "email_verification",
            Self::PhoneVerification => "phone_verification",
        }
    }
}
