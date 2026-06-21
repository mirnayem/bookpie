"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types/storefront";

type FrequentlyBoughtTogetherProps = {
  product: Product;
  products: Product[];
};

export function FrequentlyBoughtTogether({ product, products }: FrequentlyBoughtTogetherProps) {
  const addItem = useCartStore((state) => state.addItem);
  const bundle = [product, ...products.filter((item) => item.id !== product.id).slice(0, 2)];
  const bundleTotal = bundle.reduce((sum, item) => sum + item.price, 0);

  const addBundle = () => {
    bundle.forEach((item) => addItem(item, 1));
  };

  return (
    <section className="border-t py-8">
      <div className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Frequently bought together</h2>
            <p className="mt-1 text-sm text-muted-foreground">এই বইয়ের সঙ্গে পাঠকেরা এগুলোও কিনছেন।</p>
          </div>
          <Button type="button" onClick={addBundle}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Add bundle {formatTaka(bundleTotal)}
          </Button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {bundle.map((item) => (
            <article key={item.id} className="flex items-center gap-4 rounded-md bg-muted/60 p-3">
              <div className="relative h-20 w-14 shrink-0 overflow-hidden bg-background">
                <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover" unoptimized />
              </div>
              <div className="min-w-0">
                <h3 className="text-clamp-2 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm font-bold text-primary">{formatTaka(item.price)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
