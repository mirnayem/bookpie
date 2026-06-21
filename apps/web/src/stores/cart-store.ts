"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addApiCartItem,
  cartItemToProduct,
  clearApiCart,
  getApiCart,
  removeApiCartItem,
  updateApiCartItem,
} from "@/lib/storefront-api";
import { useAuthStore } from "@/stores/auth-store";
import type { Product } from "@/types/storefront";

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartUiState = {
  isOpen: boolean;
  items: CartLine[];
  wishlist: Product[];
  open: () => void;
  close: () => void;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  mergeGuestCartAfterLogin: () => void;
  toggleWishlist: (product: Product) => void;
  removeWishlist: (productId: string) => void;
  moveWishlistToCart: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: () => number;
  wishlistCount: () => number;
  subtotal: () => number;
  originalSubtotal: () => number;
};

export const useCartStore = create<CartUiState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      wishlist: [],
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (product, quantity = 1) => {
        const safeQuantity = Math.max(1, quantity);
        const token = useAuthStore.getState().tokens?.accessToken;
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + safeQuantity } : item,
              ),
              isOpen: true,
            };
          }

          return { items: [...state.items, { product, quantity: safeQuantity }], isOpen: true };
        });

        if (token) {
          addApiCartItem(token, product.id, safeQuantity)
            .then((cart) => set({ items: apiCartToLines(cart), isOpen: true }))
            .catch(() => undefined);
        }
      },
      updateQuantity: (productId, quantity) => {
        const safeQuantity = Math.max(1, quantity);
        const token = useAuthStore.getState().tokens?.accessToken;
        set((state) => ({
          items: state.items.map((item) => (item.product.id === productId ? { ...item, quantity: safeQuantity } : item)),
        }));

        if (token) {
          updateApiCartItem(token, productId, safeQuantity)
            .then((cart) => set({ items: apiCartToLines(cart) }))
            .catch(() => undefined);
        }
      },
      removeItem: (productId) => {
        const token = useAuthStore.getState().tokens?.accessToken;
        set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) }));

        if (token) {
          removeApiCartItem(token, productId)
            .then((cart) => set({ items: apiCartToLines(cart) }))
            .catch(() => undefined);
        }
      },
      clearCart: () => {
        const token = useAuthStore.getState().tokens?.accessToken;
        set({ items: [] });

        if (token) {
          clearApiCart(token)
            .then((cart) => set({ items: apiCartToLines(cart) }))
            .catch(() => undefined);
        }
      },
      syncCart: async () => {
        const token = useAuthStore.getState().tokens?.accessToken;
        if (!token) return;

        const localItems = get().items;
        for (const item of localItems) {
          await addApiCartItem(token, item.product.id, item.quantity).catch(() => undefined);
        }

        const cart = await getApiCart(token);
        set({ items: apiCartToLines(cart) });
      },
      mergeGuestCartAfterLogin: () => {
        set((state) => {
          const itemsById = new Map<string, CartLine>();
          for (const item of state.items) {
            const existing = itemsById.get(item.product.id);
            itemsById.set(item.product.id, {
              product: item.product,
              quantity: Math.max(1, (existing?.quantity ?? 0) + item.quantity),
            });
          }

          const wishlistById = new Map(state.wishlist.map((product) => [product.id, product]));

          return {
            items: Array.from(itemsById.values()),
            wishlist: Array.from(wishlistById.values()),
          };
        });
      },
      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.wishlist.some((item) => item.id === product.id);
          return {
            wishlist: exists ? state.wishlist.filter((item) => item.id !== product.id) : [product, ...state.wishlist],
          };
        });
      },
      removeWishlist: (productId) => {
        set((state) => ({ wishlist: state.wishlist.filter((item) => item.id !== productId) }));
      },
      moveWishlistToCart: (productId) => {
        const product = get().wishlist.find((item) => item.id === productId);
        if (!product) return;
        get().addItem(product, 1);
        get().removeWishlist(productId);
      },
      isWishlisted: (productId) => get().wishlist.some((item) => item.id === productId),
      cartCount: () => get().items.reduce((count, item) => count + item.quantity, 0),
      wishlistCount: () => get().wishlist.length,
      subtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      originalSubtotal: () =>
        get().items.reduce((sum, item) => sum + (item.product.originalPrice ?? item.product.price) * item.quantity, 0),
    }),
    {
      name: "bookpie-shopping",
      partialize: (state) => ({ items: state.items, wishlist: state.wishlist }),
    },
  ),
);

function apiCartToLines(cart: Awaited<ReturnType<typeof getApiCart>>): CartLine[] {
  return cart.items.map((item) => ({
    product: cartItemToProduct(item),
    quantity: item.quantity,
  }));
}
