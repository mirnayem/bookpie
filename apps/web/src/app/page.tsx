import { AppPromo } from "@/components/home/app-promo";
import { CategoryShowcaseGrid } from "@/components/home/category-showcase-grid";
import { CircularCategoryRail } from "@/components/home/circular-category-rail";
import { FloatingChatButton } from "@/components/home/floating-chat-button";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { PersonRail } from "@/components/home/person-rail";
import { ProductRail } from "@/components/home/product-rail";
import { PublisherRail } from "@/components/home/publisher-rail";
import { RankedListPanel } from "@/components/home/ranked-list-panel";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  appPromo,
  authors,
  circularCategories,
  heroBanners,
  productSections,
  publishers,
  rankedLists,
  showcaseGroups,
} from "@/data/storefront";

export default function HomePage() {
  const [newBooks, safeFood, trending, preOrder, islamic, seerah, history, family] = productSections;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <h1 className="sr-only">BookPie online bookstore</h1>
        <HeroCarousel banners={heroBanners} />
        <CategoryShowcaseGrid groups={showcaseGroups} />
        <ProductRail section={newBooks} />
        <ProductRail section={trending} />
        <CircularCategoryRail title="সেফ ফুড" href="/categories/safe-food" categories={circularCategories} />
        <ProductRail section={trending} />
        <ProductRail section={preOrder} />
        <section className="bg-muted py-10">
          <div className="container-page grid gap-6 lg:grid-cols-4">
            {showcaseGroups.slice(4).map((group) => (
              <CategoryShowcaseGrid key={group.id} groups={[group]} compact />
            ))}
          </div>
        </section>
        <PersonRail title="জনপ্রিয় লেখক" href="/authors" people={authors} />
        <ProductRail section={islamic} />
        <section className="bg-muted py-10">
          <div className="container-page">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {rankedLists.map((list) => (
                <RankedListPanel key={list.id} list={list} />
              ))}
            </div>
          </div>
        </section>
        <PublisherRail title="জনপ্রিয় প্রকাশক" href="/publishers" publishers={publishers} />
        <ProductRail section={seerah} />
        <ProductRail section={history} />
        <ProductRail section={family} />
        <AppPromo promo={appPromo} />
      </main>
      <SiteFooter />
      <FloatingChatButton />
    </div>
  );
}
