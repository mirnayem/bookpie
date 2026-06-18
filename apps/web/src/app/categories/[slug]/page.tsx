import { ListingPage } from "@/components/catalog/listing-page";
import { SiteHeader } from "@/components/layout/site-header";
import { circularCategories, products, subjectCategories } from "@/data/storefront";
import type { ListingPage as ListingPageType } from "@/types/storefront";

type CategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

function titleFromSlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const known = [...circularCategories, ...subjectCategories].find((category) => category.href.endsWith(`/${decoded}`));

  if (known) return known.title;

  return decoded
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function CategoryRoute({ params }: CategoryRouteProps) {
  const { slug } = await params;
  const title = titleFromSlug(slug);
  const page: ListingPageType = {
    id: `category-${slug}`,
    title,
    activeNav: "/categories",
    tags: circularCategories.map((category) => category.title),
    filters: [
      { title: "প্রকাশক", options: ["সমকালীন প্রকাশন", "রুহামা পাবলিকেশন", "গার্ডিয়ান পাবলিকেশন"] },
      { title: "মূল্য", options: ["৳০ - ৳৩০০", "৳৩০১ - ৳৬০০", "৳৬০০+"] },
      { title: "স্টক", options: ["In stock", "Low stock", "Discounted"] },
    ],
    products: [...products.slice(0, 12), ...products.slice(4, 16)],
  };

  return (
    <>
      <SiteHeader />
      <ListingPage page={page} />
    </>
  );
}
