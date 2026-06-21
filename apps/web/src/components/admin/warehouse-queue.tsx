import type { WarehouseOrder } from "@bookpie/shared";
import { PackageCheck, Truck } from "lucide-react";

import { AdminState } from "@/components/admin/admin-state";
import { AdminTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/format";

type WarehouseQueueProps = {
  title: string;
  rows: WarehouseOrder[];
  actionLabel: string;
  busy: boolean;
  onAction: (order: WarehouseOrder) => void;
  secondaryLabel?: string;
  secondaryBusy?: boolean;
  onSecondaryAction?: (order: WarehouseOrder) => void;
};

export function WarehouseQueue({ title, rows, actionLabel, busy, onAction, secondaryLabel, secondaryBusy = false, onSecondaryAction }: WarehouseQueueProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <AdminTable
        rows={rows}
        getRowKey={(order) => order.orderId}
        columns={[
          { key: "order", header: "Order", render: (order) => <span className="font-medium">{order.orderId.slice(0, 8)}</span> },
          { key: "status", header: "Status", render: (order) => order.status.replaceAll("_", " ") },
          { key: "items", header: "Items", render: (order) => String(order.itemCount) },
          { key: "total", header: "Total", render: (order) => formatTaka(order.total) },
          {
            key: "actions",
            header: "Actions",
            render: (order) => (
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" disabled={busy} onClick={() => onAction(order)}><PackageCheck className="mr-2 h-4 w-4" />{actionLabel}</Button>
                {secondaryLabel && onSecondaryAction ? <Button type="button" size="sm" variant="outline" disabled={secondaryBusy} onClick={() => onSecondaryAction(order)}><Truck className="mr-2 h-4 w-4" />{secondaryLabel}</Button> : null}
              </div>
            ),
          },
        ]}
      />
      {!rows.length ? <AdminState title={`No ${title.toLowerCase()} orders`} description="Orders will appear here as they move through the fulfillment workflow." /> : null}
    </section>
  );
}
