"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/home/product-card";
import { RailControls } from "@/components/ui/rail-controls";
import { SectionHeader } from "@/components/ui/section-header";
import type { ProductSection } from "@/types/storefront";

type ProductRailProps = {
  section: ProductSection;
};

export function ProductRail({ section }: ProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: number) => {
    railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * 0.75, behavior: "smooth" });
  };

  if (section.products.length === 0) {
    return null;
  }

  return (
    <section className="container-page py-9">
      <SectionHeader title={section.title} href={section.href} />
      <div className="relative">
        <RailControls label={section.title} onPrevious={() => scrollByPage(-1)} onNext={() => scrollByPage(1)} />
        <div
          ref={railRef}
          className="scrollbar-none grid auto-cols-[minmax(144px,1fr)] grid-flow-col gap-5 overflow-x-auto scroll-smooth pb-2 sm:auto-cols-[170px] md:gap-7"
          tabIndex={0}
          aria-label={`${section.title} product carousel`}
        >
          {section.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
