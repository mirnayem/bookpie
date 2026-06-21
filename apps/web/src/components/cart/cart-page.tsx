"use client";

import { ShoppingBag, Trash2 } from "lucide-react";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const subtotal = useCartStore((state) => state.originalSubtotal());
  const payable = useCartStore((state) => state.subtotal());

  const moveToWishlist = (productId: string) => {
    const item = items.find((cartItem) => cartItem.product.id === productId);
    if (!item) return;
    toggleWishlist(item.product);
    removeItem(productId);
  };

  return (
    <main className="container-page py-9">
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="flex items-center justify-between border-b pb-4">
            <h1 className="text-xl font-semibold">শপিং ব্যাগ</h1>
            <Button type="button" variant="ghost" className="text-muted-foreground" disabled={!items.length} onClick={clearCart}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear All
            </Button>
          </div>
          {items.length ? (
            items.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onIncrement={() => updateQuantity(item.product.id, item.quantity + 1)}
                onDecrement={() => item.quantity === 1 ? removeItem(item.product.id) : updateQuantity(item.product.id, item.quantity - 1)}
                onRemove={() => removeItem(item.product.id)}
                onWishlist={() => moveToWishlist(item.product.id)}
              />
            ))
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">আপনার শপিং ব্যাগ খালি</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">পছন্দের বই বা পণ্য কার্টে যোগ করলে এখানে দেখা যাবে।</p>
            </div>
          )}
        </section>
        <CartSummary items={items} subtotal={subtotal} discount={subtotal - payable} delivery={79} disabled={!items.length} />
      </div>
    </main>
  );
}
