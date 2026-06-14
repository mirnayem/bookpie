import { CartPage } from "@/components/cart/cart-page";
import { SiteHeader } from "@/components/layout/site-header";
import { products } from "@/data/storefront";

export default function CartRoute() {
  return (
    <>
      <SiteHeader />
      <CartPage products={products.slice(8, 15)} />
    </>
  );
}
