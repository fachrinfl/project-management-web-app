import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchProjects } from "@/features/projects/services/project-service";

vi.mock("@/shared/services/api-client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: [],
        meta: {
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 10,
          },
        },
      },
    }),
  },
}));

describe("fetchProjects", () => {
  beforeEach(async () => {
    const { apiClient } = await import("@/shared/services/api-client");
    (apiClient.get as ReturnType<typeof vi.fn>).mockClear();
  });

  it("calls projects endpoint with default params", async () => {
    const { apiClient } = await import("@/shared/services/api-client");

    await fetchProjects();

    expect(apiClient.get).toHaveBeenCalledWith("/api/projects", {
      params: {
        page: 1,
        perPage: 10,
      },
    });
  });

  it("passes through provided params", async () => {
    const { apiClient } = await import("@/shared/services/api-client");

    await fetchProjects({
      name: "Project",
      status: "active",
      page: 2,
      perPage: 5,
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/projects", {
      params: {
        name: "Project",
        status: "active",
        page: 2,
        perPage: 5,
      },
    });
  });

  it("omits status param when value is 'all'", async () => {
    const { apiClient } = await import("@/shared/services/api-client");

    await fetchProjects({
      status: "all",
    });

    expect(apiClient.get).toHaveBeenCalledWith("/api/projects", {
      params: {
        page: 1,
        perPage: 10,
      },
    });
  });
});
