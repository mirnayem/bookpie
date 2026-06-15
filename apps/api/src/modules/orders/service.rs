use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{
        AssignDeliveryRequest, CreateOrderRequest, Order, OrderListQuery, UpdateOrderStatusRequest,
    },
    repository::OrderRepository,
};

#[derive(Clone)]
pub struct OrderService {
    repository: OrderRepository,
}

impl OrderService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: OrderRepository::new(pool),
        }
    }

    pub async fn create_order(
        &self,
        user_id: UserId,
        payload: CreateOrderRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .create_from_cart(user_id, payload.address_id, payload.payment_provider)
            .await
    }

    pub async fn user_orders(&self, user_id: UserId) -> Result<Vec<Order>, ApiError> {
        self.repository.user_orders(user_id).await
    }

    pub async fn user_order(&self, user_id: UserId, order_id: Uuid) -> Result<Order, ApiError> {
        self.repository.user_order(user_id, order_id).await
    }

    pub async fn admin_orders(&self, query: OrderListQuery) -> Result<Vec<Order>, ApiError> {
        let limit = query.limit();
        let offset = query.offset();
        self.repository
            .admin_orders(query.status, limit, offset)
            .await
    }

    pub async fn admin_order(&self, order_id: Uuid) -> Result<Order, ApiError> {
        self.repository.admin_order(order_id).await
    }

    pub async fn update_status(
        &self,
        order_id: Uuid,
        actor: UserId,
        payload: UpdateOrderStatusRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_status(order_id, payload.status, payload.note.as_deref(), actor)
            .await
    }

    pub async fn assign_delivery(
        &self,
        order_id: Uuid,
        actor: UserId,
        payload: AssignDeliveryRequest,
    ) -> Result<Order, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .assign_delivery(order_id, &payload, actor)
            .await
    }
}
