import Image from "next/image";
import Link from "next/link";
import type { PromoBanner } from "@/types/storefront";

type PromoGridProps = {
  promos: PromoBanner[];
};

export function PromoGrid({ promos }: PromoGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {promos.map((promo) => (
        <Link key={promo.id} href={promo.href} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image src={promo.image} alt={promo.title} fill sizes="(max-width: 1280px) 50vw, 310px" className="object-cover" unoptimized />
        </Link>
      ))}
    </div>
  );
}
