"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SummaryLine } from "@/components/cart/summary-line";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTaka } from "@/lib/format";

type CartSummaryProps = {
  subtotal: number;
  discount: number;
  delivery: number;
  disabled?: boolean;
};

const validCoupons = new Set(["BOOKPIE10", "SAVE10"]);

export function CartSummary({ subtotal, discount, delivery, disabled = false }: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const couponDiscount = useMemo(() => (appliedCoupon ? Math.round(Math.max(subtotal - discount, 0) * 0.1) : 0), [appliedCoupon, discount, subtotal]);
  const total = Math.max(subtotal - discount - couponDiscount, 0) + (disabled ? 0 : delivery);

  const applyCoupon = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = couponCode.trim().toUpperCase();

    if (!normalized) {
      setAppliedCoupon(null);
      setCouponError("কুপন কোড লিখুন");
      return;
    }

    if (!validCoupons.has(normalized)) {
      setAppliedCoupon(null);
      setCouponError("কুপনটি পাওয়া যায়নি");
      return;
    }

    setAppliedCoupon(normalized);
    setCouponError(null);
  };

  return (
    <aside className="rounded-lg border bg-card p-7">
      <div className="space-y-5 text-sm">
        <SummaryLine label="দাম" value={formatTaka(subtotal)} />
        <SummaryLine label="ছাড়" value={`-${formatTaka(discount)}`} />
        {couponDiscount ? <SummaryLine label={`কুপন (${appliedCoupon})`} value={`-${formatTaka(couponDiscount)}`} /> : null}
        <SummaryLine label="মোট দাম" value={formatTaka(subtotal - discount)} />
        <SummaryLine label="ডেলিভারি ফি" value={formatTaka(disabled ? 0 : delivery)} />
        <SummaryLine label="সর্বমোট" value={formatTaka(total)} strong />
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
          <Link href="/checkout">Checkout</Link>
        </Button>
      )}
    </aside>
  );
}
