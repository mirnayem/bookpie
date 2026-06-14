import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { AppPromoContent } from "@/types/storefront";

type AppPromoProps = {
  promo: AppPromoContent;
};

export function AppPromo({ promo }: AppPromoProps) {
  return (
    <section className="bg-muted py-12">
      <div className="container-page grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="max-w-lg text-3xl font-bold leading-tight text-foreground md:text-4xl">{promo.title}</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">{promo.description}</p>
          <Button className="mt-6 h-12 bg-black px-5 text-white hover:bg-black/85" aria-label="Get it on Google Play">
            <span className="text-sm font-semibold">Get it on Google Play</span>
          </Button>
        </div>
        <div className="relative min-h-[260px]">
          <Image src={promo.phoneImage} alt="BookPie app preview" fill sizes="(max-width: 768px) 100vw, 620px" className="object-contain" unoptimized />
        </div>
      </div>
    </section>
  );
}
