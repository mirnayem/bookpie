import { AdminBadge } from "@/components/admin/admin-badge";

type StockStatusBadgeProps = {
  stock: number;
};

export function StockStatusBadge({ stock }: StockStatusBadgeProps) {
  if (stock === 0) {
    return <AdminBadge tone="danger">Out of stock</AdminBadge>;
  }

  if (stock <= 5) {
    return <AdminBadge tone="warning">Low stock</AdminBadge>;
  }

  return <AdminBadge tone="success">In stock</AdminBadge>;
}
