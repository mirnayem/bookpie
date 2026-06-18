"use client";

import { Share2 } from "lucide-react";
import type { Product } from "@/types/storefront";

type ShareProductButtonProps = {
  product: Product;
};

export function ShareProductButton({ product }: ShareProductButtonProps) {
  const shareProduct = async () => {
    const url = `${window.location.origin}/products/${product.slug}`;

    if (navigator.share) {
      await navigator.share({ title: product.title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
  };

  return (
    <button type="button" className="inline-flex items-center gap-2 hover:text-primary" onClick={shareProduct}>
      <Share2 className="h-5 w-5" aria-hidden="true" /> বন্ধুদের সাথে শেয়ার করুন
    </button>
  );
}
