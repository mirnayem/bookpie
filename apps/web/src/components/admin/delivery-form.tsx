"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AssignDeliveryRequest, DeliveryAssignment, DeliveryStatus } from "@bookpie/shared";
import { assignDeliveryRequestSchema } from "@bookpie/shared";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const deliveryStatuses: DeliveryStatus[] = ["assigned", "picked_up", "delivered", "failed"];

type DeliveryFormProps = {
  delivery?: DeliveryAssignment | null;
  busy?: boolean;
  onSubmit: (payload: AssignDeliveryRequest) => void;
};

export function DeliveryForm({ delivery, busy, onSubmit }: DeliveryFormProps) {
  const form = useForm<AssignDeliveryRequest>({
    resolver: zodResolver(assignDeliveryRequestSchema),
    defaultValues: {
      agentName: delivery?.agentName ?? "",
      agentPhone: delivery?.agentPhone ?? "",
      status: delivery?.status ?? "assigned",
      note: delivery?.note ?? "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block text-sm font-medium">
        Agent name
        <Input className="mt-1" {...form.register("agentName")} />
      </label>
      <label className="block text-sm font-medium">
        Agent phone
        <Input className="mt-1" {...form.register("agentPhone")} />
      </label>
      <label className="block text-sm font-medium">
        Delivery status
        <Select className="mt-1" options={deliveryStatuses.map((value) => ({ label: value.replaceAll("_", " "), value }))} {...form.register("status")} />
      </label>
      <label className="block text-sm font-medium">
        Note
        <textarea
          className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...form.register("note")}
        />
      </label>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving..." : "Save delivery assignment"}
      </Button>
    </form>
  );
}
