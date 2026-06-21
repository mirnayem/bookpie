import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function TermsRoute() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <h1 className="text-2xl font-semibold">শর্তাবলী</h1>
        <div className="mt-6 space-y-4 rounded-lg border bg-card p-6 text-sm leading-7 text-muted-foreground">
          <p>BookPie MVP storefrontে প্রদর্শিত পণ্য, মূল্য, ছাড় এবং অর্ডার ডেটা ডেমো ডেটা থেকে চালিত।</p>
          <p>চেকআউট সম্পন্ন করলে লোকাল ডেমো কনফার্মেশন দেখানো হয়। বাস্তব পেমেন্ট ও ডেলিভারি ব্যাকএন্ড চালু হলে একই UI API-এর সঙ্গে যুক্ত করা যাবে।</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
