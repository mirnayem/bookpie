"use client";

import type { UpdateProfileRequest } from "@bookpie/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfileRequestSchema } from "@bookpie/shared";
import { useForm } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminState } from "@/components/admin/admin-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/admin/api";
import { useAuthStore } from "@/stores/auth-store";

export function SettingsAdminPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["admin", "profile"], queryFn: () => adminApi.profile(token), enabled: Boolean(token) });
  const form = useForm<UpdateProfileRequest>({ resolver: zodResolver(updateProfileRequestSchema), values: { displayName: profileQuery.data?.displayName ?? "", phone: profileQuery.data?.phone ?? "", dateOfBirth: profileQuery.data?.dateOfBirth ?? null } });
  const mutation = useMutation({
    mutationFn: (payload: UpdateProfileRequest) => adminApi.updateProfile(token, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
  });

  if (profileQuery.isError) {
    return <AdminState variant="error" title="Profile failed to load" description={profileQuery.error.message} actionLabel="Retry" onAction={() => profileQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Manage admin profile and store configuration placeholders." />
      <section id="profile" className="rounded-lg border bg-card p-5">
        <h2 className="text-lg font-semibold">Admin profile</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((payload) => mutation.mutate(payload))}>
          <label className="block text-sm font-medium">
            Display name
            <Input className="mt-1" {...form.register("displayName")} />
          </label>
          <label className="block text-sm font-medium">
            Phone
            <Input className="mt-1" {...form.register("phone")} />
          </label>
          <label className="block text-sm font-medium">
            Date of birth
            <Input className="mt-1" type="date" {...form.register("dateOfBirth")} />
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save profile"}</Button>
          </div>
        </form>
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {["Password changes need a backend endpoint.", "Store contact settings need backend persistence.", "Payment and delivery defaults need backend settings APIs."].map((text) => (
          <article key={text} className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
            {text}
          </article>
        ))}
      </section>
    </div>
  );
}
