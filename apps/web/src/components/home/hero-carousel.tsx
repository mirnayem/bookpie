"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PromoBanner } from "@/types/storefront";

type HeroCarouselProps = {
  banners: PromoBanner[];
};

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBanner = banners[activeIndex];

  const goTo = (direction: number) => {
    setActiveIndex((current) => (current + direction + banners.length) % banners.length);
  };

  if (!activeBanner) {
    return null;
  }

  return (
    <section className="container-page py-6">
      <div className="relative overflow-hidden">
        <Link href={activeBanner.href} aria-label={activeBanner.title}>
          <div className="relative aspect-[1500/330] min-h-[180px] overflow-hidden bg-muted">
            <Image
              src={activeBanner.image}
              alt={activeBanner.title}
              fill
              priority
              sizes="(max-width: 1320px) 100vw, 1320px"
              className="object-cover object-left"
              unoptimized
            />
          </div>
        </Link>
        <Button
          variant="outline"
          size="icon"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-soft"
          aria-label="Previous banner"
          onClick={() => goTo(-1)}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background shadow-soft"
          aria-label="Next banner"
          onClick={() => goTo(1)}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
