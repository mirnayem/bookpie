"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShoppingBag, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckoutField } from "@/components/checkout/checkout-field";
import { SummaryLine } from "@/components/cart/summary-line";
import { AddressCard } from "@/components/ui/address-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatTaka } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

const checkoutSchema = z.object({
  name: z.string().min(2, "নাম লিখুন"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর লিখুন"),
  email: z.string().email("সঠিক ইমেইল লিখুন").optional().or(z.literal("")),
  city: z.string().min(2, "শহর লিখুন"),
  address: z.string().min(10, "পূর্ণ ঠিকানা লিখুন"),
  addressPreset: z.enum(["home", "office", "custom"]),
  deliverySlot: z.enum(["standard", "evening", "express"]),
  paymentMethod: z.enum(["cash_on_delivery", "bkash", "sslcommerz"]),
  couponCode: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const savedAddresses = [
  {
    id: "home",
    label: "Home",
    name: "Demo Customer",
    phone: "01712345678",
    city: "ঢাকা",
    address: "House 12, Road 3, Dhanmondi, Dhaka",
  },
  {
    id: "office",
    label: "Office",
    name: "Demo Customer",
    phone: "01712345678",
    city: "ঢাকা",
    address: "Level 4, Mohakhali DOHS, Dhaka",
  },
] as const;

const deliverySlots = [
  { label: "Standard delivery (2-4 days)", value: "standard", fee: 0 },
  { label: "Evening delivery (6 PM - 10 PM)", value: "evening", fee: 20 },
  { label: "Express delivery (next day)", value: "express", fee: 40 },
] as const;

const validCoupons = new Set(["BOOKPIE10", "SAVE10"]);

export function CheckoutPage() {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.originalSubtotal());
  const payable = useCartStore((state) => state.subtotal());
  const discount = Math.max(subtotal - payable, 0);
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "ঢাকা",
      address: "",
      addressPreset: "custom",
      deliverySlot: "standard",
      paymentMethod: "cash_on_delivery",
      couponCode: "",
    },
  });
  const addressPreset = form.watch("addressPreset");
  const watchedCity = form.watch("city");
  const watchedDeliverySlot = form.watch("deliverySlot");
  const orderItems = useMemo(() => items.map((item) => `${item.product.title} x ${item.quantity}`), [items]);
  const currentDeliveryBase = watchedCity === "ঢাকা" ? 79 : 120;
  const currentSlotFee = deliverySlots.find((slot) => slot.value === watchedDeliverySlot)?.fee ?? 0;
  const currentDelivery = items.length ? currentDeliveryBase + currentSlotFee : 0;
  const couponDiscount = appliedCoupon ? Math.round(payable * 0.1) : 0;
  const taxableTotal = Math.max(payable - couponDiscount, 0);
  const tax = Math.round(taxableTotal * 0.05);
  const currentTotal = taxableTotal + currentDelivery + tax;

  const selectSavedAddress = (addressId: "home" | "office") => {
    const address = savedAddresses.find((item) => item.id === addressId);
    if (!address) return;

    form.setValue("addressPreset", addressId, { shouldValidate: true });
    form.setValue("name", address.name, { shouldValidate: true });
    form.setValue("phone", address.phone, { shouldValidate: true });
    form.setValue("city", address.city, { shouldValidate: true });
    form.setValue("address", address.address, { shouldValidate: true });
  };

  const applyCoupon = () => {
    const normalized = form.getValues("couponCode")?.trim().toUpperCase();

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

  const submitOrder = form.handleSubmit(() => {
    setOrderNumber(`BP-${Date.now().toString().slice(-8)}`);
    clearCart();
  });

  if (orderNumber) {
    return (
      <main className="container-page flex min-h-[520px] items-center justify-center py-12">
        <section className="max-w-lg rounded-lg border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold">অর্ডার কনফার্ম হয়েছে</h1>
          <p className="mt-2 text-sm text-muted-foreground">আপনার অর্ডার নম্বর {orderNumber}। ডেমো অর্ডারটি লোকাল স্টেটে সম্পন্ন করা হয়েছে।</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/">আরও কেনাকাটা করুন</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cart">কার্ট দেখুন</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="container-page flex min-h-[520px] items-center justify-center py-12">
        <section className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold">চেকআউট করার মতো পণ্য নেই</h1>
          <p className="mt-2 text-sm text-muted-foreground">কার্টে বই বা পণ্য যোগ করলে চেকআউট করা যাবে।</p>
          <Button asChild className="mt-5">
            <Link href="/">হোমে ফিরে যান</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-semibold">চেকআউট</h1>
      <div className="mt-7 grid gap-10 lg:grid-cols-[1fr_420px]">
        <form className="space-y-6" onSubmit={submitOrder}>
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">ডেলিভারি তথ্য</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {savedAddresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => selectSavedAddress(address.id)}
                >
                  <AddressCard
                    name={address.name}
                    phone={address.phone}
                    address={address.address}
                    label={address.label}
                    selected={addressPreset === address.id}
                    className="h-full"
                  />
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <CheckoutField label="নাম" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} placeholder="আপনার নাম" />
              </CheckoutField>
              <CheckoutField label="মোবাইল নম্বর" error={form.formState.errors.phone?.message}>
                <Input {...form.register("phone")} placeholder="01XXXXXXXXX" />
              </CheckoutField>
              <CheckoutField label="ইমেইল" error={form.formState.errors.email?.message}>
                <Input {...form.register("email")} placeholder="name@example.com" />
              </CheckoutField>
              <CheckoutField label="শহর" error={form.formState.errors.city?.message}>
                <Input {...form.register("city")} />
              </CheckoutField>
            </div>
            <CheckoutField label="ঠিকানা" error={form.formState.errors.address?.message} className="mt-4">
              <textarea
                {...form.register("address")}
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="বাসা, রোড, এলাকা"
              />
            </CheckoutField>
          </section>
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">ডেলিভারি স্লট</h2>
            <CheckoutField label="স্লট নির্বাচন করুন" error={form.formState.errors.deliverySlot?.message} className="mt-5">
              <Select
                {...form.register("deliverySlot")}
                options={deliverySlots.map((slot) => ({
                  label: `${slot.label}${slot.fee ? ` +${formatTaka(slot.fee)}` : ""}`,
                  value: slot.value,
                }))}
              />
            </CheckoutField>
            <p className="mt-3 text-sm text-muted-foreground">
              শিপিং চার্জ: {formatTaka(currentDeliveryBase)} + স্লট চার্জ {formatTaka(currentSlotFee)}
            </p>
          </section>
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">পেমেন্ট</h2>
            <CheckoutField label="পেমেন্ট পদ্ধতি" error={form.formState.errors.paymentMethod?.message} className="mt-5">
              <Select
                {...form.register("paymentMethod")}
                options={[
                  { label: "Cash on delivery", value: "cash_on_delivery" },
                  { label: "bKash (mock ready)", value: "bkash" },
                  { label: "SSLCommerz (mock ready)", value: "sslcommerz" },
                ]}
              />
            </CheckoutField>
          </section>
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">কুপন</h2>
            <div className="mt-4 flex gap-2">
              <Input {...form.register("couponCode")} placeholder="BOOKPIE10" aria-label="Coupon code" />
              <Button type="button" variant="outline" onClick={applyCoupon}>
                <Tag className="h-4 w-4" aria-hidden="true" />
                Apply
              </Button>
            </div>
            {couponError ? <p className="mt-2 text-xs font-medium text-destructive">{couponError}</p> : null}
            {appliedCoupon ? <p className="mt-2 text-xs font-medium text-primary">{appliedCoupon} applied for 10% off.</p> : null}
          </section>
          <Button type="submit" className="w-full sm:w-auto">
            অর্ডার কনফার্ম করুন
          </Button>
        </form>
        <aside className="h-fit rounded-lg border bg-card p-7">
          <h2 className="text-lg font-semibold">অর্ডার সামারি</h2>
          <ul className="mt-5 space-y-3 border-b pb-5 text-sm">
            {orderItems.map((item) => (
              <li key={item} className="text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-5 text-sm">
            <SummaryLine label="দাম" value={formatTaka(subtotal)} />
            <SummaryLine label="ছাড়" value={`-${formatTaka(discount)}`} />
            {couponDiscount ? <SummaryLine label={`কুপন (${appliedCoupon})`} value={`-${formatTaka(couponDiscount)}`} /> : null}
            <SummaryLine label="ভ্যাট/ট্যাক্স" value={formatTaka(tax)} />
            <SummaryLine label="ডেলিভারি ফি" value={formatTaka(currentDelivery)} />
            <SummaryLine label="সর্বমোট" value={formatTaka(currentTotal)} strong />
          </div>
        </aside>
      </div>
    </main>
  );
}
