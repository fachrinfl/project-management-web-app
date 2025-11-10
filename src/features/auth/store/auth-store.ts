"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  clearAuthTokenCookie,
  setAuthTokenCookie,
} from "@/shared/utils/auth-token";

import type { AuthUser } from "../types/auth-types";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

type AuthActions = {
  setAuth: (auth: { accessToken: string; user: AuthUser }) => void;
  clearAuth: () => void;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore>(
    (set) => ({
      ...initialState,
      setAuth: ({ accessToken, user }) =>
        set(() => {
          if (accessToken) {
            setAuthTokenCookie(accessToken);
          } else {
            clearAuthTokenCookie();
          }

          return {
            accessToken,
            user,
          };
        }),
      clearAuth: () =>
        set(() => {
          clearAuthTokenCookie();
          return { ...initialState };
        }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
