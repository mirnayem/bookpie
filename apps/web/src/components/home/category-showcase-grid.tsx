import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card-content";
import { CardHeader } from "@/components/ui/card-header";
import { CardTitle } from "@/components/ui/card-title";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import type { ShowcaseGroup } from "@/types/storefront";

type CategoryShowcaseGridProps = {
  groups: ShowcaseGroup[];
  compact?: boolean;
};

export function CategoryShowcaseGrid({ groups, compact = false }: CategoryShowcaseGridProps) {
  return (
    <section className={cn(!compact && "bg-muted py-8")}>
      <div className={cn(!compact && "container-page")}>
        {!compact ? <SectionHeader title="বইয়ের বিভাগ" href="/categories" /> : null}
        <div className={cn("grid gap-5", !compact && "md:grid-cols-2 xl:grid-cols-4")}>
          {groups.map((group, groupIndex) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {group.items.slice(0, 4).map((item, itemIndex) => (
                    <Link key={item.id} href={`/products/${item.slug}`} className="min-w-0 text-center">
                      <div className="relative mx-auto aspect-[9/13] w-full max-w-[94px] overflow-hidden bg-muted">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          priority={!compact && groupIndex === 0 && itemIndex === 0}
                          sizes="94px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <p className="mt-2 text-clamp-1 text-xs text-muted-foreground">{item.title}</p>
                    </Link>
                  ))}
                </div>
                <Link href={group.href} className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">
                  সব দেখুন
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
