"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { navigationItems, type NavigationItem } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

type DesktopNavProps = {
  items?: NavigationItem[];
};

export function DesktopNav({ items = navigationItems }: DesktopNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="hidden items-center justify-center gap-7 text-sm font-medium lg:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex items-center gap-1 border-b-2 border-transparent pb-2 text-foreground/80 hover:text-primary",
            pathname === item.href && "border-primary text-primary",
          )}
        >
          {item.label}
          {item.label === "বই" ? <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        </Link>
      ))}
    </nav>
  );
}
