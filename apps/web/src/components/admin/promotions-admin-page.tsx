"use client";

import type { UpsertCouponRequest } from "@bookpie/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Percent, Ticket } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminState } from "@/components/admin/admin-state";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin/api";
import { formatTaka } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";

export function PromotionsAdminPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const queryClient = useQueryClient();
  const couponsQuery = useQuery({ queryKey: ["admin", "promotions", "coupons"], queryFn: () => adminApi.coupons(token), enabled: Boolean(token) });
  const bogoQuery = useQuery({ queryKey: ["admin", "promotions", "bogo"], queryFn: () => adminApi.buyXGetYRules(token), enabled: Boolean(token) });
  const flashQuery = useQuery({ queryKey: ["admin", "promotions", "flash"], queryFn: () => adminApi.flashSales(token), enabled: Boolean(token) });
  const cashbackQuery = useQuery({ queryKey: ["admin", "promotions", "cashback"], queryFn: () => adminApi.cashbackRules(token), enabled: Boolean(token) });
  const membershipQuery = useQuery({ queryKey: ["admin", "promotions", "memberships"], queryFn: () => adminApi.membershipPlans(token), enabled: Boolean(token) });
  const createCouponMutation = useMutation({
    mutationFn: (payload: UpsertCouponRequest) => adminApi.createCoupon(token, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "promotions", "coupons"] });
    },
  });

  if (couponsQuery.isError || bogoQuery.isError || flashQuery.isError || cashbackQuery.isError || membershipQuery.isError) {
    return <AdminState variant="error" title="Promotions failed to load" description="Could not load promotion engines." actionLabel="Retry" onAction={() => {
      void couponsQuery.refetch();
      void bogoQuery.refetch();
      void flashQuery.refetch();
      void cashbackQuery.refetch();
      void membershipQuery.refetch();
    }} />;
  }

  const coupons = couponsQuery.data ?? [];
  const flashSales = flashQuery.data ?? [];
  const cashbackRules = cashbackQuery.data ?? [];
  const membershipPlans = membershipQuery.data ?? [];
  const bogoRules = bogoQuery.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Promotions"
        description="Manage coupon, BOGO, flash sale, referral, loyalty, cashback, and membership engines."
        action={<Button type="button" disabled={createCouponMutation.isPending} onClick={() => createCouponMutation.mutate({ code: `DEMO${Date.now().toString().slice(-4)}`, name: "Demo 5% coupon", discountType: "percent", discountValue: 5, minOrderTotal: 500, usageLimit: 100, isActive: true })}>Create demo coupon</Button>}
      />
      <section className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Coupons" value={String(coupons.length)} icon={Ticket} />
        <AdminStatCard label="Flash sales" value={String(flashSales.length)} icon={Percent} />
        <AdminStatCard label="Memberships" value={String(membershipPlans.length)} icon={Gift} />
      </section>
      <AdminTable
        rows={coupons}
        getRowKey={(coupon) => coupon.id}
        columns={[
          { key: "code", header: "Code", render: (coupon) => <span className="font-semibold">{coupon.code}</span> },
          { key: "type", header: "Type", render: (coupon) => coupon.discountType.replaceAll("_", " ") },
          { key: "value", header: "Value", render: (coupon) => coupon.discountType === "fixed" ? formatTaka(coupon.discountValue) : `${coupon.discountValue}%` },
          { key: "usage", header: "Usage", render: (coupon) => `${coupon.usedCount}/${coupon.usageLimit ?? "∞"}` },
          { key: "status", header: "Status", render: (coupon) => coupon.isActive ? "Active" : "Inactive" },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">BOGO rules</h2>
          <p className="mt-2 text-sm text-muted-foreground">{bogoRules.length} buy X get Y rules configured.</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Cashback rules</h2>
          <p className="mt-2 text-sm text-muted-foreground">{cashbackRules.length} cashback rules configured.</p>
        </article>
      </div>
    </div>
  );
}
