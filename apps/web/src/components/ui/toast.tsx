import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "info" | "warning" | "error";

export type ToastProps = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  className?: string;
};

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  info: "border-border bg-background text-foreground",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  error: "border-red-200 bg-red-50 text-red-950",
};

const variantIcons = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: XCircle,
};

export function Toast({ title, description, variant = "info", className }: ToastProps) {
  const Icon = variantIcons[variant];

  return (
    <div className={cn("flex w-full max-w-sm gap-3 rounded-md border p-4 shadow-soft", variantStyles[variant], className)} role="status">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="mt-1 text-sm opacity-80">{description}</p> : null}
      </div>
    </div>
  );
}
