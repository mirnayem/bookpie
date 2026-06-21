import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function ContactRoute() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <h1 className="text-2xl font-semibold">যোগাযোগ করুন</h1>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-muted-foreground md:grid-cols-3">
          <p className="rounded-lg border bg-card p-5">Head Office: House 310, Road 21 Mohakhali DOHS, Dhaka-1206</p>
          <p className="rounded-lg border bg-card p-5">Phone: 096 7777 1365</p>
          <p className="rounded-lg border bg-card p-5">Email: support@bookpie.local</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
