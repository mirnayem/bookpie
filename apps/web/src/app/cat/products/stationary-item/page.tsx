import { ListingPage } from "@/components/catalog/listing-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { listingPages } from "@/data/storefront";

export default function StationaryListingRoute() {
  return (
    <>
      <SiteHeader />
      <ListingPage page={listingPages.stationary} />
      <SiteFooter />
    </>
  );
}
