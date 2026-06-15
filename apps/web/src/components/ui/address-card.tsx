import { CheckCircle2, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export type AddressCardProps = {
  name: string;
  phone: string;
  address: string;
  label?: string;
  selected?: boolean;
  className?: string;
};

export function AddressCard({ name, phone, address, label, selected = false, className }: AddressCardProps) {
  return (
    <article className={cn("rounded-md border border-border bg-card p-4 text-sm", selected && "border-primary ring-1 ring-primary", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-card-foreground">{name}</h3>
          {label ? <p className="mt-1 text-xs font-medium text-primary">{label}</p> : null}
        </div>
        {selected ? <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-label="Selected address" /> : null}
      </div>
      <p className="mt-3 flex gap-2 text-muted-foreground">
        <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{phone}</span>
      </p>
      <p className="mt-2 flex gap-2 text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{address}</span>
      </p>
    </article>
  );
}
