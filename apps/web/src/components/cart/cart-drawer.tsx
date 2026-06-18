"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

export function CartDrawer() {
  const open = useCartStore((state) => state.isOpen);
  const close = useCartStore((state) => state.close);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());

  return (
    <Drawer open={open} title="শপিং ব্যাগ" onOpenChange={(nextOpen) => !nextOpen && close()}>
      {items.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">আপনার ব্যাগ খালি</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.product.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="text-clamp-2 font-medium">{item.product.title}</p>
                  <p className="mt-1 text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <p className="shrink-0 font-semibold text-primary">{formatTaka(item.product.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border pt-4 text-sm font-semibold">
            <span>Subtotal</span>
            <span>{formatTaka(subtotal)}</span>
          </div>
          <Button asChild className="w-full">
            <Link href="/cart" onClick={close}>
              View cart
            </Link>
          </Button>
        </div>
      )}
    </Drawer>
  );
}
