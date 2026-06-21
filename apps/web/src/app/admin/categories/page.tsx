import { CatalogEntityAdminPage } from "@/components/admin/catalog-entity-admin-page";

export default function AdminCategoriesRoute() {
  return (
    <CatalogEntityAdminPage
      title="Categories"
      description="Manage book and product category records used across admin and storefront filters."
      entityType="categories"
    />
  );
}
