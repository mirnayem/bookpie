import type { DeliveryStatus, OrderStatus, PaymentStatus } from "@bookpie/shared";

import { AdminBadge } from "@/components/admin/admin-badge";

type StatusBadgeProps = {
  status: OrderStatus | PaymentStatus | DeliveryStatus;
};

export function OrderStatusBadge({ status }: StatusBadgeProps) {
  const tone = status === "delivered" || status === "paid" ? "success" : status === "cancelled" || status === "failed" || status === "refunded" ? "danger" : status === "pending" ? "warning" : "default";

  return <AdminBadge tone={tone}>{status.replaceAll("_", " ")}</AdminBadge>;
}
