"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useProfileQuery } from "@/features/auth/queries/use-profile-query";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { ProjectsOverview } from "@/features/projects/components/projects-overview";
import { TasksOverview } from "@/features/tasks/components/tasks-overview";
import { getAuthTokenFromCookie } from "@/shared/utils/auth-token";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function HomeShell() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated?.() ?? false,
  );
  const [activeTab, setActiveTab] = useState<"projects" | "tasks">("projects");

  const { data, isLoading } = useProfileQuery();

  useEffect(() => {
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
      setIsHydrated(true);
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!accessToken) {
      const cookieToken = getAuthTokenFromCookie();

      if (!cookieToken) {
        router.replace("/login");
      }
    }
  }, [accessToken, isHydrated, router]);

  if (!isHydrated) {
    return null;
  }

  const cookieToken = getAuthTokenFromCookie();

  if (!accessToken && !cookieToken) {
    return null;
  }

  const profile = data?.user ?? user;
  const displayName = profile?.name ?? "Welcome back!";
  const displayEmail = profile?.email ?? "";

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Tabs
        className="flex flex-1 flex-col"
        onValueChange={(value) => setActiveTab(value as "projects" | "tasks")}
        value={activeTab}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <TabsList className="flex items-center gap-2 rounded-full bg-muted/40 p-1">
            <TabsTrigger className="px-4 py-2" value="projects">
              Projects
            </TabsTrigger>
            <TabsTrigger className="px-4 py-2" value="tasks">
              Tasks
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
              {profile?.name?.charAt(0) ?? profile?.email?.charAt(0) ?? "U"}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {isLoading ? "Loading..." : displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "" : displayEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center px-6 py-10">
          <TabsContent className="flex w-full justify-center" value="projects">
            <ProjectsOverview />
          </TabsContent>
          <TabsContent className="flex w-full justify-center" value="tasks">
            <TasksOverview />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
