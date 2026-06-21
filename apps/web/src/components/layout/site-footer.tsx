import { Mail, MapPin, Phone } from "lucide-react";
import { FooterLinkGroup } from "@/components/layout/footer-link-group";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const importantLinks = [
  { label: "যোগাযোগ করুন", href: "/contact" },
  { label: "শপিং ব্যাগ", href: "/cart" },
  { label: "প্রশ্নোত্তর", href: "/faq" },
  { label: "শর্তাবলী", href: "/terms" },
];
const popularLinks = [
  { label: "আপনার পছন্দের তালিকা", href: "/wishlist" },
  { label: "জেনারেল ও একাডেমিক বই", href: "/general-books" },
  { label: "জনপ্রিয় লেখক", href: "/authors" },
  { label: "জনপ্রিয় প্রকাশক", href: "/publishers" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container-page grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            BookPie is a focused online book shop for Bangladeshi readers, with Islamic, general, academic, and lifestyle
            collections in one reusable storefront.
          </p>
        </div>
        <FooterLinkGroup title="প্রয়োজনীয় লিংক" links={importantLinks} />
        <FooterLinkGroup title="জনপ্রিয়" links={popularLinks} />
        <div>
          <h2 className="text-sm font-semibold">Subscribe Now</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Subscribe for newsletter and featured book updates.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="container-page grid gap-4 border-t py-6 text-sm text-muted-foreground md:grid-cols-3">
        <span className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4" aria-hidden="true" /> House 12, Road 4 Dhanmondi 9, Dhaka-1206
        </span>
        <span className="inline-flex items-center gap-2">
          <Phone className="h-4 w-4" aria-hidden="true" /> 01917040322
        </span>
        <span className="inline-flex items-center gap-2">
          <Mail className="h-4 w-4" aria-hidden="true" /> support@bookpie.local
        </span>
      </div>
    </footer>
  );
}
