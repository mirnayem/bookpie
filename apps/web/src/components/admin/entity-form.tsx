"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { UpsertAuthorRequest } from "@bookpie/shared";
import { upsertAuthorRequestSchema } from "@bookpie/shared";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EntityFormProps = {
  defaultValues?: UpsertAuthorRequest;
  busy?: boolean;
  onSubmit: (payload: UpsertAuthorRequest) => void;
};

export function EntityForm({ defaultValues, busy, onSubmit }: EntityFormProps) {
  const form = useForm<UpsertAuthorRequest>({
    resolver: zodResolver(upsertAuthorRequestSchema),
    defaultValues: defaultValues ?? { name: "", slug: "" },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="block text-sm font-medium">
        Name
        <Input className="mt-1" {...form.register("name")} />
      </label>
      {form.formState.errors.name ? <p className="text-sm text-primary">{form.formState.errors.name.message}</p> : null}
      <label className="block text-sm font-medium">
        Slug
        <Input className="mt-1" {...form.register("slug")} />
      </label>
      {form.formState.errors.slug ? <p className="text-sm text-primary">{form.formState.errors.slug.message}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
