export const VAT_RATE_PERCENT = 5;

export type OrderTotalsInput = {
  subtotal: number;
  productDiscount?: number;
  couponDiscount?: number;
  shippingFee?: number;
  taxTotal?: number;
};

export type StoredOrderTotalFields = {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  taxTotal: number;
};

export type OrderTotals = {
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  discountTotal: number;
  taxableSubtotal: number;
  shippingFee: number;
  taxTotal: number;
  total: number;
};

export function calculateVat(taxableSubtotal: number) {
  return Math.round(Math.max(taxableSubtotal, 0) * (VAT_RATE_PERCENT / 100));
}

export function calculateOrderTotals(input: OrderTotalsInput): OrderTotals {
  const subtotal = Math.max(input.subtotal, 0);
  const productDiscount = Math.max(input.productDiscount ?? 0, 0);
  const couponDiscount = Math.max(input.couponDiscount ?? 0, 0);
  const discountTotal = Math.min(productDiscount + couponDiscount, subtotal);
  const taxableSubtotal = Math.max(subtotal - discountTotal, 0);
  const shippingFee = Math.max(input.shippingFee ?? 0, 0);
  const taxTotal = Math.max(input.taxTotal ?? calculateVat(taxableSubtotal), 0);

  return {
    subtotal,
    productDiscount,
    couponDiscount,
    discountTotal,
    taxableSubtotal,
    shippingFee,
    taxTotal,
    total: taxableSubtotal + shippingFee + taxTotal,
  };
}

export function calculateStoredOrderTotals(order: StoredOrderTotalFields): OrderTotals {
  return calculateOrderTotals({
    subtotal: order.subtotal,
    productDiscount: order.discountTotal,
    shippingFee: order.shippingFee,
    taxTotal: order.taxTotal,
  });
}
