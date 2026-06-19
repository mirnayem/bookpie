CREATE TABLE IF NOT EXISTS customer_saved_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('sslcommerz', 'bkash', 'manual')),
    card_brand TEXT NOT NULL,
    last4 TEXT NOT NULL CHECK (last4 ~ '^[0-9]{4}$'),
    exp_month INTEGER NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
    exp_year INTEGER NOT NULL CHECK (exp_year BETWEEN 2026 AND 2100),
    token_reference TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_saved_cards_token_reference
    ON customer_saved_cards (provider, token_reference);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_saved_cards_default
    ON customer_saved_cards (user_id)
    WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_customer_saved_cards_user_id
    ON customer_saved_cards (user_id);

CREATE TABLE IF NOT EXISTS customer_saved_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('sslcommerz', 'bkash', 'nagad', 'manual')),
    method_type TEXT NOT NULL CHECK (method_type IN ('card', 'mobile_wallet', 'cash_on_delivery')),
    display_label TEXT NOT NULL,
    wallet_phone TEXT,
    token_reference TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (method_type = 'mobile_wallet' AND wallet_phone IS NOT NULL)
        OR method_type IN ('card', 'cash_on_delivery')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_saved_payment_methods_token_reference
    ON customer_saved_payment_methods (provider, token_reference);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_saved_payment_methods_default
    ON customer_saved_payment_methods (user_id)
    WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_customer_saved_payment_methods_user_id
    ON customer_saved_payment_methods (user_id);

INSERT INTO customer_saved_cards (
    id, user_id, provider, card_brand, last4, exp_month, exp_year, token_reference,
    is_default, created_at, updated_at
)
VALUES (
    '61000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'sslcommerz',
    'VISA',
    '4242',
    12,
    2030,
    'seed_ssl_card_customer_4242',
    true,
    now(),
    now()
)
ON CONFLICT (provider, token_reference) DO UPDATE
SET
    card_brand = EXCLUDED.card_brand,
    last4 = EXCLUDED.last4,
    exp_month = EXCLUDED.exp_month,
    exp_year = EXCLUDED.exp_year,
    is_default = EXCLUDED.is_default,
    updated_at = now();

INSERT INTO customer_saved_payment_methods (
    id, user_id, provider, method_type, display_label, wallet_phone, token_reference,
    is_default, created_at, updated_at
)
VALUES
    (
        '62000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'sslcommerz',
        'card',
        'VISA ending 4242',
        NULL,
        'seed_ssl_card_customer_4242',
        true,
        now(),
        now()
    ),
    (
        '62000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        'bkash',
        'mobile_wallet',
        'bKash personal wallet',
        '+8801700000002',
        'seed_bkash_customer_wallet',
        false,
        now(),
        now()
    )
ON CONFLICT (provider, token_reference) DO UPDATE
SET
    method_type = EXCLUDED.method_type,
    display_label = EXCLUDED.display_label,
    wallet_phone = EXCLUDED.wallet_phone,
    is_default = EXCLUDED.is_default,
    updated_at = now();
