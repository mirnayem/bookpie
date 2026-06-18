"use client";

import { Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <Button type="button" variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin navigation" onClick={onMenuClick}>
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <div className="relative hidden w-full max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input className="pl-9" placeholder="Search admin sections" aria-label="Search admin sections" />
      </div>
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
