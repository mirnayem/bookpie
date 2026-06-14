import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { TagGrid } from "@/components/catalog/tag-grid";
import type { ListingPage as ListingPageType } from "@/types/storefront";

type ListingPageProps = {
  page: ListingPageType;
};

export function ListingPage({ page }: ListingPageProps) {
  return (
    <main className="container-page py-8">
      <div className="flex gap-8">
        <FilterSidebar filters={page.filters} />
        <section className="min-w-0 flex-1">
          <h1 className="mb-5 text-xl font-semibold">{page.title}</h1>
          <TagGrid tags={page.tags} />
          <div className="mt-8 flex items-center justify-between text-sm">
            <p className="font-semibold">{page.products.length * 31} Items Found</p>
            <label className="flex items-center gap-2 text-muted-foreground">
              Sort by:
              <select className="rounded-md border bg-background px-2 py-1 font-semibold text-foreground">
                <option>New Released</option>
                <option>Price Low to High</option>
              </select>
            </label>
          </div>
          <div className="mt-5">
            <ProductGrid products={page.products} />
          </div>
        </section>
      </div>
    </main>
  );
}
