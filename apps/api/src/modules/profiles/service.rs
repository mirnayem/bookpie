use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{
        AdminCustomerSummary, CustomerAddress, CustomerListQuery, CustomerProfile,
        UpdateProfileRequest, UpsertAddressRequest,
    },
    repository::ProfileRepository,
};

#[derive(Clone)]
pub struct ProfileService {
    repository: ProfileRepository,
}

impl ProfileService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: ProfileRepository::new(pool),
        }
    }

    pub async fn profile(&self, user_id: UserId) -> Result<CustomerProfile, ApiError> {
        self.repository.profile(user_id).await
    }

    pub async fn update_profile(
        &self,
        user_id: UserId,
        payload: UpdateProfileRequest,
    ) -> Result<CustomerProfile, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.update_profile(user_id, &payload).await
    }

    pub async fn create_address(
        &self,
        user_id: UserId,
        payload: UpsertAddressRequest,
    ) -> Result<CustomerAddress, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.create_address(user_id, &payload).await
    }

    pub async fn update_address(
        &self,
        user_id: UserId,
        address_id: Uuid,
        payload: UpsertAddressRequest,
    ) -> Result<CustomerAddress, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .update_address(user_id, address_id, &payload)
            .await
    }

    pub async fn delete_address(&self, user_id: UserId, address_id: Uuid) -> Result<(), ApiError> {
        self.repository.delete_address(user_id, address_id).await
    }

    pub async fn list_customers(
        &self,
        query: CustomerListQuery,
    ) -> Result<Vec<AdminCustomerSummary>, ApiError> {
        self.repository
            .list_customers(query.limit(), query.offset(), query.search())
            .await
    }
}
