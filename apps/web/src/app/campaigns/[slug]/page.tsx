import { CampaignPage } from "@/components/catalog/campaign-page";
import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { findCampaign, productsForKey, titleFromSlug } from "@/lib/storefront-routing";

type CampaignRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function CampaignRoute({ params }: CampaignRouteProps) {
  const { slug } = await params;
  const campaign = findCampaign(slug);
  const title = campaign?.title ?? titleFromSlug(slug);

  return (
    <>
      <SiteHeader />
      {campaign ? (
        <CampaignPage page={campaign} />
      ) : (
        <CollectionPage eyebrow="ক্যাম্পেইন" title={title} description={`${title} ক্যাম্পেইনের নির্বাচিত পণ্য।`} products={productsForKey(title)} />
      )}
      <SiteFooter />
    </>
  );
}
