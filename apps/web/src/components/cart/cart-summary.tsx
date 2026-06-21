"use client";

import Link from "next/link";
import { useState } from "react";
import { SummaryLine } from "@/components/cart/summary-line";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTaka } from "@/lib/format";
import { cartLinesToMetaPixelPayload, trackMetaPixelEvent } from "@/lib/meta-pixel";
import { calculateOrderTotals } from "@/lib/order-totals";
import { validateApiCoupon } from "@/lib/storefront-api";
import type { CartLine } from "@/stores/cart-store";

type CartSummaryProps = {
  items: CartLine[];
  subtotal: number;
  discount: number;
  delivery: number;
  disabled?: boolean;
};

export function CartSummary({ items, subtotal, discount, delivery, disabled = false }: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const deliveryFee = disabled || freeShipping ? 0 : delivery;
  const totals = calculateOrderTotals({
    subtotal,
    productDiscount: discount,
    couponDiscount,
    shippingFee: deliveryFee,
  });

  const applyCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = couponCode.trim().toUpperCase();

    if (!normalized) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setFreeShipping(false);
      setCouponError("কুপন কোড লিখুন");
      return;
    }

    try {
      const validation = await validateApiCoupon({ code: normalized, subtotal: Math.max(subtotal - discount, 0), shippingFee: delivery });
      if (!validation.valid) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setFreeShipping(false);
        setCouponError(validation.message);
        return;
      }

      setAppliedCoupon(validation.code);
      setCouponDiscount(validation.discount);
      setFreeShipping(validation.freeShipping);
      setCouponError(null);
    } catch {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setFreeShipping(false);
      setCouponError("কুপনটি পাওয়া যায়নি");
    }
  };

  return (
    <aside className="rounded-lg border bg-card p-7">
      <div className="space-y-5 text-sm">
        <SummaryLine label="দাম" value={formatTaka(subtotal)} />
        <SummaryLine label="ছাড়" value={`-${formatTaka(discount)}`} />
        {couponDiscount ? <SummaryLine label={`কুপন (${appliedCoupon})`} value={`-${formatTaka(couponDiscount)}`} /> : null}
        <SummaryLine label="মোট দাম" value={formatTaka(totals.taxableSubtotal)} />
        <SummaryLine label="ভ্যাট/ট্যাক্স" value={formatTaka(totals.taxTotal)} />
        <SummaryLine label="ডেলিভারি ফি" value={formatTaka(deliveryFee)} />
        <SummaryLine label="সর্বমোট" value={formatTaka(totals.total)} strong />
      </div>
      <form className="mt-7 flex gap-2" onSubmit={applyCoupon}>
        <Input value={couponCode} placeholder="Enter your coupon code" aria-label="Coupon code" onChange={(event) => setCouponCode(event.target.value)} />
        <Button type="submit">Apply</Button>
      </form>
      {couponError ? <p className="mt-2 text-xs font-medium text-destructive">{couponError}</p> : null}
      {appliedCoupon ? <p className="mt-2 text-xs font-medium text-primary">কুপন প্রয়োগ করা হয়েছে।</p> : null}
      {disabled ? (
        <Button type="button" className="mt-6 w-full" disabled>
          Checkout
        </Button>
      ) : (
        <Button asChild className="mt-6 w-full">
          <Link
            href="/checkout"
            onClick={() => {
              trackMetaPixelEvent("InitiateCheckout", cartLinesToMetaPixelPayload(items, totals.total));
            }}
          >
            Checkout
          </Link>
        </Button>
      )}
    </aside>
  );
}
