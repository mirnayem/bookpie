import { Heart, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/format";
import type { Product } from "@/types/storefront";

type CartItemRowProps = {
  product: Product;
};

export function CartItemRow({ product }: CartItemRowProps) {
  return (
    <article className="grid grid-cols-[86px_1fr_auto] gap-5 border-b py-6">
      <div className="relative h-28 w-20 bg-muted">
        <Image src={product.image} alt={product.title} fill sizes="80px" className="object-cover" unoptimized />
      </div>
      <div>
        <h2 className="text-sm font-semibold md:text-base">{product.title} X ১</h2>
        <div className="mt-4 flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" aria-label="Decrease quantity">
            <Minus className="h-3 w-3" aria-hidden="true" />
          </Button>
          <span className="text-base font-semibold">1</span>
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" aria-label="Increase quantity">
            <Plus className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
        <div className="mt-4 flex gap-3 text-muted-foreground">
          <Trash2 className="h-5 w-5" aria-hidden="true" />
          <Heart className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="text-right text-sm font-semibold">
        <p>{formatTaka(product.price)}</p>
        {product.originalPrice ? <p className="text-muted-foreground line-through">{formatTaka(product.originalPrice)}</p> : null}
      </div>
    </article>
  );
}
