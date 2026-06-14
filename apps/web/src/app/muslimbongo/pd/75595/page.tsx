import { ProductDetailPage } from "@/components/product/product-detail-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { campaignPages, products } from "@/data/storefront";

export default function ProductDetailRoute() {
  return (
    <>
      <SiteHeader />
      <ProductDetailPage product={products[12]} suggestions={products.slice(14, 19)} promos={[campaignPages.lifestyle.hero, campaignPages.gadgets.hero]} />
      <SiteFooter />
    </>
  );
}
