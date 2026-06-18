import { CatalogEntityAdminPage } from "@/components/admin/catalog-entity-admin-page";
import { adminApi } from "@/lib/admin/api";

export default function AdminAuthorsRoute() {
  return (
    <CatalogEntityAdminPage
      title="Authors"
      description="Manage author records used by product forms and storefront directories."
      queryKey="authors"
      load={adminApi.authors}
      create={adminApi.createAuthor}
      update={adminApi.updateAuthor}
      remove={adminApi.deleteAuthor}
    />
  );
}
