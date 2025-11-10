import { apiClient } from "@/shared/services/api-client";

import type {
  CreateTaskPayload,
  GetTasksParams,
  GetTasksResponse,
} from "../types/task-types";

export async function fetchTasks(
  params: GetTasksParams = {},
): Promise<GetTasksResponse> {
  const {
    name,
    status,
    priority,
    page = 1,
    perPage = 10,
  } = params;

  const response = await apiClient.get<GetTasksResponse>(
    "/api/projects/tasks/user",
    {
      params: {
        ...(name ? { name } : {}),
        ...(status && status !== "all" ? { status } : {}),
        ...(priority && priority !== "all" ? { priority } : {}),
        page,
        perPage,
      },
    },
  );

  return response.data;
}

export async function createTask(
  projectId: string,
  payload: CreateTaskPayload,
) {
  const response = await apiClient.post(
    `/api/projects/${projectId}/tasks`,
    payload,
  );

  return response.data;
}


export async function deleteTask(taskId: string) {
  const response = await apiClient.delete(`/api/projects/tasks/${taskId}`);

  return response.data;
}
