"use client";

import type { Author, Brand, Category, Publisher, UpsertAuthorRequest } from "@bookpie/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminState } from "@/components/admin/admin-state";
import { AdminTable } from "@/components/admin/admin-table";
import { EntityForm } from "@/components/admin/entity-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { adminApi } from "@/lib/admin/api";
import { useDebounce } from "@/lib/use-debounce";
import { useAuthStore } from "@/stores/auth-store";

type CatalogEntity = Author | Publisher | Category | Brand;
type CatalogEntityType = "authors" | "publishers" | "categories" | "brands";

type CatalogEntityAdminPageProps = {
  title: string;
  description: string;
  entityType: CatalogEntityType;
};

const entityApi = {
  authors: { load: adminApi.authors, create: adminApi.createAuthor, update: adminApi.updateAuthor, remove: adminApi.deleteAuthor },
  publishers: { load: adminApi.publishers, create: adminApi.createPublisher, update: adminApi.updatePublisher, remove: adminApi.deletePublisher },
  categories: { load: adminApi.categories, create: adminApi.createCategory, update: adminApi.updateCategory, remove: adminApi.deleteCategory },
  brands: { load: adminApi.brands, create: adminApi.createBrand, update: adminApi.updateBrand, remove: adminApi.deleteBrand },
} satisfies Record<
  CatalogEntityType,
  {
    load: (token: string | null) => Promise<CatalogEntity[]>;
    create: (token: string | null, payload: UpsertAuthorRequest) => Promise<CatalogEntity>;
    update: (token: string | null, id: string, payload: UpsertAuthorRequest) => Promise<CatalogEntity>;
    remove: (token: string | null, id: string) => Promise<void>;
  }
>;

export function CatalogEntityAdminPage({ title, description, entityType }: CatalogEntityAdminPageProps) {
  const { load, create, update, remove } = entityApi[entityType];
  const token = useAuthStore((state) => state.tokens?.accessToken ?? null);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<CatalogEntity | null>(null);
  const [deleteEntity, setDeleteEntity] = useState<CatalogEntity | null>(null);
  const listQuery = useQuery({ queryKey: ["admin", entityType], queryFn: () => load(token), enabled: Boolean(token) });
  const saveMutation = useMutation({
    mutationFn: (payload: UpsertAuthorRequest) => (editingEntity ? update(token, editingEntity.id, payload) : create(token, payload)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", entityType] });
      setFormOpen(false);
      setEditingEntity(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (entity: CatalogEntity) => remove(token, entity.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", entityType] });
      setDeleteEntity(null);
    },
  });
  const rows = useMemo(() => {
    const values = listQuery.data ?? [];
    if (debouncedSearch.trim().length > 0 && debouncedSearch.trim().length < 3) return values;
    if (debouncedSearch.trim().length < 3) return values;
    const needle = debouncedSearch.toLowerCase();
    return values.filter((entity) => `${entity.name} ${entity.slug}`.toLowerCase().includes(needle));
  }, [debouncedSearch, listQuery.data]);

  if (listQuery.isError) {
    return <AdminState variant="error" title={`${title} failed to load`} description={listQuery.error.message} actionLabel="Retry" onAction={() => listQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={title}
        description={description}
        action={
          <Button type="button" onClick={() => { setEditingEntity(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
        }
      />
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()} by name or slug`} aria-label={`Search ${title}`} />
      {rows.length ? (
        <AdminTable
          rows={rows}
          getRowKey={(entity) => entity.id}
          columns={[
            { key: "name", header: "Name", render: (entity) => <span className="font-semibold">{entity.name}</span> },
            { key: "slug", header: "Slug", render: (entity) => <span className="text-muted-foreground">{entity.slug}</span> },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (entity) => (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setEditingEntity(entity); setFormOpen(true); }}>
                    <Edit className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setDeleteEntity(entity)}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <AdminState title={`No ${title.toLowerCase()} found`} description="Create a new record or adjust the search." />
      )}
      <Modal open={formOpen} title={editingEntity ? `Edit ${title}` : `Create ${title}`} onOpenChange={setFormOpen}>
        <EntityForm key={editingEntity?.id ?? "new"} defaultValues={editingEntity ? { name: editingEntity.name, slug: editingEntity.slug } : undefined} busy={saveMutation.isPending} onSubmit={(payload) => saveMutation.mutate(payload)} />
        {saveMutation.error ? <p className="mt-4 text-sm text-primary">{saveMutation.error.message}</p> : null}
      </Modal>
      <AdminConfirmDialog
        open={Boolean(deleteEntity)}
        title={`Delete ${title}`}
        description={`Delete ${deleteEntity?.name ?? "this record"}? This may fail if products still use it.`}
        confirmLabel="Delete"
        busy={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleteEntity(null)}
        onConfirm={() => deleteEntity && deleteMutation.mutate(deleteEntity)}
      />
    </div>
  );
}
