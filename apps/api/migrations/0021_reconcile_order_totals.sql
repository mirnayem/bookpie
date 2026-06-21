WITH recalculated AS (
    SELECT
        id,
        GREATEST(subtotal - discount_total, 0) AS taxable_subtotal,
        ROUND(GREATEST(subtotal - discount_total, 0) * 0.05)::INTEGER AS calculated_tax_total
    FROM orders
)
UPDATE orders o
SET
    tax_total = recalculated.calculated_tax_total,
    total = recalculated.taxable_subtotal + o.shipping_fee + recalculated.calculated_tax_total,
    updated_at = now()
FROM recalculated
WHERE o.id = recalculated.id
  AND (
      o.tax_total <> recalculated.calculated_tax_total
      OR o.total <> recalculated.taxable_subtotal + o.shipping_fee + recalculated.calculated_tax_total
  );
