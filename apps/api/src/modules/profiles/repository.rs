use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId};

use super::model::{
    AdminCustomerSummary, CustomerAddress, CustomerProfile, UpdateProfileRequest,
    UpsertAddressRequest,
};

#[derive(Clone)]
pub struct ProfileRepository {
    pool: PgPool,
}

impl ProfileRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn profile(&self, user_id: UserId) -> Result<CustomerProfile, ApiError> {
        self.ensure_profile(user_id).await?;
        let row = sqlx::query(PROFILE_SELECT)
            .bind(user_id.0)
            .fetch_one(&self.pool)
            .await?;
        let addresses = self.addresses(user_id).await?;

        Ok(profile_from_row(row, addresses))
    }

    pub async fn update_profile(
        &self,
        user_id: UserId,
        payload: &UpdateProfileRequest,
    ) -> Result<CustomerProfile, ApiError> {
        self.ensure_profile(user_id).await?;
        sqlx::query(
            r#"
            UPDATE customer_profiles
            SET display_name = $2,
                phone = $3,
                date_of_birth = $4,
                updated_at = now()
            WHERE user_id = $1
            "#,
        )
        .bind(user_id.0)
        .bind(payload.display_name.as_deref())
        .bind(payload.phone.as_deref())
        .bind(payload.date_of_birth)
        .execute(&self.pool)
        .await?;

        self.profile(user_id).await
    }

    pub async fn addresses(&self, user_id: UserId) -> Result<Vec<CustomerAddress>, ApiError> {
        let rows = sqlx::query(
            r#"
            SELECT id, user_id, label, recipient_name, phone, address_line1, address_line2,
                   city, zone, postal_code, latitude, longitude, is_default
            FROM customer_addresses
            WHERE user_id = $1
            ORDER BY is_default DESC, created_at DESC
            "#,
        )
        .bind(user_id.0)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(address_from_row).collect())
    }

    pub async fn create_address(
        &self,
        user_id: UserId,
        payload: &UpsertAddressRequest,
    ) -> Result<CustomerAddress, ApiError> {
        let mut transaction = self.pool.begin().await?;

        if payload.is_default {
            clear_default_address(&mut transaction, user_id.0).await?;
        }

        let row = sqlx::query(INSERT_ADDRESS)
            .bind(user_id.0)
            .bind(payload.label.trim())
            .bind(payload.recipient_name.trim())
            .bind(payload.phone.trim())
            .bind(payload.address_line1.trim())
            .bind(payload.address_line2.as_deref())
            .bind(payload.city.trim())
            .bind(payload.zone.as_deref())
            .bind(payload.postal_code.as_deref())
            .bind(payload.latitude)
            .bind(payload.longitude)
            .bind(payload.is_default)
            .fetch_one(&mut *transaction)
            .await?;

        transaction.commit().await?;
        Ok(address_from_row(row))
    }

    pub async fn update_address(
        &self,
        user_id: UserId,
        address_id: Uuid,
        payload: &UpsertAddressRequest,
    ) -> Result<CustomerAddress, ApiError> {
        let mut transaction = self.pool.begin().await?;

        if payload.is_default {
            clear_default_address(&mut transaction, user_id.0).await?;
        }

        let row = sqlx::query(UPDATE_ADDRESS)
            .bind(address_id)
            .bind(user_id.0)
            .bind(payload.label.trim())
            .bind(payload.recipient_name.trim())
            .bind(payload.phone.trim())
            .bind(payload.address_line1.trim())
            .bind(payload.address_line2.as_deref())
            .bind(payload.city.trim())
            .bind(payload.zone.as_deref())
            .bind(payload.postal_code.as_deref())
            .bind(payload.latitude)
            .bind(payload.longitude)
            .bind(payload.is_default)
            .fetch_optional(&mut *transaction)
            .await?;

        transaction.commit().await?;
        row.map(address_from_row).ok_or(ApiError::NotFound)
    }

    pub async fn delete_address(&self, user_id: UserId, address_id: Uuid) -> Result<(), ApiError> {
        let result = sqlx::query("DELETE FROM customer_addresses WHERE id = $1 AND user_id = $2")
            .bind(address_id)
            .bind(user_id.0)
            .execute(&self.pool)
            .await?;

        if result.rows_affected() == 0 {
            return Err(ApiError::NotFound);
        }

        Ok(())
    }

    pub async fn list_customers(
        &self,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<AdminCustomerSummary>, ApiError> {
        let rows = sqlx::query(
            r#"
            SELECT u.id, u.name, u.email, cp.phone, COUNT(ca.id)::BIGINT AS address_count
            FROM users u
            LEFT JOIN customer_profiles cp ON cp.user_id = u.id
            LEFT JOIN customer_addresses ca ON ca.user_id = u.id
            WHERE u.role = 'customer'
            GROUP BY u.id, cp.phone
            ORDER BY u.created_at DESC
            LIMIT $1 OFFSET $2
            "#,
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows.into_iter().map(customer_summary_from_row).collect())
    }

    async fn ensure_profile(&self, user_id: UserId) -> Result<(), ApiError> {
        sqlx::query(
            r#"
            INSERT INTO customer_profiles (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
            "#,
        )
        .bind(user_id.0)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}

async fn clear_default_address(
    transaction: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    user_id: Uuid,
) -> Result<(), ApiError> {
    sqlx::query("UPDATE customer_addresses SET is_default = false WHERE user_id = $1")
        .bind(user_id)
        .execute(&mut **transaction)
        .await?;
    Ok(())
}

fn profile_from_row(row: PgRow, addresses: Vec<CustomerAddress>) -> CustomerProfile {
    CustomerProfile {
        user_id: row.get("user_id"),
        name: row.get("name"),
        email: row.get("email"),
        display_name: row.get("display_name"),
        phone: row.get("phone"),
        date_of_birth: row.get("date_of_birth"),
        addresses,
    }
}

fn address_from_row(row: PgRow) -> CustomerAddress {
    CustomerAddress {
        id: row.get("id"),
        user_id: row.get("user_id"),
        label: row.get("label"),
        recipient_name: row.get("recipient_name"),
        phone: row.get("phone"),
        address_line1: row.get("address_line1"),
        address_line2: row.get("address_line2"),
        city: row.get("city"),
        zone: row.get("zone"),
        postal_code: row.get("postal_code"),
        latitude: row.get("latitude"),
        longitude: row.get("longitude"),
        is_default: row.get("is_default"),
    }
}

fn customer_summary_from_row(row: PgRow) -> AdminCustomerSummary {
    AdminCustomerSummary {
        id: row.get("id"),
        name: row.get("name"),
        email: row.get("email"),
        phone: row.get("phone"),
        address_count: row.get("address_count"),
    }
}

const PROFILE_SELECT: &str = r#"
    SELECT u.id AS user_id, u.name, u.email, cp.display_name, cp.phone, cp.date_of_birth
    FROM users u
    LEFT JOIN customer_profiles cp ON cp.user_id = u.id
    WHERE u.id = $1
"#;

const INSERT_ADDRESS: &str = r#"
    INSERT INTO customer_addresses (
        user_id, label, recipient_name, phone, address_line1, address_line2,
        city, zone, postal_code, latitude, longitude, is_default
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id, user_id, label, recipient_name, phone, address_line1, address_line2,
              city, zone, postal_code, latitude, longitude, is_default
"#;

const UPDATE_ADDRESS: &str = r#"
    UPDATE customer_addresses
    SET label = $3,
        recipient_name = $4,
        phone = $5,
        address_line1 = $6,
        address_line2 = $7,
        city = $8,
        zone = $9,
        postal_code = $10,
        latitude = $11,
        longitude = $12,
        is_default = $13,
        updated_at = now()
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, label, recipient_name, phone, address_line1, address_line2,
              city, zone, postal_code, latitude, longitude, is_default
"#;
