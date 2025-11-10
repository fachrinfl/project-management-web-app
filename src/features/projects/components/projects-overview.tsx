"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useProjectsQuery } from "../queries/use-projects-query";
import type { Project, ProjectStatus } from "../types/project-types";

const skeletonItems = Array.from({ length: 3 });

const statusFilters: Array<{ label: string; value: ProjectStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
];

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

function ProjectSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-72" />
        <div className="flex flex-wrap gap-2 pt-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
    </Card>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const startDate = format(new Date(project.startDate), "PPP");
  const endDate = format(new Date(project.endDate), "PPP");

  return (
    <Card className="transition hover:border-primary/40 hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2">
            {project.description}
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary"
        >
          {project.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <dt className="font-medium text-foreground">Timeline</dt>
            <dd className="mt-1">{`${startDate} to ${endDate}`}</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">Owner</dt>
            <dd className="mt-1">{project.createdBy.name}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {project.teams.slice(0, 5).map((member) => (
            <Badge key={member.id} variant="secondary">
              {member.name}
            </Badge>
          ))}
          {project.teams.length > 5 ? (
            <Badge variant="secondary">+{project.teams.length - 5} more</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectsOverview() {
  const [status, setStatus] = useState<ProjectStatus | "all">("active");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useProjectsQuery({
    status,
    name: debouncedSearch,
  });

  const projects = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

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

  const isInitialLoading = isLoading || (projects.length === 0 && isFetching);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            className="w-full sm:max-w-xs"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects..."
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
      </Card>

      {isInitialLoading ? (
        <div aria-busy="true" className="grid gap-4" role="status">
          {skeletonItems.map((_, index) => (
            <ProjectSkeleton key={`project-skeleton-${index}`} />
          ))}
        </div>
      ) : isError ? (
        <Card className="flex flex-col items-center justify-center gap-3 border-destructive/20 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">
            Unable to load projects right now.
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
      ) : projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 border-dashed border-border/70 bg-card/60 p-6 text-center">
          <p className="text-base font-semibold text-foreground">
            No projects match your filters
          </p>
          <p className="text-sm text-muted-foreground">
            Adjust your filters or create a new project to see it here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          <div ref={loadMoreRef} />
          {isFetchingNextPage ? (
            <div className="mt-2 grid gap-4">
              {skeletonItems.map((_, index) => (
                <ProjectSkeleton key={`project-skeleton-loading-${index}`} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
