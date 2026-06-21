import { CatalogEntityAdminPage } from "@/components/admin/catalog-entity-admin-page";

export default function AdminPublishersRoute() {
  return (
    <CatalogEntityAdminPage
      title="Publishers"
      description="Manage publishers for catalog browsing and product attribution."
      entityType="publishers"
    />
  );
}
