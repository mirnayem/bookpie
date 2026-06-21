import { ProductGrid } from "@/components/catalog/product-grid";
import { SiteHeader } from "@/components/layout/site-header";
import { products } from "@/data/storefront";

type SearchRouteProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchRoute({ searchParams }: SearchRouteProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = getSearchResults(query);

  return (
    <>
      <SiteHeader />
      <main className="container-page py-9">
        <h1 className="text-xl font-semibold">Search results</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {query ? `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"` : "Type a search term to find books and products."}
        </p>
        <div className="mt-8">
          {results.length ? <ProductGrid products={results} /> : <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No products matched your search.</p>}
        </div>
      </main>
    </>
  );
}

function getSearchResults(query: string) {
  if (!query) return products.slice(0, 12);
  if (["book", "books", "product", "products"].includes(query)) return products;

  return products.filter((product) => `${product.title} ${product.author ?? ""} ${product.slug}`.toLowerCase().includes(query));
}
