use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId};

use super::model::{
    DeliveryEvent, DeliveryFeeQuote, DeliveryZone, FailedDeliveryRequest, ProofUploadRequest,
    Rider, UpsertDeliveryZoneRequest, UpsertRiderRequest,
};

#[derive(Clone)]
pub struct DeliveryRepository {
    pool: PgPool,
}

impl DeliveryRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn zones(&self) -> Result<Vec<DeliveryZone>, ApiError> {
        let rows = sqlx::query(
            "SELECT id, name, city, fee, is_active FROM delivery_zones ORDER BY city, name",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(zone_from_row).collect())
    }

    pub async fn create_zone(
        &self,
        payload: &UpsertDeliveryZoneRequest,
    ) -> Result<DeliveryZone, ApiError> {
        let row = sqlx::query(
            "INSERT INTO delivery_zones (name, city, fee, is_active) VALUES ($1, $2, $3, $4) RETURNING id, name, city, fee, is_active",
        )
        .bind(payload.name.trim())
        .bind(payload.city.trim())
        .bind(payload.fee)
        .bind(payload.is_active.unwrap_or(true))
        .fetch_one(&self.pool)
        .await?;
        Ok(zone_from_row(row))
    }

    pub async fn update_zone(
        &self,
        id: Uuid,
        payload: &UpsertDeliveryZoneRequest,
    ) -> Result<DeliveryZone, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE delivery_zones
            SET name = $2, city = $3, fee = $4, is_active = $5, updated_at = now()
            WHERE id = $1
            RETURNING id, name, city, fee, is_active
            "#,
        )
        .bind(id)
        .bind(payload.name.trim())
        .bind(payload.city.trim())
        .bind(payload.fee)
        .bind(payload.is_active.unwrap_or(true))
        .fetch_optional(&self.pool)
        .await?
        .ok_or(ApiError::NotFound)?;
        Ok(zone_from_row(row))
    }

    pub async fn fee_quote(&self, city: &str, subtotal: i32) -> Result<DeliveryFeeQuote, ApiError> {
        let row = sqlx::query(
            "SELECT fee FROM delivery_zones WHERE is_active = true AND city = $1 ORDER BY fee LIMIT 1",
        )
        .bind(city)
        .fetch_optional(&self.pool)
        .await?;
        let base_fee = row.map(|row| row.get("fee")).unwrap_or(120);
        let free_shipping = subtotal >= 2500;
        Ok(DeliveryFeeQuote {
            city: city.to_string(),
            fee: if free_shipping { 0 } else { base_fee },
            free_shipping,
        })
    }

    pub async fn riders(&self) -> Result<Vec<Rider>, ApiError> {
        let rows =
            sqlx::query("SELECT id, name, phone, status FROM riders ORDER BY created_at DESC")
                .fetch_all(&self.pool)
                .await?;
        Ok(rows.into_iter().map(rider_from_row).collect())
    }

    pub async fn create_rider(&self, payload: &UpsertRiderRequest) -> Result<Rider, ApiError> {
        let row = sqlx::query(
            "INSERT INTO riders (name, phone, status) VALUES ($1, $2, $3) RETURNING id, name, phone, status",
        )
        .bind(payload.name.trim())
        .bind(payload.phone.trim())
        .bind(payload.status.as_deref().unwrap_or("pending"))
        .fetch_one(&self.pool)
        .await?;
        Ok(rider_from_row(row))
    }

    pub async fn update_rider(
        &self,
        id: Uuid,
        payload: &UpsertRiderRequest,
    ) -> Result<Rider, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE riders SET name = $2, phone = $3, status = $4, updated_at = now()
            WHERE id = $1
            RETURNING id, name, phone, status
            "#,
        )
        .bind(id)
        .bind(payload.name.trim())
        .bind(payload.phone.trim())
        .bind(payload.status.as_deref().unwrap_or("active"))
        .fetch_optional(&self.pool)
        .await?
        .ok_or(ApiError::NotFound)?;
        Ok(rider_from_row(row))
    }

    pub async fn onboard_rider(&self, id: Uuid) -> Result<Rider, ApiError> {
        let row = sqlx::query(
            "UPDATE riders SET status = 'active', updated_at = now() WHERE id = $1 RETURNING id, name, phone, status",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(ApiError::NotFound)?;
        Ok(rider_from_row(row))
    }

    pub async fn rider_orders(&self) -> Result<Vec<DeliveryEvent>, ApiError> {
        self.events_by_statuses(&["assigned", "picked_up"]).await
    }

    pub async fn events_by_order(&self, order_id: Uuid) -> Result<Vec<DeliveryEvent>, ApiError> {
        let rows = sqlx::query(EVENTS_BY_ORDER)
            .bind(order_id)
            .fetch_all(&self.pool)
            .await?;
        Ok(rows.into_iter().map(event_from_row).collect())
    }

    pub async fn create_event(
        &self,
        order_id: Uuid,
        status: &str,
        latitude: Option<f64>,
        longitude: Option<f64>,
        note: Option<&str>,
    ) -> Result<DeliveryEvent, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO delivery_events (order_id, status, latitude, longitude, note)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, order_id, status, latitude, longitude, note, created_at
            "#,
        )
        .bind(order_id)
        .bind(status)
        .bind(latitude)
        .bind(longitude)
        .bind(note)
        .fetch_one(&self.pool)
        .await?;
        Ok(event_from_row(row))
    }

    pub async fn upload_proof(
        &self,
        actor: UserId,
        payload: &ProofUploadRequest,
    ) -> Result<DeliveryEvent, ApiError> {
        sqlx::query(
            "INSERT INTO delivery_proofs (order_id, proof_url, note, uploaded_by) VALUES ($1, $2, $3, $4)",
        )
        .bind(payload.order_id)
        .bind(payload.proof_url.trim())
        .bind(payload.note.as_deref())
        .bind(actor.0)
        .execute(&self.pool)
        .await?;
        self.create_event(
            payload.order_id,
            "proof_uploaded",
            None,
            None,
            payload.note.as_deref(),
        )
        .await
    }

    pub async fn fail_delivery(
        &self,
        actor: UserId,
        payload: &FailedDeliveryRequest,
    ) -> Result<DeliveryEvent, ApiError> {
        sqlx::query(
            "INSERT INTO failed_deliveries (order_id, reason, next_attempt_at, created_by) VALUES ($1, $2, $3, $4)",
        )
        .bind(payload.order_id)
        .bind(payload.reason.trim())
        .bind(payload.next_attempt_at)
        .bind(actor.0)
        .execute(&self.pool)
        .await?;
        self.create_event(
            payload.order_id,
            "failed",
            None,
            None,
            Some(payload.reason.trim()),
        )
        .await
    }

    async fn events_by_statuses(&self, statuses: &[&str]) -> Result<Vec<DeliveryEvent>, ApiError> {
        let rows = sqlx::query(
            r#"
            SELECT gen_random_uuid() AS id, da.order_id, da.status, NULL::DOUBLE PRECISION AS latitude,
                   NULL::DOUBLE PRECISION AS longitude, da.note, da.updated_at AS created_at
            FROM delivery_assignments da
            WHERE da.status = ANY($1)
            ORDER BY da.updated_at DESC
            "#,
        )
        .bind(statuses)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(event_from_row).collect())
    }
}

fn zone_from_row(row: PgRow) -> DeliveryZone {
    DeliveryZone {
        id: row.get("id"),
        name: row.get("name"),
        city: row.get("city"),
        fee: row.get("fee"),
        is_active: row.get("is_active"),
    }
}

fn rider_from_row(row: PgRow) -> Rider {
    Rider {
        id: row.get("id"),
        name: row.get("name"),
        phone: row.get("phone"),
        status: row.get("status"),
    }
}

fn event_from_row(row: PgRow) -> DeliveryEvent {
    DeliveryEvent {
        id: row.get("id"),
        order_id: row.get("order_id"),
        status: row.get("status"),
        latitude: row.get("latitude"),
        longitude: row.get("longitude"),
        note: row.get("note"),
        created_at: row.get("created_at"),
    }
}

const EVENTS_BY_ORDER: &str = r#"
    SELECT id, order_id, status, latitude, longitude, note, created_at
    FROM delivery_events
    WHERE order_id = $1
    ORDER BY created_at
"#;
