import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatTaka } from "@/lib/format";
import type { RankedList } from "@/types/storefront";

type RankedListPanelProps = {
  list: RankedList;
};

export function RankedListPanel({ list }: RankedListPanelProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-primary/50 bg-card">
      <header className="bg-primary px-4 py-3 text-primary-foreground">
        <h2 className="text-sm font-semibold">{list.title}</h2>
      </header>
      <div className="divide-y divide-primary/30">
        {list.products.slice(0, 4).map((product, index) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="grid grid-cols-[54px_1fr] gap-3 p-3 hover:bg-accent/50">
            <div className="relative h-20 w-14 bg-muted">
              <span className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
              <Image src={product.image} alt={product.title} fill sizes="54px" className="object-cover" unoptimized />
            </div>
            <div className="min-w-0">
              <h3 className="text-clamp-2 text-sm font-semibold leading-5">{product.title}</h3>
              <p className="mt-1 text-clamp-1 text-xs text-muted-foreground">{product.author ?? "BookPie Collection"}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-bold text-primary">{formatTaka(product.price)}</span>
                {product.originalPrice ? <span className="text-xs text-muted-foreground line-through">{formatTaka(product.originalPrice)}</span> : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link href={list.href} className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-primary hover:bg-accent">
        সব দেখুন
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
