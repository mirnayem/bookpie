"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { RailControls } from "@/components/ui/rail-controls";
import { SectionHeader } from "@/components/ui/section-header";
import type { Category } from "@/types/storefront";

type CircularCategoryRailProps = {
  title: string;
  href: string;
  categories: Category[];
};

export function CircularCategoryRail({ title, href, categories }: CircularCategoryRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: number) => {
    railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <section className="container-page py-9">
      <SectionHeader title={title} href={href} />
      <div className="relative">
        <RailControls label={title} onPrevious={() => scrollByPage(-1)} onNext={() => scrollByPage(1)} />
        <div
          ref={railRef}
          className="scrollbar-none grid auto-cols-[132px] grid-flow-col gap-6 overflow-x-auto scroll-smooth pb-2 sm:auto-cols-[160px] md:auto-cols-[180px]"
          tabIndex={0}
          aria-label={`${title} category carousel`}
        >
          {categories.map((category) => (
            <Link key={category.id} href={category.href} className="text-center">
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full bg-muted">
                {category.image ? (
                  <Image src={category.image} alt={category.title} fill sizes="180px" className="object-cover" unoptimized />
                ) : null}
              </div>
              <p className="mt-3 text-clamp-1 text-sm font-medium">{category.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
