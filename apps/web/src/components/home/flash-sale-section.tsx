"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/home/product-card";
import { SectionHeader } from "@/components/ui/section-header";
import type { Product } from "@/types/storefront";

type FlashSaleSectionProps = {
  products: Product[];
};

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(6 * 60 * 60);
  const formattedTime = useMemo(() => formatRemainingTime(remainingSeconds), [remainingSeconds]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => (value > 0 ? value - 1 : 6 * 60 * 60));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="bg-muted py-10">
      <div className="container-page">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <SectionHeader title="Flash Sale" href="/campaigns/flash-sale" />
          <div className="rounded-md bg-background px-4 py-2 text-sm font-semibold text-primary shadow-sm" aria-live="polite">
            Ends in {formattedTime}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4 xl:grid-cols-6">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function formatRemainingTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}
