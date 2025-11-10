import { apiClient } from "@/shared/services/api-client";

import type {
  GetProjectsParams,
  GetProjectsResponse,
} from "../types/project-types";

export async function fetchProjects(
  params: GetProjectsParams = {},
): Promise<GetProjectsResponse> {
  const { name, status, page = 1, perPage = 10 } = params;

  const response = await apiClient.get<GetProjectsResponse>("/api/projects", {
    params: {
      ...(name ? { name } : {}),
      ...(status && status !== "all" ? { status } : {}),
      page,
      perPage,
    },
  });

  return response.data;
}

