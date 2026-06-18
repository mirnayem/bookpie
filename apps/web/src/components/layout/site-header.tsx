import Link from "next/link";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { HeaderActions } from "@/components/layout/header-actions";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchBar } from "@/components/layout/search-bar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="hidden border-b bg-muted/60 py-2 text-center text-sm text-muted-foreground md:block">
        BookPie অ্যাপ ডাউনলোড করুন
        <Link href="/app" className="ml-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Google Play
        </Link>
      </div>
      <div className="container-page flex min-h-20 items-center gap-4">
        <MobileNav />
        <div className="shrink-0">
          <Logo />
        </div>
        <SearchBar className="hidden flex-1 md:block lg:mx-10" />
        <HeaderActions />
      </div>
      <div className="container-page pb-4 md:hidden">
        <SearchBar />
      </div>
      <div className="container-page hidden pb-4 lg:block">
        <DesktopNav />
      </div>
    </header>
  );
}
