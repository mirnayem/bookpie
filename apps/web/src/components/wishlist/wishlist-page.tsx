"use client";

import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

export function WishlistPage() {
  const wishlist = useCartStore((state) => state.wishlist);
  const moveWishlistToCart = useCartStore((state) => state.moveWishlistToCart);
  const removeWishlist = useCartStore((state) => state.removeWishlist);

  return (
    <main className="container-page py-9">
      <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl font-semibold">উইশলিস্ট</h1>
          <p className="mt-1 text-sm text-muted-foreground">{wishlist.length} saved item{wishlist.length === 1 ? "" : "s"}</p>
        </div>
      </div>
      {wishlist.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {wishlist.map((product) => (
            <article key={product.id} className="rounded-lg border bg-card p-3">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative mx-auto aspect-[9/13] w-full max-w-[160px] bg-muted">
                  <Image src={product.image} alt={product.title} fill sizes="160px" className="object-cover" unoptimized />
                </div>
                <h2 className="mt-3 min-h-10 text-clamp-2 text-sm font-semibold hover:text-primary">{product.title}</h2>
                <p className="mt-1 text-sm font-bold text-primary">{formatTaka(product.price)}</p>
              </Link>
              <div className="mt-3 grid gap-2">
                <Button type="button" size="sm" onClick={() => moveWishlistToCart(product.id)}>
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  Add to cart
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => removeWishlist(product.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center text-center">
          <Heart className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">আপনার উইশলিস্ট খালি</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">পছন্দের বই বা পণ্য সংরক্ষণ করলে এখানে দেখা যাবে।</p>
          <Button asChild className="mt-5">
            <Link href="/">Browse products</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
