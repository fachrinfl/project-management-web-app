import axios, { AxiosHeaders } from "axios";

import { API_CONFIG } from "@/application/config/config";
import { getAuthTokenFromCookie } from "@/shared/utils/auth-token";

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = getAuthTokenFromCookie();

  if (token) {
    const headers = AxiosHeaders.from(config.headers ?? {});

    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    return Promise.reject(error);
  },
);
