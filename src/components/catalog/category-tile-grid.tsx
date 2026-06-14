import Image from "next/image";
import Link from "next/link";
import type { PromoBanner } from "@/types/storefront";

type CategoryTileGridProps = {
  tiles: PromoBanner[];
};

export function CategoryTileGrid({ tiles }: CategoryTileGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <Link key={tile.id} href={tile.href} className="relative aspect-[39/11] overflow-hidden rounded-md bg-muted">
          <Image src={tile.image} alt={tile.title} fill sizes="(max-width: 1280px) 50vw, 300px" className="object-cover" unoptimized />
        </Link>
      ))}
    </div>
  );
}
