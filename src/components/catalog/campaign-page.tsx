import Image from "next/image";
import Link from "next/link";
import { CategoryTileGrid } from "@/components/catalog/category-tile-grid";
import { PromoGrid } from "@/components/catalog/promo-grid";
import { CircularCategoryRail } from "@/components/home/circular-category-rail";
import { ProductRail } from "@/components/home/product-rail";
import type { CampaignPage as CampaignPageType } from "@/types/storefront";

type CampaignPageProps = {
  page: CampaignPageType;
};

export function CampaignPage({ page }: CampaignPageProps) {
  return (
    <main className="container-page py-6">
      <h1 className="sr-only">{page.title}</h1>
      {page.squarePromos ? <PromoGrid promos={page.squarePromos} /> : null}
      <Link href={page.hero.href} className="relative mt-0 block aspect-[1240/250] overflow-hidden rounded-md bg-muted">
        <Image src={page.hero.image} alt={page.hero.title} fill priority sizes="1240px" className="object-cover" unoptimized />
      </Link>
      {page.categoryRail ? (
        <CircularCategoryRail title="কোন ধরনের পণ্য খুঁজছেন?" href={page.href} categories={page.categoryRail} />
      ) : null}
      {page.categoryTiles ? (
        <section className="py-8">
          <CategoryTileGrid tiles={page.categoryTiles} />
        </section>
      ) : null}
      {page.sections.map((section) => (
        <ProductRail key={section.id} section={section} />
      ))}
    </main>
  );
}
