import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/types/storefront";

type SubjectCardProps = {
  category: Category;
};

export function SubjectCard({ category }: SubjectCardProps) {
  return (
    <Link
      href={category.href}
      className="flex min-h-14 items-center justify-between rounded-lg border bg-card px-5 py-4 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
    >
      {category.title}
      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}
