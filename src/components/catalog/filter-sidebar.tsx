import { ListingFilterPanel } from "@/components/catalog/listing-filter-panel";
import { PriceRangeFilter } from "@/components/catalog/price-range-filter";
import type { ListingFilter } from "@/types/storefront";

type FilterSidebarProps = {
  filters: ListingFilter[];
};

export function FilterSidebar({ filters }: FilterSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 space-y-5 lg:block">
      <PriceRangeFilter />
      {filters.map((filter) => (
        <ListingFilterPanel key={filter.title} filter={filter} />
      ))}
    </aside>
  );
}
