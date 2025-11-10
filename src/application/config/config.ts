const FALLBACK_API_URL =
  "https://ts-project-management-api-production.up.railway.app";

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? FALLBACK_API_URL,
} as const;

export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
