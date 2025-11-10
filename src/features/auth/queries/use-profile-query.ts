"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthTokenFromCookie } from "@/shared/utils/auth-token";
import { getCurrentUser } from "../services/auth-service";
import { useAuthStore } from "../store/auth-store";

export function useProfileQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const cookieToken =
    typeof window !== "undefined" ? getAuthTokenFromCookie() : null;

  return useQuery({
    queryKey: ["profile"],
    enabled: Boolean(accessToken ?? cookieToken),
    queryFn: async () => {
      const response = await getCurrentUser();

      return response;
    },
    staleTime: 1000 * 60 * 5,
  });
}
