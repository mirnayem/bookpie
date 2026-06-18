"use client";

import type { Book, UpsertBookRequest } from "@bookpie/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminAvatar } from "@/components/admin/admin-avatar";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminState } from "@/components/admin/admin-state";
import { AdminTable } from "@/components/admin/admin-table";
import { ProductForm } from "@/components/admin/product-form";
import { StockStatusBadge } from "@/components/admin/stock-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { formatTaka } from "@/lib/format";
import { adminApi } from "@/lib/admin/api";
import { useDebounce } from "@/lib/use-debounce";
import { useAuthStore } from "@/stores/auth-store";

export function ProductsAdminPage() {
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const debouncedSearch = useDebounce(search);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteBook, setDeleteBook] = useState<Book | null>(null);
  const serverSearch = debouncedSearch.trim().length >= 3 ? debouncedSearch.trim() : undefined;
  const limit = 20;
  const booksQuery = useQuery({ queryKey: ["admin", "books", serverSearch, page], queryFn: () => adminApi.books(token, { limit, offset: (page - 1) * limit, search: serverSearch }), enabled: Boolean(token) && debouncedSearch.trim().length !== 1 && debouncedSearch.trim().length !== 2 });
  const authorsQuery = useQuery({ queryKey: ["admin", "authors"], queryFn: () => adminApi.authors(token), enabled: Boolean(token) });
  const publishersQuery = useQuery({ queryKey: ["admin", "publishers"], queryFn: () => adminApi.publishers(token), enabled: Boolean(token) });
  const categoriesQuery = useQuery({ queryKey: ["admin", "categories"], queryFn: () => adminApi.categories(token), enabled: Boolean(token) });
  const saveMutation = useMutation({
    mutationFn: (payload: UpsertBookRequest) => (editingBook ? adminApi.updateBook(token, editingBook.id, payload) : adminApi.createBook(token, payload)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "books"] });
      setFormOpen(false);
      setEditingBook(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (book: Book) => adminApi.deleteBook(token, book.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "books"] });
      setDeleteBook(null);
    },
  });
  const books = useMemo(() => {
    const rows = booksQuery.data ?? [];
    const filtered = debouncedSearch.trim().length < 3 ? rows : rows.filter((book) => `${book.title} ${book.slug} ${book.author.name} ${book.publisher.name}`.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return [...filtered].sort((first, second) => {
      if (sort === "title") return first.title.localeCompare(second.title);
      if (sort === "stock") return first.stock - second.stock;
      if (sort === "price") return first.salePrice - second.salePrice;
      return 0;
    });
  }, [booksQuery.data, debouncedSearch, sort]);

  if (booksQuery.isError) {
    return <AdminState variant="error" title="Products failed to load" description={booksQuery.error.message} actionLabel="Retry" onAction={() => booksQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Manage books, pricing, authors, publishers, categories, and stock defaults."
        action={
          <Button type="button" onClick={() => { setEditingBook(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add product
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search products by title, slug, author, or publisher"
          aria-label="Search products"
        />
        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort products"
          options={[
            { label: "Newest", value: "newest" },
            { label: "Title", value: "title" },
            { label: "Lowest price", value: "price" },
            { label: "Lowest stock", value: "stock" },
          ]}
        />
      </div>
      {books.length ? (
        <AdminTable
          rows={books}
          getRowKey={(book) => book.id}
          columns={[
            {
              key: "book",
              header: "Book",
              render: (book) => (
                <div className="flex items-center gap-3">
                  <AdminAvatar title={book.title} imageUrl={book.coverImageUrl} />
                  <div>
                    <Link className="font-semibold hover:text-primary" href={`/products/${book.slug}`}>{book.title}</Link>
                    <p className="text-xs text-muted-foreground">{book.author.name}</p>
                  </div>
                </div>
              ),
            },
            { key: "publisher", header: "Publisher", render: (book) => book.publisher.name },
            { key: "price", header: "Price", render: (book) => <span>{formatTaka(book.salePrice)} <span className="text-xs text-muted-foreground line-through">{formatTaka(book.price)}</span></span> },
            { key: "stock", header: "Stock", render: (book) => <div className="space-y-1"><p>{book.stock}</p><StockStatusBadge stock={book.stock} /></div> },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (book) => (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setEditingBook(book); setFormOpen(true); }}>
                    <Edit className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setDeleteBook(book)}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <AdminState title="No products found" description="Create your first product or adjust the search." />
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Page {page}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={page === 1 || booksQuery.isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </Button>
          <Button type="button" variant="outline" disabled={(booksQuery.data?.length ?? 0) < limit || booksQuery.isFetching} onClick={() => setPage((value) => value + 1)}>
            Next
          </Button>
        </div>
      </div>
      <Modal open={formOpen} title={editingBook ? "Edit product" : "Create product"} onOpenChange={setFormOpen} className="max-w-4xl">
        <ProductForm
          key={editingBook?.id ?? "new"}
          book={editingBook}
          authors={authorsQuery.data ?? []}
          publishers={publishersQuery.data ?? []}
          categories={categoriesQuery.data ?? []}
          busy={saveMutation.isPending}
          onSubmit={(payload) => saveMutation.mutate(payload)}
        />
        {saveMutation.error ? <p className="mt-4 text-sm text-primary">{saveMutation.error.message}</p> : null}
      </Modal>
      <AdminConfirmDialog
        open={Boolean(deleteBook)}
        title="Delete product"
        description={`Delete ${deleteBook?.title ?? "this product"}? This action cannot be undone.`}
        confirmLabel="Delete"
        busy={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleteBook(null)}
        onConfirm={() => deleteBook && deleteMutation.mutate(deleteBook)}
      />
    </div>
  );
}
