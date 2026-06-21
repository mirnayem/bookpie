use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{
        DeliveryEvent, DeliveryEventRequest, DeliveryFeeQuote, DeliveryFeeRequest, DeliveryZone,
        FailedDeliveryRequest, ProofUploadRequest, Rider, RoutePlan, RoutePlanRequest,
        UpsertDeliveryZoneRequest, UpsertRiderRequest,
    },
    repository::DeliveryRepository,
};

#[derive(Clone)]
pub struct DeliveryService {
    repository: DeliveryRepository,
}

impl DeliveryService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: DeliveryRepository::new(pool),
        }
    }

    pub async fn zones(&self) -> Result<Vec<DeliveryZone>, ApiError> {
        self.repository.zones().await
    }

    pub async fn create_zone(
        &self,
        payload: UpsertDeliveryZoneRequest,
    ) -> Result<DeliveryZone, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.create_zone(&payload).await
    }

    pub async fn update_zone(
        &self,
        id: Uuid,
        payload: UpsertDeliveryZoneRequest,
    ) -> Result<DeliveryZone, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.update_zone(id, &payload).await
    }

    pub async fn fee_quote(
        &self,
        payload: DeliveryFeeRequest,
    ) -> Result<DeliveryFeeQuote, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .fee_quote(payload.city.trim(), payload.subtotal)
            .await
    }

    pub async fn riders(&self) -> Result<Vec<Rider>, ApiError> {
        self.repository.riders().await
    }

    pub async fn create_rider(&self, payload: UpsertRiderRequest) -> Result<Rider, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.create_rider(&payload).await
    }

    pub async fn update_rider(
        &self,
        id: Uuid,
        payload: UpsertRiderRequest,
    ) -> Result<Rider, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.update_rider(id, &payload).await
    }

    pub async fn onboard_rider(&self, id: Uuid) -> Result<Rider, ApiError> {
        self.repository.onboard_rider(id).await
    }

    pub async fn rider_orders(&self) -> Result<Vec<DeliveryEvent>, ApiError> {
        self.repository.rider_orders().await
    }

    pub async fn route_plan(&self, payload: RoutePlanRequest) -> Result<RoutePlan, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        let mut order_ids = payload.order_ids;
        order_ids.sort();
        Ok(RoutePlan {
            estimated_minutes: (order_ids.len() as i32 * 18).max(20),
            order_ids,
        })
    }

    pub async fn tracking(&self, order_id: Uuid) -> Result<Vec<DeliveryEvent>, ApiError> {
        self.repository.events_by_order(order_id).await
    }

    pub async fn create_event(
        &self,
        payload: DeliveryEventRequest,
    ) -> Result<DeliveryEvent, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .create_event(
                payload.order_id,
                payload.status.trim(),
                payload.latitude,
                payload.longitude,
                payload.note.as_deref(),
            )
            .await
    }

    pub async fn upload_proof(
        &self,
        actor: UserId,
        payload: ProofUploadRequest,
    ) -> Result<DeliveryEvent, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.upload_proof(actor, &payload).await
    }

    pub async fn fail_delivery(
        &self,
        actor: UserId,
        payload: FailedDeliveryRequest,
    ) -> Result<DeliveryEvent, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.fail_delivery(actor, &payload).await
    }
}
