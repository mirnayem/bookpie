"use client";

import Image from "next/image";
import { LoginModal } from "@/components/auth/login-modal";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api-client";
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
  const [email, setEmail] = useState("customer@bookpie.local");
  const [password, setPassword] = useState("password123");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.includes("@") || password.length < 6) {
      setError("সঠিক ইমেইল এবং পাসওয়ার্ড লিখুন");
      setMessage(null);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      setAuth(response);
      setError(null);
      setMessage("লগইন সম্পন্ন হয়েছে।");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "লগইন করা যায়নি");
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
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
        <p className="mt-6 text-sm font-semibold">ইমেইল দিয়ে লগইন করুন</p>
        <form className="mt-4 space-y-4" onSubmit={submitLogin}>
          <Input type="email" value={email} placeholder="customer@bookpie.local" aria-label="Email" onChange={(event) => setEmail(event.target.value)} />
          <Input type="password" value={password} placeholder="password123" aria-label="Password" onChange={(event) => setPassword(event.target.value)} />
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
          {message ? <p className="text-xs font-medium text-primary">{message}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </Button>
        </form>
        <div className="mt-5 grid gap-3">
          <LoginModal illustration={illustration} />
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              setIsSubmitting(true);
              try {
                const response = await login({ email: "customer@bookpie.local", password: "password123" });
                setAuth(response);
                setMessage("Seeded customer login সম্পন্ন হয়েছে।");
                setError(null);
              } catch (loginError) {
                setError(loginError instanceof Error ? loginError.message : "লগইন করা যায়নি");
                setMessage(null);
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
          >
            seeded customer দিয়ে লগইন করুন
          </Button>
        </div>
      </section>
    </main>
  );
}
