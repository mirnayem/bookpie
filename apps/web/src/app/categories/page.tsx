import { SubjectGridPage } from "@/components/catalog/subject-grid-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { subjectCategories } from "@/data/storefront";

export default function CategoriesRoute() {
  return (
    <>
      <SiteHeader />
      <SubjectGridPage categories={subjectCategories} />
      <SiteFooter />
    </>
  );
}
