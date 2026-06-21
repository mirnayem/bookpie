"use client";

import type { WarehouseOrder } from "@bookpie/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminState } from "@/components/admin/admin-state";
import { WarehouseQueue } from "@/components/admin/warehouse-queue";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin/api";
import { useAuthStore } from "@/stores/auth-store";

export function WarehouseAdminPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const queryClient = useQueryClient();
  const pickingQuery = useQuery({ queryKey: ["admin", "warehouse", "picking"], queryFn: () => adminApi.pickingQueue(token), enabled: Boolean(token) });
  const packingQuery = useQuery({ queryKey: ["admin", "warehouse", "packing"], queryFn: () => adminApi.packingQueue(token), enabled: Boolean(token) });
  const batchPickingMutation = useMutation({
    mutationFn: (orders: WarehouseOrder[]) => adminApi.batchPicking(token, { orderIds: orders.map((order) => order.orderId), note: "Moved to picking from admin warehouse page" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "warehouse"] });
    },
  });
  const verifyMutation = useMutation({
    mutationFn: (order: WarehouseOrder) => adminApi.verifyPacking(token, { orderId: order.orderId, packageCount: 1, note: "Packing verified by admin" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "warehouse"] });
    },
  });
  const dispatchMutation = useMutation({
    mutationFn: (order: WarehouseOrder) => adminApi.dispatchOrder(token, { orderId: order.orderId, carrier: "BookPie Delivery", note: "Dispatched from warehouse" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "warehouse"] });
    },
  });

  if (pickingQuery.isError || packingQuery.isError) {
    return <AdminState variant="error" title="Warehouse failed to load" description="Could not load warehouse queues." actionLabel="Retry" onAction={() => {
      void pickingQuery.refetch();
      void packingQuery.refetch();
    }} />;
  }

  const pickingOrders = pickingQuery.data ?? [];
  const packingOrders = packingQuery.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Warehouse"
        description="Move orders through picking, packing verification, and dispatch."
        action={<Button type="button" disabled={!pickingOrders.length || batchPickingMutation.isPending} onClick={() => batchPickingMutation.mutate(pickingOrders)}>Start batch picking</Button>}
      />
      <WarehouseQueue title="Picking queue" rows={pickingOrders} actionLabel="Pick" busy={batchPickingMutation.isPending} onAction={(order) => batchPickingMutation.mutate([order])} />
      <WarehouseQueue title="Packing queue" rows={packingOrders} actionLabel="Verify packing" busy={verifyMutation.isPending} onAction={(order) => verifyMutation.mutate(order)} secondaryLabel="Dispatch" secondaryBusy={dispatchMutation.isPending} onSecondaryAction={(order) => dispatchMutation.mutate(order)} />
    </div>
  );
}
