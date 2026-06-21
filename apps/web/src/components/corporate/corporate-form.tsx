"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CorporateForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const requirements = String(formData.get("requirements") ?? "").trim();

    if (name.length < 2 || !/^01[3-9]\d{8}$/.test(phone) || requirements.length < 10) {
      setError("নাম, সঠিক ফোন নম্বর এবং প্রয়োজনীয় বইয়ের বর্ণনা দিন।");
      setSubmitted(false);
      return;
    }

    event.currentTarget.reset();
    setError(null);
    setSubmitted(true);
  };

  return (
    <form className="rounded-lg border bg-card p-6" onSubmit={submitQuote}>
      <div className="grid gap-4">
        <Input name="name" placeholder="আপনার নাম লিখুন" aria-label="Name" />
        <Input name="phone" placeholder="আপনার ফোন নম্বর লিখুন" aria-label="Phone" />
        <Input name="organization" placeholder="প্রতিষ্ঠানের নাম লিখুন (ঐচ্ছিক)" aria-label="Organization" />
        <Input name="email" placeholder="আপনার ইমেইল লিখুন (ঐচ্ছিক)" aria-label="Email" />
        <textarea
          name="requirements"
          className="min-h-32 rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="আপনার প্রয়োজনীয় বইয়ের তালিকা বা বর্ণনা লিখুন"
          aria-label="Requirements"
        />
        {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
        {submitted ? <p className="text-xs font-medium text-primary">আপনার কোটেশন রিকোয়েস্ট গ্রহণ করা হয়েছে।</p> : null}
        <Button type="submit">কোটেশন রিকোয়েস্ট করুন</Button>
      </div>
    </form>
  );
}
