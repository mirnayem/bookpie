import { AppPromo } from "@/components/home/app-promo";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { appPromo } from "@/data/storefront";

export default function AppDownloadRoute() {
  return (
    <>
      <SiteHeader />
      <main>
        <h1 className="sr-only">BookPie mobile app</h1>
        <AppPromo promo={appPromo} />
      </main>
      <SiteFooter />
    </>
  );
}
