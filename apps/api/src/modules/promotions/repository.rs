use sqlx::{PgPool, Row, postgres::PgRow};
use uuid::Uuid;

use crate::{error::ApiError, models::ids::UserId};

use super::model::{
    BuyXGetYRule, CashbackRule, Coupon, CouponValidation, FlashSaleCampaign, LoyaltyAccount,
    MembershipPlan, ReferralSummary, UpsertBuyXGetYRuleRequest, UpsertCashbackRuleRequest,
    UpsertCouponRequest, UpsertFlashSaleCampaignRequest, UpsertMembershipPlanRequest,
};

#[derive(Clone)]
pub struct PromotionRepository {
    pool: PgPool,
}

impl PromotionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn coupons(&self) -> Result<Vec<Coupon>, ApiError> {
        let rows = sqlx::query(
            "SELECT id, code, name, discount_type, discount_value, min_order_total, usage_limit, used_count, starts_at, ends_at, is_active FROM coupons ORDER BY created_at DESC",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(coupon_from_row).collect())
    }

    pub async fn create_coupon(&self, payload: &UpsertCouponRequest) -> Result<Coupon, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO coupons (code, name, discount_type, discount_value, min_order_total, usage_limit, starts_at, ends_at, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, true))
            RETURNING id, code, name, discount_type, discount_value, min_order_total, usage_limit, used_count, starts_at, ends_at, is_active
            "#,
        )
        .bind(payload.code.trim().to_uppercase())
        .bind(payload.name.trim())
        .bind(payload.discount_type.trim())
        .bind(payload.discount_value)
        .bind(payload.min_order_total)
        .bind(payload.usage_limit)
        .bind(payload.starts_at)
        .bind(payload.ends_at)
        .bind(payload.is_active)
        .fetch_one(&self.pool)
        .await?;
        Ok(coupon_from_row(row))
    }

    pub async fn update_coupon(
        &self,
        id: Uuid,
        payload: &UpsertCouponRequest,
    ) -> Result<Coupon, ApiError> {
        let row = sqlx::query(
            r#"
            UPDATE coupons
            SET code = $2, name = $3, discount_type = $4, discount_value = $5,
                min_order_total = $6, usage_limit = $7, starts_at = $8, ends_at = $9,
                is_active = COALESCE($10, is_active), updated_at = now()
            WHERE id = $1
            RETURNING id, code, name, discount_type, discount_value, min_order_total, usage_limit, used_count, starts_at, ends_at, is_active
            "#,
        )
        .bind(id)
        .bind(payload.code.trim().to_uppercase())
        .bind(payload.name.trim())
        .bind(payload.discount_type.trim())
        .bind(payload.discount_value)
        .bind(payload.min_order_total)
        .bind(payload.usage_limit)
        .bind(payload.starts_at)
        .bind(payload.ends_at)
        .bind(payload.is_active)
        .fetch_optional(&self.pool)
        .await?
        .ok_or(ApiError::NotFound)?;
        Ok(coupon_from_row(row))
    }

    pub async fn validate_coupon(
        &self,
        code: &str,
        subtotal: i32,
        shipping_fee: i32,
    ) -> Result<CouponValidation, ApiError> {
        let normalized = code.trim().to_uppercase();
        let row = sqlx::query(
            r#"
            SELECT id, code, name, discount_type, discount_value, min_order_total, usage_limit, used_count, starts_at, ends_at, is_active
            FROM coupons
            WHERE code = $1
            "#,
        )
        .bind(&normalized)
        .fetch_optional(&self.pool)
        .await?;

        let Some(row) = row else {
            return Ok(invalid_coupon(normalized, "Coupon was not found"));
        };

        let coupon = coupon_from_row(row);
        let now = chrono::Utc::now();
        if !coupon.is_active {
            return Ok(invalid_coupon(normalized, "Coupon is inactive"));
        }
        if coupon.starts_at.is_some_and(|starts_at| starts_at > now)
            || coupon.ends_at.is_some_and(|ends_at| ends_at < now)
        {
            return Ok(invalid_coupon(normalized, "Coupon is not currently active"));
        }
        if coupon
            .usage_limit
            .is_some_and(|usage_limit| coupon.used_count >= usage_limit)
        {
            return Ok(invalid_coupon(normalized, "Coupon usage limit reached"));
        }
        if subtotal < coupon.min_order_total {
            return Ok(invalid_coupon(
                normalized,
                "Cart total is below coupon minimum",
            ));
        }

        let (discount, free_shipping) = match coupon.discount_type.as_str() {
            "percent" => ((subtotal * coupon.discount_value / 100).max(0), false),
            "fixed" => (coupon.discount_value.min(subtotal).max(0), false),
            "free_shipping" => (shipping_fee.max(0), true),
            _ => (0, false),
        };

        Ok(CouponValidation {
            valid: true,
            code: coupon.code,
            discount,
            free_shipping,
            message: "Coupon applied".to_string(),
        })
    }

    pub async fn buy_x_get_y_rules(&self) -> Result<Vec<BuyXGetYRule>, ApiError> {
        let rows = sqlx::query(
            "SELECT id, name, buy_book_id, get_book_id, buy_quantity, get_quantity, starts_at, ends_at, is_active FROM buy_x_get_y_rules ORDER BY created_at DESC",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(buy_x_get_y_from_row).collect())
    }

    pub async fn create_buy_x_get_y(
        &self,
        payload: &UpsertBuyXGetYRuleRequest,
    ) -> Result<BuyXGetYRule, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO buy_x_get_y_rules (name, buy_book_id, get_book_id, buy_quantity, get_quantity, starts_at, ends_at, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, true))
            RETURNING id, name, buy_book_id, get_book_id, buy_quantity, get_quantity, starts_at, ends_at, is_active
            "#,
        )
        .bind(payload.name.trim())
        .bind(payload.buy_book_id)
        .bind(payload.get_book_id)
        .bind(payload.buy_quantity)
        .bind(payload.get_quantity)
        .bind(payload.starts_at)
        .bind(payload.ends_at)
        .bind(payload.is_active)
        .fetch_one(&self.pool)
        .await?;
        Ok(buy_x_get_y_from_row(row))
    }

    pub async fn flash_sales(&self) -> Result<Vec<FlashSaleCampaign>, ApiError> {
        let rows = sqlx::query(
            "SELECT id, name, starts_at, ends_at, is_active FROM flash_sale_campaigns ORDER BY starts_at DESC",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(flash_sale_from_row).collect())
    }

    pub async fn create_flash_sale(
        &self,
        payload: &UpsertFlashSaleCampaignRequest,
    ) -> Result<FlashSaleCampaign, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO flash_sale_campaigns (name, starts_at, ends_at, is_active)
            VALUES ($1, $2, $3, COALESCE($4, true))
            RETURNING id, name, starts_at, ends_at, is_active
            "#,
        )
        .bind(payload.name.trim())
        .bind(payload.starts_at)
        .bind(payload.ends_at)
        .bind(payload.is_active)
        .fetch_one(&self.pool)
        .await?;
        Ok(flash_sale_from_row(row))
    }

    pub async fn referral_summary(&self, user_id: UserId) -> Result<ReferralSummary, ApiError> {
        let row = sqlx::query(
            r#"
            SELECT rc.code, rc.reward_points, COUNT(re.id)::BIGINT AS referrals
            FROM referral_codes rc
            LEFT JOIN referral_events re ON re.code_id = rc.id
            WHERE rc.user_id = $1
            GROUP BY rc.id
            ORDER BY rc.created_at DESC
            LIMIT 1
            "#,
        )
        .bind(user_id.0)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map_or(
            ReferralSummary {
                code: String::new(),
                reward_points: 100,
                referrals: 0,
            },
            |row| ReferralSummary {
                code: row.get("code"),
                reward_points: row.get("reward_points"),
                referrals: row.get("referrals"),
            },
        ))
    }

    pub async fn create_referral(
        &self,
        user_id: UserId,
        code: &str,
    ) -> Result<ReferralSummary, ApiError> {
        let normalized = code.trim().to_uppercase();
        sqlx::query(
            "INSERT INTO referral_codes (user_id, code, reward_points, is_active) VALUES ($1, $2, 100, true)",
        )
        .bind(user_id.0)
        .bind(&normalized)
        .execute(&self.pool)
        .await?;
        self.referral_summary(user_id).await
    }

    pub async fn loyalty_account(&self, user_id: UserId) -> Result<LoyaltyAccount, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO loyalty_accounts (user_id, points, tier)
            VALUES ($1, 0, 'starter')
            ON CONFLICT (user_id) DO UPDATE SET updated_at = loyalty_accounts.updated_at
            RETURNING user_id, points, tier
            "#,
        )
        .bind(user_id.0)
        .fetch_one(&self.pool)
        .await?;
        Ok(loyalty_from_row(row))
    }

    pub async fn adjust_loyalty(
        &self,
        user_id: Uuid,
        points_delta: i32,
        reason: &str,
        order_id: Option<Uuid>,
    ) -> Result<LoyaltyAccount, ApiError> {
        let mut tx = self.pool.begin().await?;
        sqlx::query(
            "INSERT INTO loyalty_transactions (user_id, points_delta, reason, order_id) VALUES ($1, $2, $3, $4)",
        )
        .bind(user_id)
        .bind(points_delta)
        .bind(reason)
        .bind(order_id)
        .execute(&mut *tx)
        .await?;
        let row = sqlx::query(
            r#"
            INSERT INTO loyalty_accounts (user_id, points, tier)
            VALUES ($1, GREATEST($2, 0), 'starter')
            ON CONFLICT (user_id) DO UPDATE
            SET points = GREATEST(loyalty_accounts.points + $2, 0),
                tier = CASE
                    WHEN GREATEST(loyalty_accounts.points + $2, 0) >= 5000 THEN 'platinum'
                    WHEN GREATEST(loyalty_accounts.points + $2, 0) >= 1000 THEN 'gold'
                    ELSE 'starter'
                END,
                updated_at = now()
            RETURNING user_id, points, tier
            "#,
        )
        .bind(user_id)
        .bind(points_delta)
        .fetch_one(&mut *tx)
        .await?;
        tx.commit().await?;
        Ok(loyalty_from_row(row))
    }

    pub async fn cashback_rules(&self) -> Result<Vec<CashbackRule>, ApiError> {
        let rows = sqlx::query(
            "SELECT id, name, percent, max_cashback, min_order_total, starts_at, ends_at, is_active FROM cashback_rules ORDER BY created_at DESC",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(cashback_from_row).collect())
    }

    pub async fn create_cashback_rule(
        &self,
        payload: &UpsertCashbackRuleRequest,
    ) -> Result<CashbackRule, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO cashback_rules (name, percent, max_cashback, min_order_total, starts_at, ends_at, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
            RETURNING id, name, percent, max_cashback, min_order_total, starts_at, ends_at, is_active
            "#,
        )
        .bind(payload.name.trim())
        .bind(payload.percent)
        .bind(payload.max_cashback)
        .bind(payload.min_order_total)
        .bind(payload.starts_at)
        .bind(payload.ends_at)
        .bind(payload.is_active)
        .fetch_one(&self.pool)
        .await?;
        Ok(cashback_from_row(row))
    }

    pub async fn membership_plans(&self) -> Result<Vec<MembershipPlan>, ApiError> {
        let rows = sqlx::query(
            "SELECT id, name, slug, price, duration_days, benefits, is_active FROM membership_plans ORDER BY price",
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows.into_iter().map(membership_from_row).collect())
    }

    pub async fn create_membership_plan(
        &self,
        payload: &UpsertMembershipPlanRequest,
    ) -> Result<MembershipPlan, ApiError> {
        let row = sqlx::query(
            r#"
            INSERT INTO membership_plans (name, slug, price, duration_days, benefits, is_active)
            VALUES ($1, $2, $3, $4, $5, COALESCE($6, true))
            RETURNING id, name, slug, price, duration_days, benefits, is_active
            "#,
        )
        .bind(payload.name.trim())
        .bind(payload.slug.trim())
        .bind(payload.price)
        .bind(payload.duration_days)
        .bind(&payload.benefits)
        .bind(payload.is_active)
        .fetch_one(&self.pool)
        .await?;
        Ok(membership_from_row(row))
    }
}

fn invalid_coupon(code: String, message: &str) -> CouponValidation {
    CouponValidation {
        valid: false,
        code,
        discount: 0,
        free_shipping: false,
        message: message.to_string(),
    }
}

fn coupon_from_row(row: PgRow) -> Coupon {
    Coupon {
        id: row.get("id"),
        code: row.get("code"),
        name: row.get("name"),
        discount_type: row.get("discount_type"),
        discount_value: row.get("discount_value"),
        min_order_total: row.get("min_order_total"),
        usage_limit: row.get("usage_limit"),
        used_count: row.get("used_count"),
        starts_at: row.get("starts_at"),
        ends_at: row.get("ends_at"),
        is_active: row.get("is_active"),
    }
}

fn buy_x_get_y_from_row(row: PgRow) -> BuyXGetYRule {
    BuyXGetYRule {
        id: row.get("id"),
        name: row.get("name"),
        buy_book_id: row.get("buy_book_id"),
        get_book_id: row.get("get_book_id"),
        buy_quantity: row.get("buy_quantity"),
        get_quantity: row.get("get_quantity"),
        starts_at: row.get("starts_at"),
        ends_at: row.get("ends_at"),
        is_active: row.get("is_active"),
    }
}

fn flash_sale_from_row(row: PgRow) -> FlashSaleCampaign {
    FlashSaleCampaign {
        id: row.get("id"),
        name: row.get("name"),
        starts_at: row.get("starts_at"),
        ends_at: row.get("ends_at"),
        is_active: row.get("is_active"),
    }
}

fn loyalty_from_row(row: PgRow) -> LoyaltyAccount {
    LoyaltyAccount {
        user_id: row.get("user_id"),
        points: row.get("points"),
        tier: row.get("tier"),
    }
}

fn cashback_from_row(row: PgRow) -> CashbackRule {
    CashbackRule {
        id: row.get("id"),
        name: row.get("name"),
        percent: row.get("percent"),
        max_cashback: row.get("max_cashback"),
        min_order_total: row.get("min_order_total"),
        starts_at: row.get("starts_at"),
        ends_at: row.get("ends_at"),
        is_active: row.get("is_active"),
    }
}

fn membership_from_row(row: PgRow) -> MembershipPlan {
    MembershipPlan {
        id: row.get("id"),
        name: row.get("name"),
        slug: row.get("slug"),
        price: row.get("price"),
        duration_days: row.get("duration_days"),
        benefits: row.get("benefits"),
        is_active: row.get("is_active"),
    }
}
