"use client";

import type { AssignDeliveryRequest, Order, OrderStatus, UpdateOrderStatusRequest } from "@bookpie/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Truck } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminState } from "@/components/admin/admin-state";
import { AdminTable } from "@/components/admin/admin-table";
import { DeliveryForm } from "@/components/admin/delivery-form";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { formatTaka } from "@/lib/format";
import { adminApi } from "@/lib/admin/api";
import { useAuthStore } from "@/stores/auth-store";

type OrdersAdminPageProps = {
  deliveryOnly?: boolean;
};

const statuses: Array<OrderStatus | "all"> = ["all", "pending", "confirmed", "picking", "packed", "out_for_delivery", "delivered", "cancelled", "refunded"];

export function OrdersAdminPage({ deliveryOnly = false }: OrdersAdminPageProps) {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus | "all">(deliveryOnly ? "confirmed" : "all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", status],
    queryFn: () => adminApi.orders(token, { limit: 100, offset: 0, status: status === "all" ? undefined : status }),
    enabled: Boolean(token),
  });
  const rows = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    return deliveryOnly ? orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled") : orders;
  }, [deliveryOnly, ordersQuery.data]);
  const statusMutation = useMutation({
    mutationFn: ({ order, payload }: { order: Order; payload: UpdateOrderStatusRequest }) => adminApi.updateOrderStatus(token, order.id, payload),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      setSelectedOrder(order);
    },
  });
  const deliveryMutation = useMutation({
    mutationFn: ({ order, payload }: { order: Order; payload: AssignDeliveryRequest }) => adminApi.assignDelivery(token, order.id, payload),
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      setSelectedOrder(order);
    },
  });

  if (ordersQuery.isError) {
    return <AdminState variant="error" title="Orders failed to load" description={ordersQuery.error.message} actionLabel="Retry" onAction={() => ordersQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={deliveryOnly ? "Delivery" : "Orders"} description={deliveryOnly ? "Assign and update delivery agents for active orders." : "Review orders, update statuses, and manage delivery assignments."} />
      <div className="max-w-xs">
        <Select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus | "all")} options={statuses.map((value) => ({ label: value.replaceAll("_", " "), value }))} />
      </div>
      {rows.length ? (
        <AdminTable
          rows={rows}
          getRowKey={(order) => order.id}
          columns={[
            { key: "order", header: "Order", render: (order) => <span className="font-semibold">#{order.id.slice(0, 8)}</span> },
            { key: "status", header: "Status", render: (order) => <OrderStatusBadge status={order.status} /> },
            { key: "payment", header: "Payment", render: (order) => <OrderStatusBadge status={order.paymentStatus} /> },
            { key: "delivery", header: "Delivery", render: (order) => order.delivery ? <OrderStatusBadge status={order.delivery.status} /> : <span className="text-muted-foreground">Unassigned</span> },
            { key: "items", header: "Items", render: (order) => order.items.length },
            { key: "total", header: "Total", render: (order) => formatTaka(order.total) },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (order) => (
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                  {deliveryOnly ? <Truck className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  Manage
                </Button>
              ),
            },
          ]}
        />
      ) : (
        <AdminState title="No orders found" description="Orders matching the selected status will appear here." />
      )}
      <Modal open={Boolean(selectedOrder)} title={selectedOrder ? `Order #${selectedOrder.id.slice(0, 8)}` : "Order"} onOpenChange={(open) => !open && setSelectedOrder(null)} className="max-w-5xl">
        {selectedOrder ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                <p className="text-sm"><span className="text-muted-foreground">Created:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p className="text-sm"><span className="text-muted-foreground">Customer:</span> {selectedOrder.userId.slice(0, 8)}</p>
                <p className="text-sm"><span className="text-muted-foreground">Order:</span> <OrderStatusBadge status={selectedOrder.status} /></p>
                <p className="text-sm"><span className="text-muted-foreground">Payment:</span> <OrderStatusBadge status={selectedOrder.paymentStatus} /></p>
              </div>
              <div className="rounded-lg border">
                <div className="border-b p-4 font-semibold">Items</div>
                <div className="divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.bookId} className="grid grid-cols-[1fr_auto] gap-4 p-4 text-sm">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-muted-foreground">{item.quantity} x {formatTaka(item.unitPrice)}</p>
                      </div>
                      <p className="font-semibold">{formatTaka(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold">Timeline</h3>
                <ol className="mt-3 space-y-2 text-sm">
                  <li className="rounded-md bg-muted p-3">Order created · {new Date(selectedOrder.createdAt).toLocaleString()}</li>
                  <li className="rounded-md bg-muted p-3">Current status · {selectedOrder.status.replaceAll("_", " ")}</li>
                  {selectedOrder.delivery ? <li className="rounded-md bg-muted p-3">Delivery · {selectedOrder.delivery.status.replaceAll("_", " ")}</li> : null}
                </ol>
              </div>
            </div>
            <aside className="space-y-5">
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">Totals</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span>Subtotal</span><span>{formatTaka(selectedOrder.subtotal)}</span></p>
                  <p className="flex justify-between"><span>Shipping</span><span>{formatTaka(selectedOrder.shippingFee)}</span></p>
                  <p className="flex justify-between"><span>Discount</span><span>-{formatTaka(selectedOrder.discountTotal)}</span></p>
                  <p className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{formatTaka(selectedOrder.total)}</span></p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">Update status</h3>
                <OrderStatusForm key={selectedOrder.id + selectedOrder.status} status={selectedOrder.status} busy={statusMutation.isPending} onSubmit={(payload) => statusMutation.mutate({ order: selectedOrder, payload })} />
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">Delivery assignment</h3>
                <DeliveryForm key={selectedOrder.id + (selectedOrder.delivery?.id ?? "new")} delivery={selectedOrder.delivery} busy={deliveryMutation.isPending} onSubmit={(payload) => deliveryMutation.mutate({ order: selectedOrder, payload })} />
              </div>
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                Cancellation, refund, and printable invoice actions are disabled until backend workflows are enabled.
              </div>
            </aside>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
