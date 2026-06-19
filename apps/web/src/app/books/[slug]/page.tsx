import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { findProductSection, productsForKey, titleFromSlug } from "@/lib/storefront-routing";

type BooksRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function BooksRoute({ params }: BooksRouteProps) {
  const { slug } = await params;
  const section = findProductSection(slug);
  const title = section?.title ?? titleFromSlug(slug);

  return (
    <>
      <SiteHeader />
      <CollectionPage eyebrow="বই" title={title} description={`${title} কালেকশনের নির্বাচিত বই।`} products={section?.products ?? productsForKey(title)} />
      <SiteFooter />
    </>
  );
}
