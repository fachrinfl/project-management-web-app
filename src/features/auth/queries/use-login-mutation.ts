"use client";

import { useMutation } from "@tanstack/react-query";

import type { LoginSchema } from "../schemas/login-schema";
import { login } from "../services/auth-service";
import { useAuthStore } from "../store/auth-store";
import type { LoginResponse } from "../types/auth-types";

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<LoginResponse, Error, LoginSchema>({
    mutationFn: login,
    onSuccess: (response) => {
      setAuth({
        accessToken: response.accessToken,
        user: response.user,
      });
    },
  });
}
