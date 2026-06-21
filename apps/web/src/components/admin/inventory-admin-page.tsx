"use client";

import type { InventoryItem, UpdateStockRequest } from "@bookpie/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminAvatar } from "@/components/admin/admin-avatar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminState } from "@/components/admin/admin-state";
import { AdminTable } from "@/components/admin/admin-table";
import { StockForm } from "@/components/admin/stock-form";
import { StockStatusBadge } from "@/components/admin/stock-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { adminApi } from "@/lib/admin/api";
import { useDebounce } from "@/lib/use-debounce";
import { useAuthStore } from "@/stores/auth-store";

type StockFilter = "all" | "low" | "out";

export function InventoryAdminPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const serverSearch = debouncedSearch.trim().length >= 3 ? debouncedSearch.trim() : undefined;
  const limit = 20;
  const inventoryQuery = useQuery({
    queryKey: ["admin", "inventory", serverSearch, filter, page],
    queryFn: () => adminApi.inventory(token, { limit, offset: (page - 1) * limit, search: serverSearch, stockStatus: filter === "all" ? undefined : filter }),
    enabled: Boolean(token) && debouncedSearch.trim().length !== 1 && debouncedSearch.trim().length !== 2,
  });
  const movementsQuery = useQuery({ queryKey: ["admin", "inventory", "movements", selectedItem?.bookId], queryFn: () => adminApi.movements(token, selectedItem?.bookId), enabled: Boolean(token && selectedItem) });
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateStockRequest) => selectedItem ? adminApi.updateStock(token, selectedItem.bookId, payload) : Promise.reject(new Error("No inventory item selected")),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "inventory", "movements"] });
      setSelectedItem(null);
    },
  });
  const rows = useMemo(() => {
    return inventoryQuery.data?.items ?? [];
  }, [inventoryQuery.data?.items]);

  if (inventoryQuery.isError) {
    return <AdminState variant="error" title="Inventory failed to load" description={inventoryQuery.error.message} actionLabel="Retry" onAction={() => inventoryQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Inventory" description="Manage single-warehouse stock and review stock movement history." />
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search inventory by book title or slug"
          aria-label="Search inventory"
        />
        <Select
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value as StockFilter);
            setPage(1);
          }}
          options={[{ label: "All stock", value: "all" }, { label: "Low stock", value: "low" }, { label: "Out of stock", value: "out" }]}
        />
      </div>
      {rows.length ? (
        <AdminTable
          rows={rows}
          getRowKey={(item) => item.bookId}
          columns={[
            {
              key: "book",
              header: "Book",
              render: (item) => (
                <div className="flex items-center gap-3">
                  <AdminAvatar title={item.title} imageUrl={item.coverImageUrl} />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.slug}</p>
                  </div>
                </div>
              ),
            },
            { key: "stock", header: "Stock", render: (item) => item.stock },
            { key: "status", header: "Status", render: (item) => <StockStatusBadge stock={item.stock} /> },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (item) => (
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                  <Edit className="h-4 w-4" aria-hidden="true" />
                  Update stock
                </Button>
              ),
            },
          ]}
        />
      ) : (
        <AdminState title="No inventory items found" description="Adjust the search or stock filter." />
      )}
      <AdminPagination pagination={inventoryQuery.data?.pagination} isFetching={inventoryQuery.isFetching} onPageChange={setPage} />
      <Modal open={Boolean(selectedItem)} title={selectedItem ? `Update stock: ${selectedItem.title}` : "Update stock"} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem ? <StockForm key={selectedItem.bookId} stock={selectedItem.stock} busy={updateMutation.isPending} onSubmit={(payload) => updateMutation.mutate(payload)} /> : null}
        {updateMutation.error ? <p className="mt-4 text-sm text-primary">{updateMutation.error.message}</p> : null}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold">Recent movements</h3>
          <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
            {(movementsQuery.data ?? []).map((movement) => (
              <div key={movement.id} className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">{movement.quantityDelta > 0 ? "+" : ""}{movement.quantityDelta} units</p>
                <p className="text-xs text-muted-foreground">{movement.reason} · {new Date(movement.createdAt).toLocaleString()}</p>
                {movement.note ? <p className="mt-1 text-xs">{movement.note}</p> : null}
              </div>
            ))}
            {!movementsQuery.data?.length ? <p className="text-sm text-muted-foreground">No movements yet.</p> : null}
          </div>
        </div>
      </Modal>
    </div>
  );
}
