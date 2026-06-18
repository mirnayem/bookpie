"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { AdminLoginGate } from "@/components/admin/admin-login-gate";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Button } from "@/components/ui/button";

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminLoginGate>
      <div className="min-h-screen overflow-x-hidden bg-muted/40">
        <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
          <AdminSidebar />
        </div>
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full w-72 bg-background">
              <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 z-10" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
              <AdminSidebar />
            </div>
          </div>
        ) : null}
        <div className="min-w-0 lg:pl-72">
          <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </AdminLoginGate>
  );
}
