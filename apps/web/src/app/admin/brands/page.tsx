import { CatalogEntityAdminPage } from "@/components/admin/catalog-entity-admin-page";

export default function AdminBrandsRoute() {
  return (
    <CatalogEntityAdminPage
      title="Brands"
      description="Manage product brands and logo references used by books, food, stationery, and lifestyle catalog items."
      entityType="brands"
    />
  );
}
