import { ProductDetailPage } from "@/components/product/product-detail-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { campaignPages } from "@/data/storefront";
import { getStorefrontBook, getStorefrontBooks } from "@/lib/storefront-api";

type ProductRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getStorefrontBook(slug), getStorefrontBooks()]);

  return (
    <>
      <SiteHeader />
      <ProductDetailPage product={product} suggestions={products.slice(0, 5)} promos={[campaignPages.food.hero, campaignPages.gadgets.hero]} />
      <SiteFooter />
    </>
  );
}
