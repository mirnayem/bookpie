import Image from "next/image";
import { LoginModal } from "@/components/auth/login-modal";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SigninPageProps = {
  illustration: string;
};

export function SigninPage({ illustration }: SigninPageProps) {
  return (
    <main className="container-page grid min-h-[620px] items-center gap-8 py-16 md:grid-cols-[1.4fr_1fr]">
      <div className="relative min-h-[320px]">
        <Image src={illustration} alt="Reader carrying books" fill priority sizes="640px" className="object-contain" unoptimized />
      </div>
      <section className="mx-auto w-full max-w-sm">
        <Logo />
        <h1 className="sr-only">Sign in to BookPie</h1>
        <p className="mt-6 text-sm font-semibold">মোবাইল নাম্বার দিয়ে লগইন করুন</p>
        <form className="mt-4 space-y-4">
          <Input placeholder="01324299XXX" aria-label="Mobile number" />
          <Button type="submit" className="w-full">
            লগইন/রেজিস্টার
          </Button>
        </form>
        <div className="mt-5 grid gap-3">
          <LoginModal illustration={illustration} />
          <Button variant="outline">গুগল দিয়ে লগইন করুন</Button>
        </div>
      </section>
    </main>
  );
}
