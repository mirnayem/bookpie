"use client";

import { useMemo, useState } from "react";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { TagGrid } from "@/components/catalog/tag-grid";
import type { ListingPage as ListingPageType } from "@/types/storefront";

type ListingPageProps = {
  page: ListingPageType;
};

export function ListingPage({ page }: ListingPageProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(30000);
  const [sort, setSort] = useState("new");
  const filteredProducts = useMemo(() => {
    const optionFiltered = page.products.filter((product, index) => {
      const inPriceRange = product.price >= minPrice && product.price <= maxPrice;
      if (!inPriceRange) return false;
      if (!selectedOptions.length) return true;

      return selectedOptions.every((option) => stableFilterMatch(`${product.title}-${product.author ?? ""}-${option}`, index));
    });

    return [...optionFiltered].sort((left, right) => {
      if (sort === "price-low") return left.price - right.price;
      if (sort === "price-high") return right.price - left.price;
      if (sort === "title") return left.title.localeCompare(right.title, "bn");
      return page.products.indexOf(left) - page.products.indexOf(right);
    });
  }, [maxPrice, minPrice, page.products, selectedOptions, sort]);

  const toggleOption = (option: string) => {
    setSelectedOptions((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]));
  };

  return (
    <main className="container-page py-8">
      <div className="flex gap-8">
        <FilterSidebar
          filters={page.filters}
          selectedOptions={selectedOptions}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onToggleOption={toggleOption}
        />
        <section className="min-w-0 flex-1">
          <h1 className="mb-5 text-xl font-semibold">{page.title}</h1>
          <TagGrid tags={page.tags} />
          <div className="mt-8 flex items-center justify-between text-sm">
            <p className="font-semibold">{filteredProducts.length} Items Found</p>
            <label className="flex items-center gap-2 text-muted-foreground">
              Sort by:
              <select className="rounded-md border bg-background px-2 py-1 font-semibold text-foreground" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="new">New Released</option>
                <option value="price-low">Price Low to High</option>
                <option value="price-high">Price High to Low</option>
                <option value="title">Title</option>
              </select>
            </label>
          </div>
          <div className="mt-5">
            {filteredProducts.length ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">No products matched the selected filters.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function stableFilterMatch(value: string, index: number) {
  const hash = Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), index);
  return hash % 4 !== 0;
}
