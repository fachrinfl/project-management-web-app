import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchTasks } from "@/features/tasks/services/task-service";

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

describe("fetchTasks", () => {
  beforeEach(async () => {
    const { apiClient } = await import("@/shared/services/api-client");
    (apiClient.get as ReturnType<typeof vi.fn>).mockClear();
  });

  it("calls tasks endpoint with default params", async () => {
    const { apiClient } = await import("@/shared/services/api-client");

    await fetchTasks();

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/projects/tasks/user",
      {
        params: {
          page: 1,
          perPage: 10,
        },
      },
    );
  });

  it("passes through provided params", async () => {
    const { apiClient } = await import("@/shared/services/api-client");

    await fetchTasks({
      name: "Task",
      status: "todo",
      priority: "high",
      page: 2,
      perPage: 5,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/projects/tasks/user",
      {
        params: {
          name: "Task",
          status: "todo",
          priority: "high",
          page: 2,
          perPage: 5,
        },
      },
    );
  });

  it("omits status and priority when set to all", async () => {
    const { apiClient } = await import("@/shared/services/api-client");

    await fetchTasks({
      status: "all",
      priority: "all",
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/projects/tasks/user",
      {
        params: {
          page: 1,
          perPage: 10,
        },
      },
    );
  });
});

