"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useProjectOptionsQuery } from "@/features/projects/queries/use-project-options-query";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateTaskMutation } from "../mutations/use-create-task-mutation";
import { useDeleteTaskMutation } from "../mutations/use-delete-task-mutation";
import { useTasksQuery } from "../queries/use-tasks-query";
import {
  taskCreateSchema,
  type TaskCreateSchema,
} from "../schemas/task-create-schema";
import type { Task, TaskPriority, TaskStatus } from "../types/task-types";

const skeletonItems = Array.from({ length: 4 });

const statusFilters: Array<{ label: string; value: TaskStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "To do", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

const priorityFilters: Array<{ label: string; value: TaskPriority | "all" }> = [
  { label: "All priorities", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

function TaskSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </Card>
  );
}

function TaskCard({
  task,
  onDelete,
  isDeleting,
}: {
  task: Task;
  onDelete: () => void | Promise<void>;
  isDeleting: boolean;
}) {
  const startDate = format(new Date(task.startDate), "PPP");
  const endDate = format(new Date(task.endDate), "PPP");

  return (
    <Card className="transition hover:border-primary/40 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{task.name}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2">
            {task.description}
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary"
          >
            {task.status}
          </Badge>
          <Badge variant="secondary">{task.priority} priority</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Project</dt>
            <dd className="mt-1">{task.project.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Timeline</dt>
            <dd className="mt-1">{`${startDate} to ${endDate}`}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Assignee</dt>
            <dd className="mt-1">{task.assignee.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Status</dt>
            <dd className="mt-1">
              {task.isOverdue ? (
                <Badge variant="destructive">
                  Overdue by {task.overdueDays} days
                </Badge>
              ) : (
                "On track"
              )}
            </dd>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TasksOverview() {
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [taskBeingDeleted, setTaskBeingDeleted] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useTasksQuery({
    status,
    priority,
    name: debouncedSearch,
  });

  const {
    data: projectOptionsData,
    isLoading: isProjectOptionsLoading,
    isError: isProjectOptionsError,
  } = useProjectOptionsQuery();

  const projectOptions = useMemo(
    () => projectOptionsData?.data ?? [],
    [projectOptionsData],
  );

  const tasks = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const createTaskMutation = useCreateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  const form = useForm<TaskCreateSchema>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      projectId: "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "todo",
      priority: "medium",
    },
  });

  useEffect(() => {
    if (!projectOptions.length) {
      return;
    }

    const currentProjectId = form.getValues("projectId");

    if (!currentProjectId) {
      form.setValue("projectId", projectOptions[0].id);
    }
  }, [form, projectOptions]);

  const isCreateDisabled =
    createTaskMutation.isPending ||
    isProjectOptionsLoading ||
    projectOptions.length === 0;

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setTaskBeingDeleted(taskId);

    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (error) {
      if (error instanceof Error) {
        setDeleteError(error.message);
      } else {
        setDeleteError("Unable to delete task. Please try again.");
      }
    } finally {
      setTaskBeingDeleted(null);
    }
  };

  const onSubmit = async (values: TaskCreateSchema) => {
    setFormError(null);
    try {
      await createTaskMutation.mutateAsync(values);
      form.reset({
        projectId: "",
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "todo",
        priority: "medium",
      });
      setIsDialogOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
        return;
      }
      setFormError("Unable to create task. Please try again.");
    }
  };

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const isInitialLoading = isLoading || (tasks.length === 0 && isFetching);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/80 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Input
              className="w-full sm:max-w-xs"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search tasks..."
              type="search"
              value={searchTerm}
            />

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((option) => {
                const isActive = option.value === status;
                return (
                  <Button
                    key={option.value}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setStatus(option.value)}
                    type="button"
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button">Add task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new task</DialogTitle>
                <DialogDescription>
                  Provide the details below to create a task for your project.
                </DialogDescription>
              </DialogHeader>

              {isProjectOptionsError ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  Unable to load projects right now. Please try again later.
                </div>
              ) : (
                <Form {...form}>
                  <form
                    className="grid gap-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="projectId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={
                                isProjectOptionsLoading ||
                                !projectOptions.length
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isProjectOptionsLoading
                                        ? "Loading projects..."
                                        : "Select project"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {projectOptions.map((project) => (
                                  <SelectItem
                                    key={project.id}
                                    value={project.id}
                                  >
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task name</FormLabel>
                            <FormControl>
                              <Input placeholder="Task name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the task..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start date</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End date</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="todo">To do</SelectItem>
                                <SelectItem value="in_progress">
                                  In progress
                                </SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">
                                  Critical
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {formError ? (
                      <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {formError}
                      </div>
                    ) : null}

                    {!projectOptions.length && !isProjectOptionsLoading ? (
                      <p className="text-sm text-muted-foreground">
                        No projects available yet. Create a project to assign
                        this task.
                      </p>
                    ) : null}

                    <DialogFooter>
                      <Button disabled={isCreateDisabled} type="submit">
                        {createTaskMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating task...
                          </span>
                        ) : (
                          "Create task"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-2">
          {priorityFilters.map((option) => {
            const isActive = option.value === priority;
            return (
              <Button
                key={option.value}
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => setPriority(option.value)}
                type="button"
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {deleteError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {deleteError}
        </div>
      ) : null}

      {isInitialLoading ? (
        <div aria-busy="true" className="grid gap-4" role="status">
          {skeletonItems.map((_, index) => (
            <TaskSkeleton key={`task-skeleton-${index}`} />
          ))}
        </div>
      ) : isError ? (
        <Card className="flex flex-col items-center justify-center gap-3 border-destructive/20 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">
            Unable to load tasks right now.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              void refetch();
            }}
            type="button"
          >
            Try again
          </Button>
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 border-dashed border-border/70 bg-card/60 p-6 text-center">
          <p className="text-base font-semibold text-foreground">
            No tasks match your filters
          </p>
          <p className="text-sm text-muted-foreground">
            Adjust your filters or create a new task to see it here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={() => {
                void handleDeleteTask(task.id);
              }}
              isDeleting={
                taskBeingDeleted === task.id && deleteTaskMutation.isPending
              }
            />
          ))}
          <div ref={loadMoreRef} />
          {isFetchingNextPage ? (
            <div className="grid gap-4">
              {skeletonItems.map((_, index) => (
                <TaskSkeleton key={`task-skeleton-loading-${index}`} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
