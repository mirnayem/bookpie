import { CatalogEntityAdminPage } from "@/components/admin/catalog-entity-admin-page";
import { adminApi } from "@/lib/admin/api";

export default function AdminPublishersRoute() {
  return (
    <CatalogEntityAdminPage
      title="Publishers"
      description="Manage publishers for catalog browsing and product attribution."
      queryKey="publishers"
      load={adminApi.publishers}
      create={adminApi.createPublisher}
      update={adminApi.updatePublisher}
      remove={adminApi.deletePublisher}
    />
  );
}
