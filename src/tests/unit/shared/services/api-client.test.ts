import { beforeEach, describe, expect, it } from "vitest";

import { apiClient } from "@/shared/services/api-client";

describe("apiClient request interceptor", () => {
  beforeEach(() => {
    document.cookie = "auth-token=; Max-Age=0; path=/";
  });

  it("adds Authorization header when auth-token cookie exists", async () => {
    document.cookie = "auth-token=test-token";

    const handler =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (apiClient.interceptors.request as any).handlers[0]?.fulfilled;

    const config = await handler?.({
      headers: {},
    });

    expect(config?.headers?.Authorization).toBe("Bearer test-token");
  });

  it("keeps existing Authorization header when already set", async () => {
    document.cookie = "auth-token=test-token";

    const handler =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (apiClient.interceptors.request as any).handlers[0]?.fulfilled;

    const config = await handler?.({
      headers: {
        Authorization: "Bearer existing-token",
      },
    });

    expect(config?.headers?.Authorization).toBe("Bearer existing-token");
  });

  it("does not add Authorization header when cookie is missing", async () => {
    const handler =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (apiClient.interceptors.request as any).handlers[0]?.fulfilled;

    const config = await handler?.({
      headers: {},
    });

    expect(config?.headers?.Authorization).toBeUndefined();
  });
});

