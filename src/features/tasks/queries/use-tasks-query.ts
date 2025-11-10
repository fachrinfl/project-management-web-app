"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchTasks } from "../services/task-service";
import type {
  GetTasksParams,
  TaskPriority,
  TaskStatus,
} from "../types/task-types";

type UseTasksQueryProps = {
  name?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  perPage?: number;
};

export function useTasksQuery(params: UseTasksQueryProps = {}) {
  const filters = useMemo<Omit<GetTasksParams, "page">>(
    () => ({
      name: params.name?.trim() || undefined,
      status: params.status ?? "todo",
      priority: params.priority ?? "all",
      perPage: params.perPage ?? 10,
    }),
    [params.name, params.status, params.priority, params.perPage],
  );

  return useInfiniteQuery({
    queryKey: ["tasks", filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchTasks({
        ...filters,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta.pagination;
      if (currentPage >= totalPages) {
        return undefined;
      }
      return currentPage + 1;
    },
    staleTime: 1000 * 60 * 2,
  });
}

