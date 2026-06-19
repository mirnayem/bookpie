"use client";

import { useQuery } from "@tanstack/react-query";
import { Boxes, ClipboardList, DollarSign } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminState } from "@/components/admin/admin-state";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { formatTaka } from "@/lib/format";
import { adminApi } from "@/lib/admin/api";
import { useAuthStore } from "@/stores/auth-store";

export function ReportsAdminPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const summaryQuery = useQuery({ queryKey: ["admin", "summary"], queryFn: () => adminApi.dashboardSummary(token), enabled: Boolean(token) });

  if (summaryQuery.isError) {
    return <AdminState variant="error" title="Reports failed to load" description={summaryQuery.error.message} actionLabel="Retry" onAction={() => summaryQuery.refetch()} />;
  }

  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reports" description="Review sales, order, inventory, and audit readiness metrics." />
      <section className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Paid revenue" value={summary ? formatTaka(summary.paidRevenue) : "..."} icon={DollarSign} />
        <AdminStatCard label="Total orders" value={String(summary?.totalOrders ?? "...")} icon={ClipboardList} />
        <AdminStatCard label="Low stock books" value={String(summary?.lowStockBooks ?? "...")} icon={Boxes} />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Sales summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">Uses dashboard summary data until dedicated report APIs are added.</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Inventory report</h2>
          <p className="mt-2 text-sm text-muted-foreground">Low-stock reporting is available. CSV exports are tracked as backend gaps.</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Audit readiness</h2>
          <p className="mt-2 text-sm text-muted-foreground">Audit log APIs are required for product, inventory, order, and user activity feeds.</p>
        </article>
      </div>
    </div>
  );
}
