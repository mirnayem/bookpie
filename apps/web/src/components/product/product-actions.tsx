"use client";

import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/storefront";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

type ProductActionsProps = {
  product: Product;
  size?: "default" | "compact";
};

export function ProductActions({ product, size = "default" }: ProductActionsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const isWishlisted = useCartStore((state) => state.isWishlisted(product.id));
  const compact = size === "compact";

  return (
    <div className={compact ? "mt-3 flex gap-2" : "mt-6 flex flex-wrap gap-3"}>
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        className={compact ? "flex-1" : undefined}
        onClick={() => addItem(product)}
      >
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        {compact ? "Cart" : "অর্ডার করুন"}
      </Button>
      <Button
        type="button"
        variant={isWishlisted ? "default" : "outline"}
        size={compact ? "sm" : "default"}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => toggleWishlist(product)}
      >
        <Heart className={isWishlisted ? "h-4 w-4 fill-current" : "h-4 w-4"} aria-hidden="true" />
        {!compact ? "Wishlist" : null}
      </Button>
    </div>
  );
}
