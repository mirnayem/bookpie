"use client";

import { Heart, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

export function HeaderActions() {
  const cartCount = useCartStore((state) => state.cartCount());
  const wishlistCount = useCartStore((state) => state.wishlistCount());
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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
      {user ? (
        <button type="button" className="hidden text-sm font-medium text-foreground/80 hover:text-primary md:inline" onClick={logout}>
          Logout
        </button>
      ) : (
        <Link href="/signin" className="hidden text-sm font-medium text-foreground/80 hover:text-primary md:inline">
          Sign In
        </Link>
      )}
    </div>
  );
}
