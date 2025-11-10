"use client";

import { useMutation } from "@tanstack/react-query";

import type { RegisterSchema } from "../schemas/register-schema";
import { login, register } from "../services/auth-service";
import { useAuthStore } from "../store/auth-store";
import type { LoginResponse, RegisterResponse } from "../types/auth-types";

type RegisterMutationResult = RegisterResponse & {
  accessToken: string;
  refreshToken?: string;
};

export function useRegisterMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<RegisterMutationResult, Error, RegisterSchema>({
    mutationFn: async (payload) => {
      const registerResponse = await register(payload);

      let accessToken = registerResponse.accessToken;
      let refreshToken = registerResponse.refreshToken;
      let user = registerResponse.user;

      if (!accessToken) {
        const loginPayload = {
        email: payload.email,
        password: payload.password,
      };

        const loginResponse: LoginResponse = await login(loginPayload);
        accessToken = loginResponse.accessToken;
        refreshToken = loginResponse.refreshToken;
        user = loginResponse.user;
      }

      return {
        ...registerResponse,
        user,
        accessToken,
        refreshToken,
      };
    },
    onSuccess: (response) => {
      setAuth({
        accessToken: response.accessToken,
        user: response.user,
      });
    },
  });
}

