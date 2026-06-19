"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { UpdateStockRequest } from "@bookpie/shared";
import { updateStockRequestSchema } from "@bookpie/shared";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StockFormProps = {
  stock: number;
  busy?: boolean;
  onSubmit: (payload: UpdateStockRequest) => void;
};

export function StockForm({ stock, busy, onSubmit }: StockFormProps) {
  const form = useForm<UpdateStockRequest>({
    resolver: zodResolver(updateStockRequestSchema),
    defaultValues: { stock, note: "" },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block text-sm font-medium">
        New stock
        <Input className="mt-1" type="number" min={0} {...form.register("stock", { valueAsNumber: true })} />
      </label>
      <label className="block text-sm font-medium">
        Admin note
        <textarea
          className="mt-1 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...form.register("note")}
        />
      </label>
      {form.formState.errors.stock ? <p className="text-sm text-primary">{form.formState.errors.stock.message}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Updating..." : "Update stock"}
      </Button>
    </form>
  );
}
