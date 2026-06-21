import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { products } from "@/data/storefront";

export default function BooksIndexRoute() {
  return (
    <>
      <SiteHeader />
      <CollectionPage eyebrow="বই" title="সব বই" description="BookPie-র নির্বাচিত বইয়ের সংগ্রহ।" products={products} />
      <SiteFooter />
    </>
  );
}
