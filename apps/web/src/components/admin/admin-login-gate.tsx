"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { loginRequestSchema, type LoginRequest } from "@bookpie/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api-client";
import { isAdminUser, useAuthStore } from "@/stores/auth-store";

type AdminLoginGateProps = {
  children: React.ReactNode;
};

export function AdminLoginGate({ children }: AdminLoginGateProps) {
  const { user, setAuth } = useAuthStore();
  const isAdmin = isAdminUser(user);
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => setAuth(response),
  });

  if (isAdmin) {
    return children;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <section className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use an admin or super admin account to continue.</p>
        </div>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((payload) => {
            mutation.mutate(payload);
          })}
        >
          <label className="block text-sm font-medium">
            Email
            <Input className="mt-1" type="email" autoComplete="email" {...form.register("email")} />
          </label>
          {form.formState.errors.email ? <p className="text-sm text-primary">{form.formState.errors.email.message}</p> : null}
          <label className="block text-sm font-medium">
            Password
            <Input className="mt-1" type="password" autoComplete="current-password" {...form.register("password")} />
          </label>
          {form.formState.errors.password ? <p className="text-sm text-primary">{form.formState.errors.password.message}</p> : null}
          {mutation.error ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{mutation.error.message}</p> : null}
          {mutation.data && !isAdminUser(mutation.data.user) ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">This account does not have admin access.</p> : null}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </section>
    </main>
  );
}
