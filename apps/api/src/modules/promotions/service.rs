use sqlx::PgPool;
use validator::Validate;

use crate::{error::ApiError, models::ids::UserId};

use super::{
    model::{
        AdjustLoyaltyRequest, BuyXGetYRule, CashbackRule, Coupon, CouponValidation,
        CreateReferralRequest, FlashSaleCampaign, LoyaltyAccount, MembershipPlan, ReferralSummary,
        UpsertBuyXGetYRuleRequest, UpsertCashbackRuleRequest, UpsertCouponRequest,
        UpsertFlashSaleCampaignRequest, UpsertMembershipPlanRequest, ValidateCouponRequest,
    },
    repository::PromotionRepository,
};

#[derive(Clone)]
pub struct PromotionService {
    repository: PromotionRepository,
}

impl PromotionService {
    pub fn new(pool: PgPool) -> Self {
        Self {
            repository: PromotionRepository::new(pool),
        }
    }

    pub async fn coupons(&self) -> Result<Vec<Coupon>, ApiError> {
        self.repository.coupons().await
    }

    pub async fn create_coupon(&self, payload: UpsertCouponRequest) -> Result<Coupon, ApiError> {
        validate_coupon_payload(&payload)?;
        self.repository.create_coupon(&payload).await
    }

    pub async fn update_coupon(
        &self,
        id: uuid::Uuid,
        payload: UpsertCouponRequest,
    ) -> Result<Coupon, ApiError> {
        validate_coupon_payload(&payload)?;
        self.repository.update_coupon(id, &payload).await
    }

    pub async fn validate_coupon(
        &self,
        payload: ValidateCouponRequest,
    ) -> Result<CouponValidation, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .validate_coupon(
                &payload.code,
                payload.subtotal,
                payload.shipping_fee.unwrap_or_default(),
            )
            .await
    }

    pub async fn buy_x_get_y_rules(&self) -> Result<Vec<BuyXGetYRule>, ApiError> {
        self.repository.buy_x_get_y_rules().await
    }

    pub async fn create_buy_x_get_y(
        &self,
        payload: UpsertBuyXGetYRuleRequest,
    ) -> Result<BuyXGetYRule, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        if payload
            .starts_at
            .zip(payload.ends_at)
            .is_some_and(|(s, e)| e <= s)
        {
            return Err(ApiError::Validation(
                "endsAt must be after startsAt".to_string(),
            ));
        }
        self.repository.create_buy_x_get_y(&payload).await
    }

    pub async fn flash_sales(&self) -> Result<Vec<FlashSaleCampaign>, ApiError> {
        self.repository.flash_sales().await
    }

    pub async fn create_flash_sale(
        &self,
        payload: UpsertFlashSaleCampaignRequest,
    ) -> Result<FlashSaleCampaign, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        if payload.ends_at <= payload.starts_at {
            return Err(ApiError::Validation(
                "endsAt must be after startsAt".to_string(),
            ));
        }
        self.repository.create_flash_sale(&payload).await
    }

    pub async fn referral_summary(&self, user_id: UserId) -> Result<ReferralSummary, ApiError> {
        self.repository.referral_summary(user_id).await
    }

    pub async fn create_referral(
        &self,
        user_id: UserId,
        payload: CreateReferralRequest,
    ) -> Result<ReferralSummary, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .create_referral(user_id, &payload.code)
            .await
    }

    pub async fn loyalty_account(&self, user_id: UserId) -> Result<LoyaltyAccount, ApiError> {
        self.repository.loyalty_account(user_id).await
    }

    pub async fn adjust_loyalty(
        &self,
        payload: AdjustLoyaltyRequest,
    ) -> Result<LoyaltyAccount, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository
            .adjust_loyalty(
                payload.user_id,
                payload.points_delta,
                payload.reason.trim(),
                payload.order_id,
            )
            .await
    }

    pub async fn cashback_rules(&self) -> Result<Vec<CashbackRule>, ApiError> {
        self.repository.cashback_rules().await
    }

    pub async fn create_cashback_rule(
        &self,
        payload: UpsertCashbackRuleRequest,
    ) -> Result<CashbackRule, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        if payload
            .starts_at
            .zip(payload.ends_at)
            .is_some_and(|(s, e)| e <= s)
        {
            return Err(ApiError::Validation(
                "endsAt must be after startsAt".to_string(),
            ));
        }
        self.repository.create_cashback_rule(&payload).await
    }

    pub async fn membership_plans(&self) -> Result<Vec<MembershipPlan>, ApiError> {
        self.repository.membership_plans().await
    }

    pub async fn create_membership_plan(
        &self,
        payload: UpsertMembershipPlanRequest,
    ) -> Result<MembershipPlan, ApiError> {
        payload
            .validate()
            .map_err(|error| ApiError::Validation(error.to_string()))?;
        self.repository.create_membership_plan(&payload).await
    }
}

fn validate_coupon_payload(payload: &UpsertCouponRequest) -> Result<(), ApiError> {
    payload
        .validate()
        .map_err(|error| ApiError::Validation(error.to_string()))?;
    if !matches!(
        payload.discount_type.as_str(),
        "percent" | "fixed" | "free_shipping"
    ) {
        return Err(ApiError::Validation("invalid discountType".to_string()));
    }
    if payload.discount_type == "percent" && payload.discount_value > 100 {
        return Err(ApiError::Validation(
            "percent coupon cannot exceed 100".to_string(),
        ));
    }
    if payload
        .starts_at
        .zip(payload.ends_at)
        .is_some_and(|(s, e)| e <= s)
    {
        return Err(ApiError::Validation(
            "endsAt must be after startsAt".to_string(),
        ));
    }
    Ok(())
}
