"use client";

import Image from "next/image";
import { LoginModal } from "@/components/auth/login-modal";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDemoAuthResponse } from "@/lib/demo-auth";
import { useAuthStore } from "@/stores/auth-store";
import type { FormEvent } from "react";
import { useState } from "react";

type SigninPageProps = {
  illustration: string;
};

export function SigninPage({ illustration }: SigninPageProps) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitPhoneLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPhone = phone.trim();

    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      setError("সঠিক মোবাইল নম্বর লিখুন");
      setMessage(null);
      return;
    }

    setAuth(createDemoAuthResponse(normalizedPhone));
    setError(null);
    setMessage("ডেমো একাউন্টে লগইন সম্পন্ন হয়েছে।");
  };

  return (
    <main className="container-page grid min-h-[620px] items-center gap-8 py-16 md:grid-cols-[1.4fr_1fr]">
      <div className="relative min-h-[320px]">
        <Image src={illustration} alt="Reader carrying books" fill priority sizes="640px" className="object-contain" unoptimized />
      </div>
      <section className="mx-auto w-full max-w-sm">
        <Logo />
        <h1 className="sr-only">Sign in to BookPie</h1>
        {user ? (
          <div className="mt-6 rounded-lg border bg-card p-4 text-sm">
            <p className="font-semibold">Signed in as {user.name}</p>
            <p className="mt-1 text-muted-foreground">{user.email}</p>
            <Button type="button" variant="outline" className="mt-4 w-full" onClick={logout}>
              Logout
            </Button>
          </div>
        ) : null}
        <p className="mt-6 text-sm font-semibold">মোবাইল নাম্বার দিয়ে লগইন করুন</p>
        <form className="mt-4 space-y-4" onSubmit={submitPhoneLogin}>
          <Input value={phone} placeholder="01324299XXX" aria-label="Mobile number" onChange={(event) => setPhone(event.target.value)} />
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
          {message ? <p className="text-xs font-medium text-primary">{message}</p> : null}
          <Button type="submit" className="w-full">
            লগইন/রেজিস্টার
          </Button>
        </form>
        <div className="mt-5 grid gap-3">
          <LoginModal illustration={illustration} />
          <Button type="button" variant="outline" onClick={() => { setAuth(createDemoAuthResponse("google-customer@bookpie.local")); setMessage("Google demo login সম্পন্ন হয়েছে।"); setError(null); }}>
            গুগল দিয়ে লগইন করুন
          </Button>
        </div>
      </section>
    </main>
  );
}
