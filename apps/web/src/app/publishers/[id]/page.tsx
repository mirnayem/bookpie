import { CollectionPage } from "@/components/catalog/collection-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { findPublisherEntry, productsForKey } from "@/lib/storefront-routing";
import type { DirectoryEntry, Publisher } from "@/types/storefront";

type PublisherRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function PublisherRoute({ params }: PublisherRouteProps) {
  const { id } = await params;
  const publisher = findPublisherEntry(id);
  const title = publisher?.name ?? "প্রকাশক";
  const image = getPublisherImage(publisher);

  return (
    <>
      <SiteHeader />
      <CollectionPage
        eyebrow="প্রকাশক"
        title={title}
        description={`${title} থেকে প্রকাশিত জনপ্রিয় বই ও পণ্য।`}
        image={image}
        products={productsForKey(title)}
      />
      <SiteFooter />
    </>
  );
}

function getPublisherImage(publisher: DirectoryEntry | Publisher | undefined) {
  if (!publisher) return undefined;
  return "logo" in publisher ? publisher.logo : publisher.image;
}
