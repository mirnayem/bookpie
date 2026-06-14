import { ProductCard } from "@/components/home/product-card";
import type { Product } from "@/types/storefront";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-3 xl:grid-cols-5">
      {products.map((product, index) => (
        <ProductCard key={`${product.id}-${index}`} product={product} />
      ))}
    </div>
  );
}
