import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { findCategoryTitle, productsForKey, titleFromSlug } from "@/lib/storefront-routing";

type FoodCategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function FoodCategoryRoute({ params }: FoodCategoryRouteProps) {
  const { slug } = await params;
  const title = findCategoryTitle(slug) ?? titleFromSlug(slug);

  return (
    <>
      <SiteHeader />
      <CollectionPage eyebrow="ফুড" title={title} description={`${title} পণ্যের নির্বাচিত কালেকশন।`} products={productsForKey(title)} />
      <SiteFooter />
    </>
  );
}
