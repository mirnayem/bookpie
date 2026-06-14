import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CorporateForm() {
  return (
    <form className="rounded-lg border bg-card p-6">
      <div className="grid gap-4">
        <Input placeholder="আপনার নাম লিখুন" aria-label="Name" />
        <Input placeholder="আপনার ফোন নম্বর লিখুন" aria-label="Phone" />
        <Input placeholder="প্রতিষ্ঠানের নাম লিখুন (ঐচ্ছিক)" aria-label="Organization" />
        <Input placeholder="আপনার ইমেইল লিখুন (ঐচ্ছিক)" aria-label="Email" />
        <textarea
          className="min-h-32 rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="আপনার প্রয়োজনীয় বইয়ের তালিকা বা বর্ণনা লিখুন"
          aria-label="Requirements"
        />
        <Button type="submit">কোটেশন রিকোয়েস্ট করুন</Button>
      </div>
    </form>
  );
}
