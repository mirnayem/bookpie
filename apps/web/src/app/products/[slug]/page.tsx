import { ProductDetailPage } from "@/components/product/product-detail-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { campaignPages, products } from "@/data/storefront";

type ProductRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const product =
    products.find((item) => item.slug === decodedSlug)
    ?? products.find((item) => item.title === decodedSlug)
    ?? products.find((item) => item.slug.includes(decodedSlug) || decodedSlug.includes(item.slug))
    ?? products[0];

  return (
    <>
      <SiteHeader />
      <ProductDetailPage product={product} suggestions={products.slice(0, 5)} promos={[campaignPages.food.hero, campaignPages.gadgets.hero]} />
      <SiteFooter />
    </>
  );
}
