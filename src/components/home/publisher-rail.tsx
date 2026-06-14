"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { RailControls } from "@/components/ui/rail-controls";
import { SectionHeader } from "@/components/ui/section-header";
import type { Publisher } from "@/types/storefront";

type PublisherRailProps = {
  title: string;
  href: string;
  publishers: Publisher[];
};

export function PublisherRail({ title, href, publishers }: PublisherRailProps) {
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
          className="scrollbar-none grid auto-cols-[170px] grid-flow-col gap-4 overflow-x-auto scroll-smooth pb-2 md:auto-cols-[194px]"
          tabIndex={0}
          aria-label={`${title} carousel`}
        >
          {publishers.map((publisher) => (
            <Link key={publisher.id} href={publisher.href} className="rounded-lg border bg-card p-4 text-center hover:border-primary/40">
              <div className="relative mx-auto h-24 w-full overflow-hidden bg-background">
                <Image src={publisher.logo} alt={publisher.name} fill sizes="194px" className="object-contain" unoptimized />
              </div>
              <p className="mt-3 text-clamp-1 text-sm font-semibold">{publisher.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
