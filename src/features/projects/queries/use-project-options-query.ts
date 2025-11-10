"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchProjects } from "../services/project-service";

export function useProjectOptionsQuery() {
  return useQuery({
    queryKey: ["project-options"],
    queryFn: async () => {
      const response = await fetchProjects({ perPage: 100, status: "all" });

      return response;
    },
    staleTime: 1000 * 60 * 5,
  });
}
