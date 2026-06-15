import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  className?: string;
};

export function Pagination({ currentPage, totalPages, hrefForPage, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );

  return (
    <nav className={cn("flex items-center justify-center gap-2", className)} aria-label="Pagination">
      <Button asChild variant="outline" size="icon" aria-label="Previous page" disabled={currentPage <= 1}>
        <Link href={hrefForPage(Math.max(1, currentPage - 1))}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
      {pages.map((page, index) => {
        const showGap = index > 0 && page - pages[index - 1] > 1;

        return (
          <span key={page} className="flex items-center gap-2">
            {showGap ? <span className="px-1 text-sm text-muted-foreground">...</span> : null}
            <Button asChild variant={page === currentPage ? "default" : "outline"} size="sm" aria-current={page === currentPage ? "page" : undefined}>
              <Link href={hrefForPage(page)}>{page}</Link>
            </Button>
          </span>
        );
      })}
      <Button asChild variant="outline" size="icon" aria-label="Next page" disabled={currentPage >= totalPages}>
        <Link href={hrefForPage(Math.min(totalPages, currentPage + 1))}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </nav>
  );
}
