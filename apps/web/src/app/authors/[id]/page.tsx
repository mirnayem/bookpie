import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { findAuthorEntry, productsForKey } from "@/lib/storefront-routing";

type AuthorRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function AuthorRoute({ params }: AuthorRouteProps) {
  const { id } = await params;
  const author = findAuthorEntry(id);
  const title = author?.name ?? "লেখক";

  return (
    <>
      <SiteHeader />
      <CollectionPage
        eyebrow="লেখক"
        title={title}
        description={`${title} সম্পর্কিত নির্বাচিত বই ও প্রকাশনা।`}
        image={author?.image}
        products={productsForKey(title)}
      />
      <SiteFooter />
    </>
  );
}
