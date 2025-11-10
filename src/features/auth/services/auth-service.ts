import axios from "axios";

import { apiClient } from "@/shared/services/api-client";

import type { LoginSchema } from "../schemas/login-schema";
import type { RegisterSchema } from "../schemas/register-schema";
import type {
  LoginResponse,
  ProfileResponse,
  RegisterResponse,
} from "../types/auth-types";

export async function login(payload: LoginSchema): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post<LoginResponse>(
      "/api/auth/login",
      payload,
    );

    return data;
  } catch (error) {
    handleAuthError(error);
  }
}

export async function register(
  payload: RegisterSchema,
): Promise<RegisterResponse> {
  try {
    const { name, email, password } = payload;

    const { data } = await apiClient.post<RegisterResponse>(
      "/api/auth/register",
      { name, email, password },
    );

    return data;
  } catch (error) {
    handleAuthError(error);
  }
}

function handleAuthError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string })?.message ??
      "Unable to complete request. Please try again.";
    throw new Error(message);
  }

  throw new Error("Unable to complete request. Please try again.");
}

export async function getCurrentUser(): Promise<ProfileResponse> {
  try {
    const { data } = await apiClient.get<ProfileResponse>("/api/auth/me");

    return data;
  } catch (error) {
    handleAuthError(error);
  }
}
