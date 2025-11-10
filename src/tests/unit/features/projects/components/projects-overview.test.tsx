import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectsOverview } from "@/features/projects/components/projects-overview";

const { useProjectsQueryMock } = vi.hoisted(() => ({
  useProjectsQueryMock: vi.fn(),
}));

vi.mock("@/features/projects/queries/use-projects-query", () => ({
  useProjectsQuery: useProjectsQueryMock,
}));

describe("ProjectsOverview", () => {
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
  });

  beforeEach(() => {
    useProjectsQueryMock.mockReset();
  });

  it("renders shimmer skeleton while loading", () => {
    useProjectsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: true,
    });

    render(<ProjectsOverview />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("shows error state with retry button", async () => {
    const refetch = vi.fn();
    useProjectsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetching: false,
    });

    render(<ProjectsOverview />);

    expect(
      screen.getByText(/unable to load projects right now/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders project cards when data is available", () => {
    useProjectsQueryMock.mockReturnValue({
      data: {
        pages: [
          {
            data: [
              {
                id: "1",
                name: "Project Alpha",
                description: "Important project",
                status: "active",
                startDate: "2025-01-01T00:00:00.000Z",
                endDate: "2025-02-01T00:00:00.000Z",
                createdBy: { id: "u1", name: "Fachri", email: "fachri@mail.com" },
                createdById: "u1",
                createdAt: "2025-01-01T00:00:00.000Z",
                updatedAt: "2025-01-01T00:00:00.000Z",
                userId: null,
                documents: [],
                teams: [
                  { id: "t1", name: "Team member", email: "team@mail.com" },
                ],
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

    render(<ProjectsOverview />);

    expect(screen.getByText(/project alpha/i)).toBeInTheDocument();
    expect(screen.getByText(/important project/i)).toBeInTheDocument();
    expect(screen.getByText(/fachri/i)).toBeVisible();
  });
});

