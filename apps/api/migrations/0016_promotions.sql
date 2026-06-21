CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'free_shipping')),
    discount_value INTEGER NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
    min_order_total INTEGER NOT NULL DEFAULT 0 CHECK (min_order_total >= 0),
    usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
    used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

CREATE TABLE IF NOT EXISTS buy_x_get_y_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    buy_book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    get_book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    buy_quantity INTEGER NOT NULL DEFAULT 1 CHECK (buy_quantity > 0),
    get_quantity INTEGER NOT NULL DEFAULT 1 CHECK (get_quantity > 0),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buy_x_get_y_active ON buy_x_get_y_rules(is_active);

CREATE TABLE IF NOT EXISTS flash_sale_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS flash_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES flash_sale_campaigns(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    sale_price INTEGER NOT NULL CHECK (sale_price >= 0),
    stock_limit INTEGER CHECK (stock_limit IS NULL OR stock_limit >= 0),
    UNIQUE (campaign_id, book_id)
);

CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    reward_points INTEGER NOT NULL DEFAULT 100 CHECK (reward_points >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded', 'cancelled')),
    reward_points INTEGER NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_accounts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    tier TEXT NOT NULL DEFAULT 'starter',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cashback_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    percent INTEGER NOT NULL CHECK (percent BETWEEN 0 AND 100),
    max_cashback INTEGER CHECK (max_cashback IS NULL OR max_cashback >= 0),
    min_order_total INTEGER NOT NULL DEFAULT 0 CHECK (min_order_total >= 0),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price INTEGER NOT NULL CHECK (price >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    benefits JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO coupons (id, code, name, discount_type, discount_value, min_order_total, usage_limit, starts_at, ends_at, is_active)
VALUES
    ('60000000-0000-0000-0000-000000000001', 'BOOKPIE10', 'BookPie welcome 10%', 'percent', 10, 500, 1000, now() - interval '1 day', now() + interval '90 days', true),
    ('60000000-0000-0000-0000-000000000002', 'FREESHIP', 'Free delivery over threshold', 'free_shipping', 0, 1200, 500, now() - interval '1 day', now() + interval '60 days', true)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    min_order_total = EXCLUDED.min_order_total,
    usage_limit = EXCLUDED.usage_limit,
    starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at,
    is_active = EXCLUDED.is_active,
    updated_at = now();

INSERT INTO membership_plans (id, name, slug, price, duration_days, benefits, is_active)
VALUES
    ('61000000-0000-0000-0000-000000000001', 'BookPie Plus', 'bookpie-plus', 999, 365, '{"discountPercent":5,"freeShipping":true}'::jsonb, true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    price = EXCLUDED.price,
    duration_days = EXCLUDED.duration_days,
    benefits = EXCLUDED.benefits,
    is_active = EXCLUDED.is_active,
    updated_at = now();
