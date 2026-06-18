"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SummaryLine } from "@/components/cart/summary-line";
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
  paymentMethod: z.enum(["cash_on_delivery", "bkash", "sslcommerz"]),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.originalSubtotal());
  const payable = useCartStore((state) => state.subtotal());
  const delivery = items.length ? 79 : 0;
  const total = payable + delivery;
  const discount = Math.max(subtotal - payable, 0);
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "ঢাকা",
      address: "",
      paymentMethod: "cash_on_delivery",
    },
  });
  const orderItems = useMemo(() => items.map((item) => `${item.product.title} x ${item.quantity}`), [items]);

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
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="নাম" error={form.formState.errors.name?.message}>
                <Input {...form.register("name")} placeholder="আপনার নাম" />
              </Field>
              <Field label="মোবাইল নম্বর" error={form.formState.errors.phone?.message}>
                <Input {...form.register("phone")} placeholder="01XXXXXXXXX" />
              </Field>
              <Field label="ইমেইল" error={form.formState.errors.email?.message}>
                <Input {...form.register("email")} placeholder="name@example.com" />
              </Field>
              <Field label="শহর" error={form.formState.errors.city?.message}>
                <Input {...form.register("city")} />
              </Field>
            </div>
            <Field label="ঠিকানা" error={form.formState.errors.address?.message} className="mt-4">
              <textarea
                {...form.register("address")}
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="বাসা, রোড, এলাকা"
              />
            </Field>
          </section>
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">পেমেন্ট</h2>
            <Field label="পেমেন্ট পদ্ধতি" error={form.formState.errors.paymentMethod?.message} className="mt-5">
              <Select
                {...form.register("paymentMethod")}
                options={[
                  { label: "Cash on delivery", value: "cash_on_delivery" },
                  { label: "bKash (mock ready)", value: "bkash" },
                  { label: "SSLCommerz (mock ready)", value: "sslcommerz" },
                ]}
              />
            </Field>
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
            <SummaryLine label="ডেলিভারি ফি" value={formatTaka(delivery)} />
            <SummaryLine label="সর্বমোট" value={formatTaka(total)} strong />
          </div>
        </aside>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

function Field({ label, error, className, children }: FieldProps) {
  return (
    <label className={className ? `block ${className}` : "block"}>
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-1 block text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  );
}
