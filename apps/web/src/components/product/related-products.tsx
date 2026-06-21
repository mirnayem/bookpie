import { ProductRail } from "@/components/home/product-rail";
import type { Product } from "@/types/storefront";

type RelatedProductsProps = {
  products: Product[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  return <ProductRail section={{ id: "related-products", title: "Related products", href: "/books", products }} />;
}
