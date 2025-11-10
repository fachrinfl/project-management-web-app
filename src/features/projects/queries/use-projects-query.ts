"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchProjects } from "../services/project-service";
import type {
  GetProjectsParams,
  ProjectStatus,
} from "../types/project-types";

type UseProjectsQueryProps = {
  name?: string;
  status?: ProjectStatus | "all";
  perPage?: number;
};

export function useProjectsQuery(params: UseProjectsQueryProps = {}) {
  const filters = useMemo<Omit<GetProjectsParams, "page">>(
    () => ({
      name: params.name?.trim() || undefined,
      status: params.status ?? "active",
      perPage: params.perPage ?? 10,
    }),
    [params.name, params.status, params.perPage],
  );

  return useInfiniteQuery({
    queryKey: ["projects", filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchProjects({
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

