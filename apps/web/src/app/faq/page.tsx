import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const faqs = [
  { question: "কিভাবে অর্ডার করব?", answer: "পণ্য কার্টে যোগ করে চেকআউট পেজে ডেলিভারি তথ্য দিন।" },
  { question: "ডেলিভারি চার্জ কত?", answer: "ডেমো স্টোরে ডেলিভারি চার্জ ৭৯৳ দেখানো হয়েছে।" },
  { question: "পেমেন্ট কীভাবে করা যাবে?", answer: "Cash on delivery, bKash এবং SSLCommerz অপশন চেকআউটে রাখা হয়েছে।" },
];

export default function FaqRoute() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <h1 className="text-2xl font-semibold">প্রশ্নোত্তর</h1>
        <div className="mt-6 grid gap-4">
          {faqs.map((faq) => (
            <section key={faq.question} className="rounded-lg border bg-card p-5">
              <h2 className="font-semibold">{faq.question}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
