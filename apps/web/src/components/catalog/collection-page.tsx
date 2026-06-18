import Image from "next/image";
import { ProductGrid } from "@/components/catalog/product-grid";
import type { Product } from "@/types/storefront";

type CollectionPageProps = {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  products: Product[];
  eyebrow?: string;
};

export function CollectionPage({ title, description, image, imageAlt, products, eyebrow }: CollectionPageProps) {
  return (
    <main className="container-page py-8">
      <section className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {image ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <Image src={image} alt={imageAlt ?? title} fill sizes="96px" className="object-contain p-3" unoptimized />
            </div>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? <p className="text-sm font-semibold text-primary">{eyebrow}</p> : null}
            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
            {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
          </div>
        </div>
      </section>
      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">পণ্যসমূহ</h2>
          <p className="text-sm text-muted-foreground">{products.length} items</p>
        </div>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
