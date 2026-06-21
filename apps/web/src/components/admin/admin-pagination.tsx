import type { PaginationMeta } from "@bookpie/shared";

import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  pagination?: PaginationMeta;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
};

export function AdminPagination({ pagination, isFetching = false, onPageChange }: AdminPaginationProps) {
  if (!pagination) return null;

  const start = pagination.total === 0 ? 0 : pagination.offset + 1;
  const end = Math.min(pagination.offset + pagination.limit, pagination.total);

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        Showing {start}-{end} of {pagination.total} · Page {pagination.page} of {pagination.totalPages || 1}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={!pagination.hasPreviousPage || isFetching} onClick={() => onPageChange(Math.max(1, pagination.page - 1))}>
          Previous
        </Button>
        <Button type="button" variant="outline" disabled={!pagination.hasNextPage || isFetching} onClick={() => onPageChange(pagination.page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
