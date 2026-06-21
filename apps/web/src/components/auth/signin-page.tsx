"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, LayoutDashboard, LogOut, ShoppingBag, ShoppingCart } from "lucide-react";
import { LoginModal } from "@/components/auth/login-modal";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api-client";
import { isAdminUser, useAuthStore } from "@/stores/auth-store";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

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
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  if (!hasMounted) {
    return (
      <main className="container-page grid min-h-[620px] items-center gap-8 py-16 md:grid-cols-[1.25fr_1fr]">
        <div className="relative min-h-[320px]">
          <Image src={illustration} alt="Reader carrying books" fill priority sizes="640px" className="object-contain" unoptimized />
        </div>
        <section className="mx-auto w-full max-w-md">
          <Logo />
          <div className="mt-6 rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold">Checking your session...</p>
            <p className="mt-1 text-sm text-muted-foreground">We are preparing the right account view for you.</p>
          </div>
        </section>
      </main>
    );
  }

  if (user) {
    const isAdmin = isAdminUser(user);

    return (
      <main className="container-page grid min-h-[620px] items-center gap-8 py-16 md:grid-cols-[1.25fr_1fr]">
        <div className="relative min-h-[320px]">
          <Image src={illustration} alt="Reader carrying books" fill priority sizes="640px" className="object-contain" unoptimized />
        </div>
        <section className="mx-auto w-full max-w-md">
          <Logo />
          <div className="mt-6 rounded-lg border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Already signed in</p>
            <h1 className="mt-2 text-xl font-semibold">Welcome back, {user.name}</h1>
            <p className="mt-1 break-words text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button asChild className="w-full">
                <Link href="/books">
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  Browse books
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/cart">
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  Cart
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/wishlist">
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Wishlist
                </Link>
              </Button>
              {isAdmin ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin">
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    Admin
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/checkout">
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    Checkout
                  </Link>
                </Button>
              )}
            </div>
            <Button type="button" variant="ghost" className="mt-4 w-full text-muted-foreground" onClick={logout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out and use another account
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container-page grid min-h-[620px] items-center gap-8 py-16 md:grid-cols-[1.4fr_1fr]">
      <div className="relative min-h-[320px]">
        <Image src={illustration} alt="Reader carrying books" fill priority sizes="640px" className="object-contain" unoptimized />
      </div>
      <section className="mx-auto w-full max-w-sm">
        <Logo />
        <h1 className="sr-only">Sign in to BookPie</h1>
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
