"use client";

import { Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminNavItems } from "@/lib/admin/navigation";
import { useAuthStore } from "@/stores/auth-store";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return adminNavItems.filter((item) => item.label.toLowerCase().includes(needle)).slice(0, 6);
  }, [query]);

  function navigateToFirstMatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [firstMatch] = matches;
    if (firstMatch) {
      setQuery("");
      router.push(firstMatch.href);
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <Button type="button" variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin navigation" onClick={onMenuClick}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <form className="relative hidden w-full max-w-md md:block" onSubmit={navigateToFirstMatch}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input className="pl-9" placeholder="Search admin sections" aria-label="Search admin sections" value={query} onChange={(event) => setQuery(event.target.value)} />
        {matches.length ? (
          <div className="absolute left-0 top-12 z-30 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
            {matches.map((item) => (
              <button
                key={item.href}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                onClick={() => {
                  setQuery("");
                  router.push(item.href);
                }}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </form>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right text-sm sm:block">
          <p className="font-semibold">{user?.name ?? "Admin"}</p>
          <p className="text-xs text-muted-foreground">{user?.role ?? "admin"}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
