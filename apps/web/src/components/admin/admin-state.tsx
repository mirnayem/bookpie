import { AlertCircle, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminStateProps = {
  title: string;
  description?: string;
  variant?: "empty" | "error";
  actionLabel?: string;
  onAction?: () => void;
};

export function AdminState({ title, description, variant = "empty", actionLabel, onAction }: AdminStateProps) {
  const Icon = variant === "error" ? AlertCircle : Inbox;

  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
      <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      {description ? <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
