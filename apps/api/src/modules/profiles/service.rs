use sqlx::PgPool;
use uuid::Uuid;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{
        AdminCustomerSummary, CreateSavedCardRequest, CreateSavedPaymentMethodRequest,
        CustomerAddress, CustomerListQuery, CustomerProfile, SavedCard, SavedPaymentMethod,
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

    pub async fn saved_cards(&self, user_id: UserId) -> Result<Vec<SavedCard>, ApiError> {
        self.repository.saved_cards(user_id).await
    }

    pub async fn create_saved_card(
        &self,
        user_id: UserId,
        payload: CreateSavedCardRequest,
    ) -> Result<SavedCard, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        validate_saved_card(&payload)?;
        self.repository.create_saved_card(user_id, &payload).await
    }

    pub async fn set_default_saved_card(
        &self,
        user_id: UserId,
        card_id: Uuid,
    ) -> Result<SavedCard, ApiError> {
        self.repository
            .set_default_saved_card(user_id, card_id)
            .await
    }

    pub async fn delete_saved_card(&self, user_id: UserId, card_id: Uuid) -> Result<(), ApiError> {
        self.repository.delete_saved_card(user_id, card_id).await
    }

    pub async fn saved_payment_methods(
        &self,
        user_id: UserId,
    ) -> Result<Vec<SavedPaymentMethod>, ApiError> {
        self.repository.saved_payment_methods(user_id).await
    }

    pub async fn create_saved_payment_method(
        &self,
        user_id: UserId,
        payload: CreateSavedPaymentMethodRequest,
    ) -> Result<SavedPaymentMethod, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        validate_saved_payment_method(&payload)?;
        self.repository
            .create_saved_payment_method(user_id, &payload)
            .await
    }

    pub async fn set_default_saved_payment_method(
        &self,
        user_id: UserId,
        method_id: Uuid,
    ) -> Result<SavedPaymentMethod, ApiError> {
        self.repository
            .set_default_saved_payment_method(user_id, method_id)
            .await
    }

    pub async fn delete_saved_payment_method(
        &self,
        user_id: UserId,
        method_id: Uuid,
    ) -> Result<(), ApiError> {
        self.repository
            .delete_saved_payment_method(user_id, method_id)
            .await
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

fn validate_saved_card(payload: &CreateSavedCardRequest) -> Result<(), ApiError> {
    if !matches!(payload.provider.as_str(), "sslcommerz" | "bkash" | "manual") {
        return Err(ApiError::Validation(
            "saved card provider must be sslcommerz, bkash, or manual".to_string(),
        ));
    }

    if !payload
        .last4
        .chars()
        .all(|character| character.is_ascii_digit())
    {
        return Err(ApiError::Validation(
            "saved card last4 must contain exactly four digits".to_string(),
        ));
    }

    Ok(())
}

fn validate_saved_payment_method(
    payload: &CreateSavedPaymentMethodRequest,
) -> Result<(), ApiError> {
    if !matches!(
        payload.provider.as_str(),
        "sslcommerz" | "bkash" | "nagad" | "manual"
    ) {
        return Err(ApiError::Validation(
            "payment provider must be sslcommerz, bkash, nagad, or manual".to_string(),
        ));
    }

    if !matches!(
        payload.method_type.as_str(),
        "card" | "mobile_wallet" | "cash_on_delivery"
    ) {
        return Err(ApiError::Validation(
            "payment method type must be card, mobile_wallet, or cash_on_delivery".to_string(),
        ));
    }

    if payload.method_type == "mobile_wallet" && payload.wallet_phone.is_none() {
        return Err(ApiError::Validation(
            "mobile wallet payment methods require walletPhone".to_string(),
        ));
    }

    Ok(())
}
