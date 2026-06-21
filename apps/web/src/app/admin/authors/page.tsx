import { CatalogEntityAdminPage } from "@/components/admin/catalog-entity-admin-page";

export default function AdminAuthorsRoute() {
  return (
    <CatalogEntityAdminPage
      title="Authors"
      description="Manage author records used by product forms and storefront directories."
      entityType="authors"
    />
  );
}
