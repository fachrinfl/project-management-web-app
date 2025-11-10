export type TaskStatus =
  | "todo"
  | "in_progress"
  | "in-progress"
  | "in_review"
  | "done"
  | "completed";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskMember = {
  id: string;
  name: string;
  email: string;
};

export type TaskProject = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee: TaskMember;
  createdBy: TaskMember;
  project: TaskProject;
  isOverdue: boolean;
  overdueDays: number;
};

export type TaskPaginationMeta = {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  };
};

export type GetTasksResponse = {
  data: Task[];
  meta: TaskPaginationMeta;
};

export type GetTasksParams = {
  name?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  page?: number;
  perPage?: number;
};

export type CreateTaskPayload = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
};

