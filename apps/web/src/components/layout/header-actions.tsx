"use client";

import { Heart, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export function HeaderActions() {
  const cartCount = useCartStore((state) => state.cartCount());
  const wishlistCount = useCartStore((state) => state.wishlistCount());

  return (
    <div className="ml-auto flex items-center gap-1">
      <Button variant="ghost" size="icon" aria-label={`Wishlist (${wishlistCount})`} asChild>
        <Link href="/wishlist" className="relative">
          <Heart className="h-5 w-5" aria-hidden="true" />
          {wishlistCount ? <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{wishlistCount}</span> : null}
        </Link>
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Shopping bag (${cartCount})`} asChild>
        <Link href="/cart" className="relative">
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          {cartCount ? <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">{cartCount}</span> : null}
        </Link>
      </Button>
      <Button variant="ghost" size="icon" aria-label="Account" asChild>
        <Link href="/signin">
          <UserRound className="h-5 w-5" aria-hidden="true" />
        </Link>
      </Button>
      <Link href="/signin" className="hidden text-sm font-medium text-foreground/80 hover:text-primary md:inline">
        Sign In
      </Link>
    </div>
  );
}
