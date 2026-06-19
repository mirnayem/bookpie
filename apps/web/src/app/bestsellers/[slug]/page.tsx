import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { findRankedList, productsForKey, titleFromSlug } from "@/lib/storefront-routing";

type BestsellersRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function BestsellersRoute({ params }: BestsellersRouteProps) {
  const { slug } = await params;
  const rankedList = findRankedList(slug);
  const title = rankedList?.title ?? titleFromSlug(slug);

  return (
    <>
      <SiteHeader />
      <CollectionPage
        eyebrow="বেস্টসেলার"
        title={title}
        description={`${title} বিভাগে সবচেয়ে জনপ্রিয় বই।`}
        products={rankedList?.products ?? productsForKey(title)}
      />
      <SiteFooter />
    </>
  );
}
