"use client";

import { useQuery } from "@tanstack/react-query";
import { Boxes, DollarSign, PackageOpen, ShoppingBag, UsersRound } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminState } from "@/components/admin/admin-state";
import { AdminTable } from "@/components/admin/admin-table";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { StockStatusBadge } from "@/components/admin/stock-status-badge";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/format";
import { adminApi } from "@/lib/admin/api";
import { useAuthStore } from "@/stores/auth-store";

export function AdminDashboardPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const summaryQuery = useQuery({ queryKey: ["admin", "summary"], queryFn: () => adminApi.dashboardSummary(token), enabled: Boolean(token) });
  const ordersQuery = useQuery({ queryKey: ["admin", "orders", "recent"], queryFn: () => adminApi.orders(token, { limit: 5, offset: 0 }), enabled: Boolean(token) });
  const inventoryQuery = useQuery({ queryKey: ["admin", "inventory", "low"], queryFn: () => adminApi.inventory(token, { limit: 10, offset: 0 }), enabled: Boolean(token) });

  if (summaryQuery.isError) {
    return <AdminState variant="error" title="Dashboard failed to load" description={summaryQuery.error.message} actionLabel="Retry" onAction={() => summaryQuery.refetch()} />;
  }

  const summary = summaryQuery.data;
  const lowStock = (inventoryQuery.data ?? []).filter((item) => item.stock <= 5);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Dashboard"
        description="Monitor bookstore operations and jump into daily admin workflows."
        action={
          <>
            <Button asChild variant="outline">
              <Link href="/admin/inventory">Update stock</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/products">Create product</Link>
            </Button>
          </>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <AdminStatCard label="Customers" value={String(summary?.totalCustomers ?? "...")} icon={UsersRound} />
        <AdminStatCard label="Books" value={String(summary?.totalBooks ?? "...")} icon={PackageOpen} />
        <AdminStatCard label="Orders" value={String(summary?.totalOrders ?? "...")} icon={ShoppingBag} />
        <AdminStatCard label="Pending" value={String(summary?.pendingOrders ?? "...")} icon={ShoppingBag} helper="Needs review" />
        <AdminStatCard label="Low stock" value={String(summary?.lowStockBooks ?? "...")} icon={Boxes} />
        <AdminStatCard label="Revenue" value={summary ? formatTaka(summary.paidRevenue) : "..."} icon={DollarSign} />
      </section>
      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <AdminPageHeader title="Recent orders" action={<Button asChild variant="link"><Link href="/admin/orders">View all</Link></Button>} />
          {ordersQuery.data?.length ? (
            <AdminTable
              rows={ordersQuery.data}
              getRowKey={(order) => order.id}
              columns={[
                { key: "id", header: "Order", render: (order) => <Link className="font-semibold text-primary" href={`/admin/orders?order=${order.id}`}>{order.id.slice(0, 8)}</Link> },
                { key: "status", header: "Status", render: (order) => <OrderStatusBadge status={order.status} /> },
                { key: "payment", header: "Payment", render: (order) => <OrderStatusBadge status={order.paymentStatus} /> },
                { key: "total", header: "Total", render: (order) => formatTaka(order.total) },
              ]}
            />
          ) : (
            <AdminState title="No orders yet" description="Orders will appear here after customers complete checkout." />
          )}
        </div>
        <div className="min-w-0 space-y-3">
          <AdminPageHeader title="Low stock" action={<Button asChild variant="link"><Link href="/admin/inventory">Manage</Link></Button>} />
          {lowStock.length ? (
            <AdminTable
              rows={lowStock}
              getRowKey={(item) => item.bookId}
              columns={[
                { key: "title", header: "Book", render: (item) => <span className="font-medium">{item.title}</span> },
                { key: "stock", header: "Stock", render: (item) => item.stock },
                { key: "status", header: "Status", render: (item) => <StockStatusBadge stock={item.stock} /> },
              ]}
            />
          ) : (
            <AdminState title="No low stock items" description="Inventory levels look healthy." />
          )}
        </div>
      </section>
    </div>
  );
}
