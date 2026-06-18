import { CatalogEntityAdminPage } from "@/components/admin/catalog-entity-admin-page";
import { adminApi } from "@/lib/admin/api";

export default function AdminBrandsRoute() {
  return (
    <CatalogEntityAdminPage
      title="Brands"
      description="Manage product brands and logo references used by books, food, stationery, and lifestyle catalog items."
      queryKey="brands"
      load={adminApi.brands}
      create={adminApi.createBrand}
      update={adminApi.updateBrand}
      remove={adminApi.deleteBrand}
    />
  );
}
