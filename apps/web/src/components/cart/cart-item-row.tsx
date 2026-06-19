"use client";

import { Heart, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/format";
import type { CartLine } from "@/stores/cart-store";

type CartItemRowProps = {
  item: CartLine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onWishlist: () => void;
};

export function CartItemRow({ item, onIncrement, onDecrement, onRemove, onWishlist }: CartItemRowProps) {
  const { product, quantity } = item;

  return (
    <article className="grid grid-cols-[76px_1fr] gap-4 border-b py-6 sm:grid-cols-[86px_1fr_auto] sm:gap-5">
      <div className="relative h-28 w-20 bg-muted">
        <Image src={product.image} alt={product.title} fill sizes="80px" className="object-cover" unoptimized />
      </div>
      <div>
        <h2 className="text-sm font-semibold md:text-base">{product.title} X {quantity}</h2>
        <div className="mt-4 flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-full" aria-label="Decrease quantity" onClick={onDecrement}>
            <Minus className="h-3 w-3" aria-hidden="true" />
          </Button>
          <span className="min-w-4 text-center text-base font-semibold">{quantity}</span>
          <Button type="button" variant="outline" size="icon" className="h-7 w-7 rounded-full" aria-label="Increase quantity" onClick={onIncrement}>
            <Plus className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-4 flex gap-3 text-muted-foreground">
          <button type="button" aria-label="Remove item" className="hover:text-primary" onClick={onRemove}>
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Move item to wishlist" className="hover:text-primary" onClick={onWishlist}>
            <Heart className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="col-span-2 text-left text-sm font-semibold sm:col-span-1 sm:text-right">
        <p>{formatTaka(product.price * quantity)}</p>
        {product.originalPrice ? <p className="text-muted-foreground line-through">{formatTaka(product.originalPrice * quantity)}</p> : null}
      </div>
    </article>
  );
}
