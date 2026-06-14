"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { RailControls } from "@/components/ui/rail-controls";
import { SectionHeader } from "@/components/ui/section-header";
import type { Person } from "@/types/storefront";

type PersonRailProps = {
  title: string;
  href: string;
  people: Person[];
};

export function PersonRail({ title, href, people }: PersonRailProps) {
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
          className="scrollbar-none grid auto-cols-[154px] grid-flow-col gap-4 overflow-x-auto scroll-smooth pb-2 md:auto-cols-[178px]"
          tabIndex={0}
          aria-label={`${title} carousel`}
        >
          {people.map((person) => (
            <Link key={person.id} href={person.href} className="rounded-lg border bg-card p-4 text-center hover:border-primary/40">
              <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full bg-muted">
                <Image src={person.image} alt={person.name} fill sizes="80px" className="object-cover" unoptimized />
              </div>
              <p className="mt-4 text-clamp-1 text-sm font-semibold">{person.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
