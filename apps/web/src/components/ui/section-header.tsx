import Link from "next/link";
import { ChevronRight } from "lucide-react";

type SectionHeaderProps = {
  title: string;
  href: string;
};

export function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-lg font-semibold text-foreground md:text-xl">{title}</h2>
      <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        সবগুলো দেখুন
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
