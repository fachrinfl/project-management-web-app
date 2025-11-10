import { z } from "zod";

import type { TaskPriority, TaskStatus } from "../types/task-types";

const statusOptions = ["todo", "in_progress", "done"] as const satisfies readonly TaskStatus[];
const priorityOptions = ["low", "medium", "high", "critical"] as const satisfies readonly TaskPriority[];

export const taskCreateSchema = z
  .object({
    projectId: z
      .string({ required_error: "Project ID is required" })
      .min(1, "Project ID is required"),
    name: z
      .string({ required_error: "Task name is required" })
      .min(3, "Task name must be at least 3 characters"),
    description: z
      .string({ required_error: "Description is required" })
      .min(5, "Description must be at least 5 characters"),
    startDate: z.string({ required_error: "Start date is required" }),
    endDate: z.string({ required_error: "End date is required" }),
    status: z
      .enum(statusOptions, {
        errorMap: () => ({ message: "Invalid status" }),
      })
      .default("todo"),
    priority: z
      .enum(priorityOptions, {
        errorMap: () => ({ message: "Invalid priority" }),
      })
      .default("medium"),
  })
  .refine(
    (data) =>
      new Date(data.startDate).getTime() <= new Date(data.endDate).getTime(),
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type TaskCreateSchema = z.infer<typeof taskCreateSchema>;
