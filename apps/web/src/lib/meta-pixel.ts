import type { Product } from "@/types/storefront";

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim() || "";

export type MetaPixelEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "Subscribe"
  | "Search";

type MetaPixelValuePayload = {
  value?: number;
  currency?: string;
};

type MetaPixelPayload = MetaPixelValuePayload & {
  content_ids?: string[];
  content_name?: string;
  content_type?: "product" | "product_group";
  contents?: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  num_items?: number;
  search_string?: string;
  status?: boolean;
  order_id?: string;
};

type Fbq = {
  (method: "init", pixelId: string): void;
  (method: "track", eventName: MetaPixelEventName, payload?: MetaPixelPayload): void;
};

const RETRY_DELAY_MS = 250;
const RETRY_LIMIT = 20;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export function trackMetaPixelEvent(eventName: MetaPixelEventName, payload?: MetaPixelPayload, retryCount = 0) {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;

  if (!window.fbq) {
    if (retryCount < RETRY_LIMIT) {
      window.setTimeout(() => trackMetaPixelEvent(eventName, payload, retryCount + 1), RETRY_DELAY_MS);
    }

    return;
  }

  window.fbq("track", eventName, payload);
}

export function productToMetaPixelPayload(product: Product, quantity = 1): MetaPixelPayload {
  return {
    content_ids: [product.id],
    content_name: product.title,
    content_type: "product",
    contents: [{ id: product.id, quantity, item_price: product.price }],
    currency: "BDT",
    value: product.price * quantity,
  };
}

export function cartLinesToMetaPixelPayload(lines: Array<{ product: Product; quantity: number }>, value?: number): MetaPixelPayload {
  const contents = lines.map((line) => ({
    id: line.product.id,
    quantity: line.quantity,
    item_price: line.product.price,
  }));

  return {
    content_ids: lines.map((line) => line.product.id),
    content_type: "product",
    contents,
    currency: "BDT",
    num_items: lines.reduce((count, line) => count + line.quantity, 0),
    value: value ?? lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  };
}
