import { BadgeDollarSign, Boxes, ClipboardList, Headphones, ShieldCheck, Users } from "lucide-react";
import { BenefitCard } from "@/components/corporate/benefit-card";
import { CorporateForm } from "@/components/corporate/corporate-form";
import { ServiceCard } from "@/components/corporate/service-card";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: BadgeDollarSign, title: "বিশেষ কর্পোরেট মূল্য", description: "বড় অর্ডারে সেরা মূল্য ও একক কোটেশনের সুবিধা।" },
  { icon: Boxes, title: "দ্রুত ডেলিভারি", description: "সারা বাংলাদেশের জন্য নির্ভরযোগ্য ডেলিভারি সাপোর্ট।" },
  { icon: ShieldCheck, title: "বিশ্বস্ত মানসম্পন্ন বই", description: "ইসলামিক, একাডেমিক ও সাধারণ বইয়ের নির্ভরযোগ্য সংগ্রহ।" },
  { icon: Users, title: "ডেডিকেটেড একাউন্ট ম্যানেজার", description: "প্রতিষ্ঠানের জন্য আলাদা সহায়তা ও পরামর্শ।" },
  { icon: ClipboardList, title: "সহজ ইনভয়েসিং", description: "প্রয়োজনমতো কোটেশন, ইনভয়েস ও পেমেন্ট ব্যবস্থা।" },
  { icon: Headphones, title: "সাপোর্ট", description: "যেকোনো সমস্যায় দ্রুত যোগাযোগ সুবিধা।" },
];

const services = [
  { icon: "🏫", title: "স্কুল ও কলেজ" },
  { icon: "📚", title: "মাদ্রাসা" },
  { icon: "🎓", title: "বিশ্ববিদ্যালয়" },
  { icon: "🕌", title: "মসজিদ ও ইসলামিক সেন্টার" },
  { icon: "🏛", title: "সরকারি প্রতিষ্ঠান" },
  { icon: "🤝", title: "বেসরকারি সংস্থা (NGO)" },
  { icon: "🏢", title: "কর্পোরেট অফিস" },
  { icon: "📖", title: "লাইব্রেরি" },
];

export function CorporatePage() {
  return (
    <main>
      <section className="bg-gradient-to-r from-red-600 to-red-800 py-20 text-center text-white">
        <div className="container-page">
          <h1 className="text-3xl font-bold">Bookpie কর্পোরেট সার্ভিস</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7">আপনার প্রতিষ্ঠান, স্কুল ও কলেজ, বিশ্ববিদ্যালয়, মাদ্রাসা বা সংস্থার জন্য যে কোনো পরিমাণ বই অর্ডার করুন সহজে।</p>
          <Button className="mt-8 bg-white text-primary hover:bg-white/90">Request a Quote</Button>
          <p className="mt-5 text-sm">corporate@bookpie.local | Call: 01324299979</p>
        </div>
      </section>
      <section className="container-page py-14 text-center">
        <h2 className="text-2xl font-bold">কেন BookPie কর্পোরেট সার্ভিস?</h2>
        <p className="mt-2 text-sm text-muted-foreground">আমরা প্রতিষ্ঠানের বই সংগ্রহের সব প্রয়োজন পূরণ করি।</p>
        <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-3">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </section>
      <section className="border-y py-14">
        <div className="container-page text-center">
          <h2 className="text-2xl font-bold">আমরা যাদের সেবা দিই</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>
      <section className="container-page grid gap-10 py-14 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">কোটেশন রিকোয়েস্ট করুন</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">আপনার প্রয়োজনীয় বইয়ের তালিকা এবং তথ্য দিন। আমাদের টিম ২৪ ঘণ্টার মধ্যে যোগাযোগ করবে।</p>
          <div className="mt-8 rounded-lg bg-muted p-6 text-sm">
            <p className="font-semibold">সরাসরি যোগাযোগ করুন:</p>
            <p className="mt-2 text-primary">01324299979</p>
            <p className="text-primary">corporate@bookpie.local</p>
          </div>
        </div>
        <CorporateForm />
      </section>
    </main>
  );
}
