import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { navigationItems } from "@/components/layout/navigation";

export function DesktopNav() {
  return (
    <nav aria-label="Primary navigation" className="hidden items-center justify-center gap-7 text-sm font-medium lg:flex">
      {navigationItems.map((item) => (
        <Link key={item.href} href={item.href} className="inline-flex items-center gap-1 text-foreground/80 hover:text-primary">
          {item.label}
          {item.label === "বই" ? <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        </Link>
      ))}
    </nav>
  );
}
