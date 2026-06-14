import { CampaignPage } from "@/components/catalog/campaign-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { campaignPages } from "@/data/storefront";

export default function PreorderRoute() {
  return (
    <>
      <SiteHeader />
      <CampaignPage page={campaignPages.preorder} />
      <SiteFooter />
    </>
  );
}
