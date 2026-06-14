import type { ListingFilter } from "@/types/storefront";

type ListingFilterPanelProps = {
  filter: ListingFilter;
};

export function ListingFilterPanel({ filter }: ListingFilterPanelProps) {
  return (
    <section className="overflow-hidden rounded-md border bg-card">
      <h2 className="bg-muted px-4 py-3 text-sm font-semibold">{filter.title}</h2>
      <div className="max-h-44 divide-y overflow-y-auto">
        {filter.options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-foreground/75">
            {option}
            <input type="checkbox" className="h-4 w-4 rounded-full border-border accent-primary" />
          </label>
        ))}
      </div>
    </section>
  );
}
