import { Trash2 } from "lucide-react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/storefront";

type CartPageProps = {
  products: Product[];
};

export function CartPage({ products }: CartPageProps) {
  const subtotal = products.reduce((sum, product) => sum + (product.originalPrice ?? product.price), 0);
  const payable = products.reduce((sum, product) => sum + product.price, 0);

  return (
    <main className="container-page py-9">
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="flex items-center justify-between border-b pb-4">
            <h1 className="text-xl font-semibold">শপিং ব্যাগ</h1>
            <Button variant="ghost" className="text-muted-foreground">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear All
            </Button>
          </div>
          {products.map((product, index) => (
            <CartItemRow key={`${product.id}-cart-${index}`} product={product} />
          ))}
        </section>
        <CartSummary subtotal={subtotal} discount={subtotal - payable} delivery={79} />
      </div>
    </main>
  );
}
