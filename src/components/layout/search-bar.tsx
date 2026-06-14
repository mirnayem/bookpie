"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  return (
    <form className={cn("relative", className)} role="search">
      <Input
        type="search"
        name="q"
        aria-label="Search books"
        placeholder="বইয়ের নাম ও লেখক দিয়ে অনুসন্ধান করুন"
        className="h-12 rounded-md pr-12"
      />
      <button
        type="submit"
        aria-label="Submit search"
        className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
}
