use axum::{
    Json, Router,
    extract::{Path, State},
    routing::{get, patch, post},
};
use uuid::Uuid;

use crate::{
    error::ApiError, middleware::auth::CurrentUser, response::ApiResponse, state::AppState,
};

use super::{
    model::{
        AdjustLoyaltyRequest, BuyXGetYRule, CashbackRule, Coupon, CouponValidation,
        CreateReferralRequest, FlashSaleCampaign, LoyaltyAccount, MembershipPlan, ReferralSummary,
        UpsertBuyXGetYRuleRequest, UpsertCashbackRuleRequest, UpsertCouponRequest,
        UpsertFlashSaleCampaignRequest, UpsertMembershipPlanRequest, ValidateCouponRequest,
    },
    service::PromotionService,
};

pub fn promotion_router() -> Router<AppState> {
    Router::new()
        .route("/promotions/coupons/validate", post(validate_coupon))
        .route("/promotions/referrals/me", get(referral_summary))
        .route("/promotions/referrals", post(create_referral))
        .route("/promotions/loyalty/me", get(loyalty_account))
        .route("/promotions/memberships", get(membership_plans))
        .route(
            "/admin/promotions/coupons",
            get(coupons).post(create_coupon),
        )
        .route("/admin/promotions/coupons/{id}", patch(update_coupon))
        .route(
            "/admin/promotions/buy-x-get-y",
            get(buy_x_get_y_rules).post(create_buy_x_get_y),
        )
        .route(
            "/admin/promotions/flash-sales",
            get(flash_sales).post(create_flash_sale),
        )
        .route("/admin/promotions/loyalty/adjust", post(adjust_loyalty))
        .route(
            "/admin/promotions/cashback-rules",
            get(cashback_rules).post(create_cashback_rule),
        )
        .route(
            "/admin/promotions/memberships",
            get(membership_plans).post(create_membership_plan),
        )
}

async fn validate_coupon(
    State(state): State<AppState>,
    Json(payload): Json<ValidateCouponRequest>,
) -> Result<Json<ApiResponse<CouponValidation>>, ApiError> {
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.validate_coupon(payload).await?,
    )))
}

async fn referral_summary(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<ReferralSummary>>, ApiError> {
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.referral_summary(user.id).await?,
    )))
}

async fn create_referral(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<CreateReferralRequest>,
) -> Result<Json<ApiResponse<ReferralSummary>>, ApiError> {
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.create_referral(user.id, payload).await?,
    )))
}

async fn loyalty_account(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<LoyaltyAccount>>, ApiError> {
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.loyalty_account(user.id).await?,
    )))
}

async fn coupons(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<Coupon>>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.coupons().await?)))
}

async fn create_coupon(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertCouponRequest>,
) -> Result<Json<ApiResponse<Coupon>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.create_coupon(payload).await?)))
}

async fn update_coupon(
    State(state): State<AppState>,
    user: CurrentUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpsertCouponRequest>,
) -> Result<Json<ApiResponse<Coupon>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.update_coupon(id, payload).await?,
    )))
}

async fn buy_x_get_y_rules(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<BuyXGetYRule>>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.buy_x_get_y_rules().await?)))
}

async fn create_buy_x_get_y(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertBuyXGetYRuleRequest>,
) -> Result<Json<ApiResponse<BuyXGetYRule>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.create_buy_x_get_y(payload).await?,
    )))
}

async fn flash_sales(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<FlashSaleCampaign>>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.flash_sales().await?)))
}

async fn create_flash_sale(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertFlashSaleCampaignRequest>,
) -> Result<Json<ApiResponse<FlashSaleCampaign>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.create_flash_sale(payload).await?,
    )))
}

async fn adjust_loyalty(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<AdjustLoyaltyRequest>,
) -> Result<Json<ApiResponse<LoyaltyAccount>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.adjust_loyalty(payload).await?,
    )))
}

async fn cashback_rules(
    State(state): State<AppState>,
    user: CurrentUser,
) -> Result<Json<ApiResponse<Vec<CashbackRule>>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.cashback_rules().await?)))
}

async fn create_cashback_rule(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertCashbackRuleRequest>,
) -> Result<Json<ApiResponse<CashbackRule>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.create_cashback_rule(payload).await?,
    )))
}

async fn membership_plans(
    State(state): State<AppState>,
) -> Result<Json<ApiResponse<Vec<MembershipPlan>>>, ApiError> {
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(service.membership_plans().await?)))
}

async fn create_membership_plan(
    State(state): State<AppState>,
    user: CurrentUser,
    Json(payload): Json<UpsertMembershipPlanRequest>,
) -> Result<Json<ApiResponse<MembershipPlan>>, ApiError> {
    user.require_admin()?;
    let service = PromotionService::new(state.pg_pool.clone());
    Ok(Json(ApiResponse::ok(
        service.create_membership_plan(payload).await?,
    )))
}
