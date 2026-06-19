import { cn } from "@/lib/utils";

type AdminBadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

const toneClassNames = {
  default: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  muted: "border-border bg-muted text-muted-foreground",
};

export function AdminBadge({ children, tone = "default" }: AdminBadgeProps) {
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold", toneClassNames[tone])}>{children}</span>;
}
