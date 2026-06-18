"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { OrderStatus, UpdateOrderStatusRequest } from "@bookpie/shared";
import { updateOrderStatusRequestSchema } from "@bookpie/shared";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const orderStatuses: OrderStatus[] = ["pending", "confirmed", "picking", "packed", "out_for_delivery", "delivered", "cancelled", "refunded"];

type OrderStatusFormProps = {
  status: OrderStatus;
  busy?: boolean;
  onSubmit: (payload: UpdateOrderStatusRequest) => void;
};

export function OrderStatusForm({ status, busy, onSubmit }: OrderStatusFormProps) {
  const form = useForm<UpdateOrderStatusRequest>({
    resolver: zodResolver(updateOrderStatusRequestSchema),
    defaultValues: { status, note: "" },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block text-sm font-medium">
        Order status
        <Select className="mt-1" options={orderStatuses.map((value) => ({ label: value.replaceAll("_", " "), value }))} {...form.register("status")} />
      </label>
      <label className="block text-sm font-medium">
        Timeline note
        <textarea
          className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...form.register("note")}
        />
      </label>
      <Button type="submit" disabled={busy}>
        {busy ? "Updating..." : "Update order"}
      </Button>
    </form>
  );
}
