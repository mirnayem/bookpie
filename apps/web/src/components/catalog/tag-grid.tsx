"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { titleToSlug } from "@/lib/storefront-routing";

type TagGridProps = {
  tags: string[];
};

export function TagGrid({ tags }: TagGridProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleTags = expanded ? tags : tags.slice(0, 10);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {visibleTags.map((tag) => (
          <Link
            key={tag}
            href={`/categories/${titleToSlug(tag)}`}
            className="flex min-h-14 items-center justify-center rounded-lg border bg-card px-4 text-center text-sm font-semibold hover:border-primary/50 hover:text-primary"
          >
            {tag}
          </Link>
        ))}
      </div>
      {tags.length > 10 ? (
        <button type="button" className="mx-auto mt-4 flex items-center gap-1 text-sm font-semibold text-primary" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "কম দেখুন" : "আরো দেখুন"}
          <ChevronDown className={expanded ? "h-4 w-4 rotate-180" : "h-4 w-4"} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
