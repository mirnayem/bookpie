ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_provider_check;

ALTER TABLE orders
ADD CONSTRAINT orders_payment_provider_check
CHECK (payment_provider IN ('sslcommerz', 'bkash', 'stripe', 'nagad'));
