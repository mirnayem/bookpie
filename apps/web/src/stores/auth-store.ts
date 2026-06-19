"use client";

import type { AuthResponse, AuthTokens, User } from "@bookpie/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: User | null;
  tokens: AuthTokens | null;
  setAuth: (response: AuthResponse) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (response) => set({ user: response.user, tokens: response.tokens }),
      logout: () => set({ user: null, tokens: null }),
    }),
    {
      name: "bookpie-auth",
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    },
  ),
);

export function isAdminUser(user: User | null) {
  return user?.role === "admin" || user?.role === "super_admin";
}
