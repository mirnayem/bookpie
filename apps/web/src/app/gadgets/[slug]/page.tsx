import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { productsForKey, titleFromSlug } from "@/lib/storefront-routing";

type GadgetCategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function GadgetCategoryRoute({ params }: GadgetCategoryRouteProps) {
  const { slug } = await params;
  const title = titleFromSlug(slug);

  return (
    <>
      <SiteHeader />
      <CollectionPage eyebrow="গ্যাজেট" title={title} description={`${title} গ্যাজেট কালেকশন।`} products={productsForKey(title)} />
      <SiteFooter />
    </>
  );
}
