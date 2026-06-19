import { DirectoryGridPage } from "@/components/catalog/directory-grid-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { directoryEntries } from "@/data/storefront";

export default function AuthorsRoute() {
  return (
    <>
      <SiteHeader />
      <DirectoryGridPage title="লেখক" entries={directoryEntries.authors} />
      <SiteFooter />
    </>
  );
}
