import { ListingPage } from "@/components/catalog/listing-page";
import { SiteHeader } from "@/components/layout/site-header";
import { circularCategories, subjectCategories } from "@/data/storefront";
import { getStorefrontBooks, getStorefrontCategories } from "@/lib/storefront-api";
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
  const [products, apiCategories] = await Promise.all([getStorefrontBooks(), getStorefrontCategories()]);
  const title = apiCategories.find((category) => category.href.endsWith(`/${slug}`))?.title ?? titleFromSlug(slug);
  const categoryProducts = products.filter((product) =>
    product.categoryNames?.some((name) => name.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(name.toLowerCase())),
  );
  const page: ListingPageType = {
    id: `category-${slug}`,
    title,
    activeNav: "/categories",
    tags: (apiCategories.length ? apiCategories : circularCategories).map((category) => category.title),
    filters: [
      { title: "প্রকাশক", options: ["সমকালীন প্রকাশন", "রুহামা পাবলিকেশন", "গার্ডিয়ান পাবলিকেশন"] },
      { title: "মূল্য", options: ["৳০ - ৳৩০০", "৳৩০১ - ৳৬০০", "৳৬০০+"] },
      { title: "স্টক", options: ["In stock", "Low stock", "Discounted"] },
    ],
    products: categoryProducts.length ? categoryProducts : products,
  };

  return (
    <>
      <SiteHeader />
      <ListingPage page={page} />
    </>
  );
}
