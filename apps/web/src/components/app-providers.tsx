"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { MetaPixelRouteTracker } from "@/components/analytics/meta-pixel-route-tracker";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <MetaPixelRouteTracker />
      </Suspense>
      <CartSessionSync />
      {children}
      <CartDrawer />
    </QueryClientProvider>
  );
}

function CartSessionSync() {
  const accessToken = useAuthStore((state) => state.tokens?.accessToken);
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    if (!accessToken) return;
    void syncCart();
  }, [accessToken, syncCart]);

  return null;
}
