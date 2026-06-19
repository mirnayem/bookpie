import { CatalogEntityAdminPage } from "@/components/admin/catalog-entity-admin-page";
import { adminApi } from "@/lib/admin/api";

export default function AdminCategoriesRoute() {
  return (
    <CatalogEntityAdminPage
      title="Categories"
      description="Manage book and product category records used across admin and storefront filters."
      queryKey="categories"
      load={adminApi.categories}
      create={adminApi.createCategory}
      update={adminApi.updateCategory}
      remove={adminApi.deleteCategory}
    />
  );
}
