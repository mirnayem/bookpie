import Image from "next/image";
import Link from "next/link";
import { formatTaka } from "@/lib/format";
import type { Product } from "@/types/storefront";

type ProductSuggestionCardProps = {
  product: Product;
};

export function ProductSuggestionCard({ product }: ProductSuggestionCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="grid grid-cols-[62px_1fr] gap-3 rounded-lg border bg-card p-3 hover:border-primary/50">
      <div className="relative h-20 w-14 bg-muted">
        <Image src={product.image} alt={product.title} fill sizes="56px" className="object-cover" unoptimized />
      </div>
      <div className="min-w-0">
        <h3 className="text-clamp-2 text-sm font-semibold">{product.title}</h3>
        <p className="mt-1 text-clamp-1 text-xs text-muted-foreground">{product.author}</p>
        <p className="mt-1 text-xs font-bold text-primary">{formatTaka(product.price)}</p>
      </div>
    </Link>
  );
}
