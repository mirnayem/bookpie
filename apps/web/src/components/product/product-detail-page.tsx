import Image from "next/image";
import Link from "next/link";
import { ProductActions } from "@/components/product/product-actions";
import { ProductSampleButton } from "@/components/product/product-sample-button";
import { ShareProductButton } from "@/components/product/share-product-button";
import { ProductSuggestionCard } from "@/components/product/product-suggestion-card";
import { RatingBars } from "@/components/product/rating-bars";
import { formatTaka } from "@/lib/format";
import type { Product, PromoBanner } from "@/types/storefront";

type ProductDetailPageProps = {
  product: Product;
  suggestions: Product[];
  promos: PromoBanner[];
};

export function ProductDetailPage({ product, suggestions, promos }: ProductDetailPageProps) {
  return (
    <main className="container-page py-8">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/">হোম</Link> / <Link href="/categories">বিষয়</Link> / <span>{product.title}</span>
      </div>
      <div className="grid gap-10 lg:grid-cols-[260px_1fr_300px]">
        <div>
          <p className="mb-3 text-sm font-semibold text-primary">কিছু অংশ পড়ে দেখতে ছবির উপর ক্লিক করুন</p>
          <div className="relative aspect-[9/13] bg-muted">
            <Image src={product.image} alt={product.title} fill priority sizes="260px" className="object-cover" unoptimized />
          </div>
        </div>
        <section>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="mt-2 inline-flex rounded bg-amber-700 px-2 py-1 text-xs font-semibold text-white">#1 বেস্টসেলার</p>
          <dl className="mt-5 space-y-2 text-sm leading-6">
            <div>
              <dt className="inline text-muted-foreground">লেখক : </dt>
              <dd className="inline font-semibold text-primary">{product.author}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">প্রকাশনী : </dt>
              <dd className="inline font-semibold text-primary">ইলম হাউজ পাবলিকেশন</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">বিষয় : </dt>
              <dd className="inline font-semibold text-primary">ইসলামী অর্থব্যবস্থা, শাসনব্যবস্থা ও রাজনীতি</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">পৃষ্ঠা : </dt>
              <dd className="inline">৪৪০, কাভার : হার্ড কাভার, সংস্করণ : 1st published, 2026</dd>
            </div>
          </dl>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
            আমরা এক অদ্ভুত সময়ে বাস করছি। চেনা পৃথিবী বদলে যাচ্ছে, আর অনিশ্চিত নতুন পৃথিবীর জন্মযন্ত্রণা ফুটে উঠছে। এই বইটি বর্তমান বিশ্বকে বুঝতে পাঠককে সহায়তা করবে।
          </p>
          <p className="mt-5 text-2xl font-bold text-primary">{formatTaka(product.price)}</p>
          <div className="mt-6">
            <ProductActions product={product} />
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <ProductSampleButton product={product} />
          </div>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground">
            <ShareProductButton product={product} />
          </div>
        </section>
        <aside>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">আরো দেখুন...</h2>
            <Link href="/books" className="text-sm font-semibold text-primary">
              সবগুলো দেখুন
            </Link>
          </div>
          <div className="grid gap-3">
            {suggestions.slice(0, 3).map((item) => (
              <ProductSuggestionCard key={item.id} product={item} />
            ))}
          </div>
        </aside>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {promos.map((promo) => (
          <Link key={promo.id} href={promo.href} className="relative aspect-[1240/250] overflow-hidden rounded-md bg-muted">
            <Image src={promo.image} alt={promo.title} fill sizes="600px" className="object-cover" unoptimized />
          </Link>
        ))}
      </div>
      <RatingBars />
    </main>
  );
}
