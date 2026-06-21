import { ListingFilterPanel } from "@/components/catalog/listing-filter-panel";
import { PriceRangeFilter } from "@/components/catalog/price-range-filter";
import type { ListingFilter } from "@/types/storefront";

type FilterSidebarProps = {
  filters: ListingFilter[];
  selectedOptions: string[];
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (value: number) => void;
  onMaxPriceChange: (value: number) => void;
  onToggleOption: (option: string) => void;
};

export function FilterSidebar({ filters, selectedOptions, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange, onToggleOption }: FilterSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 space-y-5 lg:block">
      <PriceRangeFilter min={minPrice} max={maxPrice} onMinChange={onMinPriceChange} onMaxChange={onMaxPriceChange} />
      {filters.map((filter) => (
        <ListingFilterPanel key={filter.title} filter={filter} selectedOptions={selectedOptions} onToggle={onToggleOption} />
      ))}
    </aside>
  );
}
