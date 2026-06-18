import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  helper?: string;
};

export function AdminStatCard({ label, value, icon: Icon, helper }: AdminStatCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      {helper ? <p className="mt-4 text-xs text-muted-foreground">{helper}</p> : null}
    </article>
  );
}
