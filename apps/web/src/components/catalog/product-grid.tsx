"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/home/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/storefront";

type ProductGridProps = {
  products: Product[];
};

const PAGE_SIZE = 10;

export function ProductGrid({ products }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visibleProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);
  const hasMoreProducts = visibleCount < products.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [products]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMoreProducts) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, products.length));
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMoreProducts, products.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-3 xl:grid-cols-5">
        {visibleProducts.map((product, index) => (
          <ProductCard key={`${product.id}-${index}`} product={product} />
        ))}
      </div>
      <div ref={sentinelRef} className="mt-8 flex min-h-12 justify-center">
        {hasMoreProducts ? (
          <Button type="button" variant="outline" onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, products.length))}>
            Load more
          </Button>
        ) : products.length > PAGE_SIZE ? (
          <p className="text-sm text-muted-foreground">All products loaded</p>
        ) : null}
      </div>
    </>
  );
}
