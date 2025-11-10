import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { TasksOverview } from "@/features/tasks/components/tasks-overview";

const {
  useTasksQueryMock,
  useCreateTaskMutationMock,
  useDeleteTaskMutationMock,
  useProjectOptionsQueryMock,
} = vi.hoisted(() => ({
  useTasksQueryMock: vi.fn(),
  useCreateTaskMutationMock: vi.fn(),
  useDeleteTaskMutationMock: vi.fn(),
  useProjectOptionsQueryMock: vi.fn(),
}));

vi.mock("@/features/tasks/queries/use-tasks-query", () => ({
  useTasksQuery: useTasksQueryMock,
}));

vi.mock("@/features/tasks/mutations/use-create-task-mutation", () => ({
  useCreateTaskMutation: useCreateTaskMutationMock,
}));

vi.mock("@/features/tasks/mutations/use-delete-task-mutation", () => ({
  useDeleteTaskMutation: useDeleteTaskMutationMock,
}));

vi.mock("@/features/projects/queries/use-project-options-query", () => ({
  useProjectOptionsQuery: useProjectOptionsQueryMock,
}));

describe("TasksOverview", () => {
  beforeAll(() => {
    vi.stubGlobal(
      "IntersectionObserver",
      class implements IntersectionObserver {
        readonly root = null;
        readonly rootMargin = "0px";
        readonly thresholds = [];
        constructor(private readonly callback: IntersectionObserverCallback) {}
        observe(target: Element) {
          this.callback([{ isIntersecting: false, target } as IntersectionObserverEntry], this);
        }
        disconnect() {}
        unobserve() {}
        takeRecords(): IntersectionObserverEntry[] {
          return [];
        }
      },
    );

    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = () => false;
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = () => {};
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
  });

  beforeEach(() => {
    useTasksQueryMock.mockReset();
    useCreateTaskMutationMock.mockReset();
    useDeleteTaskMutationMock.mockReset();
    useProjectOptionsQueryMock.mockReset();

    useCreateTaskMutationMock.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    useDeleteTaskMutationMock.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    useProjectOptionsQueryMock.mockReturnValue({
      data: {
        data: [
          {
            id: "project-123",
            name: "Project 123",
          },
        ],
        meta: {
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            perPage: 10,
          },
        },
      },
      isLoading: false,
      isError: false,
    });
  });

  it("renders shimmer skeleton while loading", () => {
    useTasksQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: true,
    });

    render(<TasksOverview />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("shows error state with retry", async () => {
    const refetch = vi.fn();
    useTasksQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
    });

    render(<TasksOverview />);

    expect(
      screen.getByText(/unable to load tasks right now/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders task cards when data is available", () => {
    useTasksQueryMock.mockReturnValue({
      data: {
        pages: [
          {
            data: [
              {
                id: "1",
                name: "Task Alpha",
                description: "Important task",
                status: "todo",
                priority: "high",
                startDate: "2025-01-01T00:00:00.000Z",
                endDate: "2025-01-05T00:00:00.000Z",
                projectId: "p1",
                assigneeId: "u1",
                createdById: "u1",
                createdAt: "2025-01-01T00:00:00.000Z",
                updatedAt: "2025-01-01T00:00:00.000Z",
                assignee: { id: "u1", name: "Fachri", email: "fachri@mail.com" },
                createdBy: { id: "u1", name: "Fachri", email: "fachri@mail.com" },
                project: { id: "p1", name: "Project 1" },
                isOverdue: true,
                overdueDays: 2,
              },
            ],
            meta: {
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 1,
                perPage: 10,
              },
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
    });

    render(<TasksOverview />);

    expect(screen.getByText(/task alpha/i)).toBeInTheDocument();
    expect(screen.getByText(/project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/overdue by 2 days/i)).toBeVisible();
  });

  it("submits create task form", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreateTaskMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    useProjectOptionsQueryMock.mockReturnValue({
      data: {
        data: [
          { id: "project-123", name: "Project 123" },
          { id: "project-456", name: "Project 456" },
        ],
        meta: {
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 2,
            perPage: 10,
          },
        },
      },
      isLoading: false,
      isError: false,
    });

    useTasksQueryMock.mockReturnValue({
      data: {
        pages: [
          {
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
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
    });

    render(<TasksOverview />);

    await userEvent.click(screen.getByRole("button", { name: /add task/i }));

    const projectTrigger = screen.getByLabelText(/project/i);
    await userEvent.click(projectTrigger);
    await userEvent.click(screen.getByRole("option", { name: /project 456/i }));

    await userEvent.type(
      screen.getByLabelText(/task name/i),
      "New task",
    );
    await userEvent.type(
      screen.getByLabelText(/description/i),
      "Task description",
    );
    await userEvent.type(
      screen.getByLabelText(/start date/i),
      "2025-01-01T09:00",
    );
    await userEvent.type(
      screen.getByLabelText(/end date/i),
      "2025-01-02T09:00",
    );

    const statusTrigger = screen.getByLabelText(/^status$/i);
    await userEvent.click(statusTrigger);
    await userEvent.click(screen.getByRole("option", { name: /to do/i }));

    const priorityTrigger = screen.getByLabelText(/priority/i);
    await userEvent.click(priorityTrigger);
    await userEvent.click(screen.getByRole("option", { name: /high/i }));

    await userEvent.click(
      screen.getByRole("button", { name: /create task/i }),
    );

    expect(mutateAsync).toHaveBeenCalledWith({
      projectId: "project-456",
      name: "New task",
      description: "Task description",
      startDate: "2025-01-01T09:00",
      endDate: "2025-01-02T09:00",
      status: "todo",
      priority: "high",
    });
  });

  it("deletes a task when requested", async () => {
    const deleteMutateAsync = vi.fn().mockResolvedValue({});
    useDeleteTaskMutationMock.mockReturnValue({
      mutateAsync: deleteMutateAsync,
      isPending: false,
    });

    useTasksQueryMock.mockReturnValue({
      data: {
        pages: [
          {
            data: [
              {
                id: "task-1",
                name: "Task Alpha",
                description: "Important task",
                status: "todo",
                priority: "high",
                startDate: "2025-01-01T00:00:00.000Z",
                endDate: "2025-01-05T00:00:00.000Z",
                projectId: "p1",
                assigneeId: "u1",
                createdById: "u1",
                createdAt: "2025-01-01T00:00:00.000Z",
                updatedAt: "2025-01-01T00:00:00.000Z",
                assignee: { id: "u1", name: "Fachri", email: "fachri@mail.com" },
                createdBy: { id: "u1", name: "Fachri", email: "fachri@mail.com" },
                project: { id: "p1", name: "Project 1" },
                isOverdue: false,
                overdueDays: 0,
              },
            ],
            meta: {
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 1,
                perPage: 10,
              },
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
    });

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TasksOverview />);

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith("task-1");
    });

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
