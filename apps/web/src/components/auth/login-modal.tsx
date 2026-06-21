"use client";

import { Eye, X } from "lucide-react";
import Image from "next/image";
import type { FormEvent } from "react";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDemoAuthResponse } from "@/lib/demo-auth";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

type LoginModalProps = {
  illustration: string;
};

export function LoginModal({ illustration }: LoginModalProps) {
  const [open, setOpen] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const mergeGuestCartAfterLogin = useCartStore((state) => state.mergeGuestCartAfterLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submitEmailLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.includes("@") || password.length < 6) {
      setError("সঠিক ইমেইল এবং অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন");
      return;
    }

    setAuth(createDemoAuthResponse(email));
    mergeGuestCartAfterLogin();
    setError(null);
    setNotice(null);
    setOpen(false);
  };

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        ইমেইল দিয়ে লগইন করুন
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative grid w-full max-w-4xl overflow-hidden rounded-lg bg-background shadow-soft md:grid-cols-[1.5fr_1fr]">
            <button
              type="button"
              aria-label="Close login modal"
              className="absolute right-3 top-3 z-10 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="relative hidden min-h-[360px] md:block">
              <Image src={illustration} alt="Login illustration" fill sizes="560px" className="object-cover" unoptimized />
            </div>
            <div className="p-8">
              <Logo />
              <h2 className="mt-5 text-xl font-bold">Login</h2>
              <form className="mt-5 space-y-4" onSubmit={submitEmailLogin}>
                <label className="grid gap-2 text-sm">
                  Email Address
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm">
                  Password
                  <span className="relative">
                    <Input type="password" className="pr-10" value={password} onChange={(event) => setPassword(event.target.value)} />
                    <Eye className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </span>
                </label>
                {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
                {notice ? <p className="text-xs font-medium text-primary">{notice}</p> : null}
                <button type="button" className="ml-auto block text-xs text-muted-foreground hover:text-primary" onClick={() => setNotice("ডেমো reset link প্রস্তুত করা হয়েছে।")}>
                  Forgot password?
                </button>
                <Button type="submit" className="w-full">
                  লগইন/রেজিস্টার
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
