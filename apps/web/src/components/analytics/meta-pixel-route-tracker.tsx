"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackMetaPixelEvent } from "@/lib/meta-pixel";

export function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    if (lastTrackedUrl.current === url) return;

    lastTrackedUrl.current = url;
    trackMetaPixelEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}
