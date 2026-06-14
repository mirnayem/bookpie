import { CorporatePage } from "@/components/corporate/corporate-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function CorporateRoute() {
  return (
    <>
      <SiteHeader />
      <CorporatePage />
      <SiteFooter />
    </>
  );
}
