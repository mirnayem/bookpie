"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
      },
      updateQuantity: (productId, quantity) => {
        const safeQuantity = Math.max(1, quantity);
        set((state) => ({
          items: state.items.map((item) => (item.product.id === productId ? { ...item, quantity: safeQuantity } : item)),
        }));
      },
      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) }));
      },
      clearCart: () => set({ items: [] }),
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
