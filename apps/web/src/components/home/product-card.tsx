import Image from "next/image";
import Link from "next/link";
import { DiscountBadge } from "@/components/home/discount-badge";
import { ProductActions } from "@/components/product/product-actions";
import { formatTaka } from "@/lib/format";
import type { Product } from "@/types/storefront";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  priority?: boolean;
};

export function ProductCard({ product, compact = false, priority = false }: ProductCardProps) {
  return (
    <article className="group min-w-0">
      <Link href={`/products/${product.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative mx-auto aspect-[9/13] w-full max-w-[164px] overflow-hidden bg-muted">
          {product.discountPercent ? <DiscountBadge percent={product.discountPercent} /> : null}
          <Image
            src={product.image}
            alt={product.title}
            fill
            priority={priority}
            sizes={compact ? "100px" : "(max-width: 768px) 42vw, 180px"}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        </div>
        <h3 className="mt-3 min-h-10 text-clamp-2 text-sm font-semibold leading-5 group-hover:text-primary">{product.title}</h3>
        {product.author ? <p className="mt-1 text-clamp-1 text-xs text-muted-foreground">{product.author}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-primary">{formatTaka(product.price)}</span>
          {product.originalPrice ? <span className="text-xs text-muted-foreground line-through">{formatTaka(product.originalPrice)}</span> : null}
        </div>
      </Link>
      <ProductActions product={product} size="compact" />
    </article>
  );
}
