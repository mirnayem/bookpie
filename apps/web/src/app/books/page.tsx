import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getStorefrontBooks } from "@/lib/storefront-api";

export default async function BooksIndexRoute() {
  const products = await getStorefrontBooks();

  return (
    <>
      <SiteHeader />
      <CollectionPage eyebrow="বই" title="সব বই" description="BookPie-র নির্বাচিত বইয়ের সংগ্রহ।" products={products} />
      <SiteFooter />
    </>
  );
}
