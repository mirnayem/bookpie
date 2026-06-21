"use client";

import { useQuery } from "@tanstack/react-query";
import { Boxes, ClipboardList, DollarSign, Repeat2, Truck, Warehouse } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminState } from "@/components/admin/admin-state";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { formatTaka } from "@/lib/format";
import { adminApi } from "@/lib/admin/api";
import { useAuthStore } from "@/stores/auth-store";

export function ReportsAdminPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const revenueQuery = useQuery({ queryKey: ["admin", "analytics", "revenue"], queryFn: () => adminApi.revenueReport(token), enabled: Boolean(token) });
  const inventoryQuery = useQuery({ queryKey: ["admin", "analytics", "inventory"], queryFn: () => adminApi.inventoryReport(token), enabled: Boolean(token) });
  const warehouseQuery = useQuery({ queryKey: ["admin", "analytics", "warehouse"], queryFn: () => adminApi.warehouseReport(token), enabled: Boolean(token) });
  const deliveryQuery = useQuery({ queryKey: ["admin", "analytics", "delivery"], queryFn: () => adminApi.deliveryReport(token), enabled: Boolean(token) });
  const retentionQuery = useQuery({ queryKey: ["admin", "analytics", "retention"], queryFn: () => adminApi.retentionReport(token), enabled: Boolean(token) });
  const hasError = revenueQuery.isError || inventoryQuery.isError || warehouseQuery.isError || deliveryQuery.isError || retentionQuery.isError;

  if (hasError) {
    return <AdminState variant="error" title="Reports failed to load" description="One or more analytics reports could not be loaded." actionLabel="Retry" onAction={() => {
      void revenueQuery.refetch();
      void inventoryQuery.refetch();
      void warehouseQuery.refetch();
      void deliveryQuery.refetch();
      void retentionQuery.refetch();
    }} />;
  }

  const revenue = revenueQuery.data;
  const inventory = inventoryQuery.data;
  const warehouse = warehouseQuery.data;
  const delivery = deliveryQuery.data;
  const retention = retentionQuery.data;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reports" description="Review sales, inventory, warehouse, delivery, and retention metrics." />
      <section className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Paid revenue" value={revenue ? formatTaka(revenue.paidRevenue) : "..."} icon={DollarSign} />
        <AdminStatCard label="GMV" value={revenue ? formatTaka(revenue.grossMerchandiseValue) : "..."} icon={ClipboardList} />
        <AdminStatCard label="Low stock books" value={String(inventory?.lowStockBooks ?? "...")} icon={Boxes} />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Sales summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">Average order value: {revenue ? formatTaka(revenue.averageOrderValue) : "..."}</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold">Inventory report</h2>
          <p className="mt-2 text-sm text-muted-foreground">Stock value: {inventory ? formatTaka(inventory.estimatedStockValue) : "..."} · Out of stock: {inventory?.outOfStockBooks ?? "..."}</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Warehouse className="h-4 w-4" /> Warehouse</h2>
          <p className="mt-2 text-sm text-muted-foreground">Picking: {warehouse?.picking ?? "..."} · Packed: {warehouse?.packed ?? "..."}</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Truck className="h-4 w-4" /> Delivery</h2>
          <p className="mt-2 text-sm text-muted-foreground">Assigned: {delivery?.assigned ?? "..."} · Delivered: {delivery?.delivered ?? "..."} · Failed: {delivery?.failed ?? "..."}</p>
        </article>
        <article className="rounded-lg border bg-card p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Repeat2 className="h-4 w-4" /> Retention</h2>
          <p className="mt-2 text-sm text-muted-foreground">Repeat customers: {retention?.repeatCustomers ?? "..."} · Rate: {retention ? `${Math.round(retention.repeatCustomerRate * 100)}%` : "..."}</p>
        </article>
      </div>
    </div>
  );
}
