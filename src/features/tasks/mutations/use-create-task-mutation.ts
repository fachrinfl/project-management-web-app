"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTask } from "../services/task-service";
import type { TaskCreateSchema } from "../schemas/task-create-schema";
import type { TaskPriority, TaskStatus } from "../types/task-types";
import { useAuthStore } from "@/features/auth/store/auth-store";

type CreateTaskInput = TaskCreateSchema;

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!userId) {
        throw new Error("You must be logged in to create a task.");
      }

      const { projectId, ...payload } = input;
      const startDateISO = new Date(payload.startDate).toISOString();
      const endDateISO = new Date(payload.endDate).toISOString();

      return createTask(projectId, {
        ...payload,
        status: payload.status as TaskStatus,
        priority: payload.priority as TaskPriority,
        startDate: startDateISO,
        endDate: endDateISO,
        assigneeId: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

