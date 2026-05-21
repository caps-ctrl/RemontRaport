import "server-only";

import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>;

type DashboardProject = {
  id: string;
  status: string | null;
};

export type DashboardStat = {
  caption: string;
  icon: "alert" | "folder" | "trend";
  label: string;
  tone: "blue" | "orange" | "teal";
  value: number;
};

export type DashboardSummary = {
  activeProjects: number;
  completedProjects: number;
  openIssues: number;
  plannedProjects: number;
  projectProgress: number;
  stats: DashboardStat[];
  totalProjects: number;
};

export class DashboardError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DashboardError";
    this.status = status;
  }
}

function isCompletedProject(status?: string | null) {
  return status === "Zakończony" || status === "Zakończone";
}

function isActiveProject(status?: string | null) {
  return status === "W trakcie";
}

function isPlannedProject(status?: string | null) {
  return status === "Planowany";
}

function makeDashboardSummary(
  projects: DashboardProject[],
  openIssues: number,
): DashboardSummary {
  const totalProjects = projects.length;
  const activeProjects = projects.filter((project) =>
    isActiveProject(project.status),
  ).length;
  const completedProjects = projects.filter((project) =>
    isCompletedProject(project.status),
  ).length;
  const plannedProjects = projects.filter((project) =>
    isPlannedProject(project.status),
  ).length;
  const pausedProjects = projects.filter(
    (project) => project.status === "Wstrzymany",
  ).length;
  const projectProgress =
    totalProjects === 0
      ? 0
      : Math.round(
          ((completedProjects * 100 + activeProjects * 50 + pausedProjects * 25) /
            totalProjects),
        );

  return {
    activeProjects,
    completedProjects,
    openIssues,
    plannedProjects,
    projectProgress,
    stats: [
      {
        caption: "Wszystkie projekty przypisane do konta",
        icon: "folder",
        label: "Liczba projektów",
        tone: "blue",
        value: totalProjects,
      },
      {
        caption: "Projekty ze statusem W trakcie",
        icon: "trend",
        label: "Liczba aktywnych projektów",
        tone: "teal",
        value: activeProjects,
      },
      {
        caption: "Usterki bez statusu Naprawiona",
        icon: "alert",
        label: "Liczba otwartych usterek",
        tone: "orange",
        value: openIssues,
      },
    ],
    totalProjects,
  };
}

async function getAuthenticatedDashboardContext(): Promise<{
  supabase: SupabaseServerClient;
  user: User;
}> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new DashboardError("Brak autoryzacji.", 401);
  }

  return { supabase, user };
}

async function listDashboardProjects(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<DashboardProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id,status")
    .eq("user_id", userId);

  if (error) {
    throw new DashboardError("Nie udało się pobrać statystyk projektów.", 500);
  }

  return (data ?? []).map((project) => ({
    id: String(project.id),
    status: typeof project.status === "string" ? project.status : null,
  }));
}

async function countOpenIssues(
  supabase: SupabaseServerClient,
  projectIds: string[],
) {
  if (projectIds.length === 0) {
    return 0;
  }

  const { count, error } = await supabase
    .from("project_issues")
    .select("id", { count: "exact", head: true })
    .in("project_id", projectIds)
    .in("status", ["Nie naprawiona", "W trakcie naprawy"]);

  if (error) {
    throw new DashboardError("Nie udało się pobrać statystyk usterek.", 500);
  }

  return count ?? 0;
}

export async function getDashboardSummaryForUser(
  supabase: SupabaseServerClient,
  userId: string,
  projects?: DashboardProject[],
) {
  const dashboardProjects =
    projects ?? (await listDashboardProjects(supabase, userId));
  const openIssues = await countOpenIssues(
    supabase,
    dashboardProjects.map((project) => project.id),
  );

  return makeDashboardSummary(dashboardProjects, openIssues);
}

export async function getCurrentUserDashboardSummary() {
  const { supabase, user } = await getAuthenticatedDashboardContext();

  return getDashboardSummaryForUser(supabase, user.id);
}
