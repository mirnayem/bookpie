type SummaryLineProps = {
  label: string;
  value: string;
  strong?: boolean;
};

export function SummaryLine({ label, value, strong = false }: SummaryLineProps) {
  return (
    <div className="flex items-center justify-between border-b pb-4 last:border-b-0">
      <span className={strong ? "font-semibold" : "text-foreground/80"}>{label}</span>
      <span className={strong ? "font-bold" : "font-semibold"}>{value}</span>
    </div>
  );
}
