import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { productsForKey, titleFromSlug } from "@/lib/storefront-routing";

type LifestyleCategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function LifestyleCategoryRoute({ params }: LifestyleCategoryRouteProps) {
  const { slug } = await params;
  const title = titleFromSlug(slug);

  return (
    <>
      <SiteHeader />
      <CollectionPage eyebrow="লাইফস্টাইল" title={title} description={`${title} লাইফস্টাইল পণ্যের কালেকশন।`} products={productsForKey(title)} />
      <SiteFooter />
    </>
  );
}
