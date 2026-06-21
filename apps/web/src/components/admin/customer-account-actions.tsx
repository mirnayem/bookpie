"use client";

import type { AdminUpdateUserRequest, CustomerProfile, UserRole } from "@bookpie/shared";
import { adminUpdateUserRequestSchema } from "@bookpie/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { AdminBadge } from "@/components/admin/admin-badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { adminApi } from "@/lib/admin/api";
import { useAuthStore } from "@/stores/auth-store";

type CustomerAccountActionsProps = {
  profile: CustomerProfile;
  onSaved: () => Promise<void> | void;
};

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: "Customer", value: "customer" },
  { label: "Warehouse manager", value: "warehouse_manager" },
  { label: "Delivery agent", value: "delivery_agent" },
  { label: "Admin", value: "admin" },
  { label: "Super admin", value: "super_admin" },
];

export function CustomerAccountActions({ profile, onSaved }: CustomerAccountActionsProps) {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const form = useForm<AdminUpdateUserRequest>({
    resolver: zodResolver(adminUpdateUserRequestSchema),
    values: { role: profile.role, isActive: profile.isActive },
  });
  const mutation = useMutation({
    mutationFn: (payload: AdminUpdateUserRequest) => adminApi.updateUser(token, profile.userId, payload),
    onSuccess: async () => {
      await onSaved();
    },
  });

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Account controls</h3>
          <p className="text-sm text-muted-foreground">Manage this user role and access state.</p>
        </div>
        <AdminBadge tone={profile.isActive ? "success" : "danger"}>{profile.isActive ? "Active" : "Blocked"}</AdminBadge>
      </div>
      <form className="grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={form.handleSubmit((payload) => mutation.mutate(payload))}>
        <label className="block text-sm font-medium">
          Role
          <Select className="mt-1" options={roleOptions} {...form.register("role")} />
        </label>
        <label className="flex items-center gap-2 self-end rounded-md border px-3 py-2 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4 accent-primary" {...form.register("isActive")} />
          Active account
        </label>
        {mutation.isError ? <p className="text-sm text-destructive md:col-span-2">{mutation.error.message}</p> : null}
        {mutation.isSuccess ? <p className="text-sm text-emerald-600 md:col-span-2">Account updated.</p> : null}
        <div className="md:col-span-2">
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save account controls"}</Button>
        </div>
      </form>
    </section>
  );
}
