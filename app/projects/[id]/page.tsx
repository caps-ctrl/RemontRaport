import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectPageView } from "@/components/ProjectPage/ProjectPageUi";
import { IssueError, listProjectIssues, type ProjectIssue } from "@/lib/issues";
import { getProjectForUser, ProjectError } from "@/lib/projects";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Projekt - RemontRaport",
  description: "Szczegóły projektu RemontRaport.",
};

type ProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    projectError?: string | string[];
    projectMessage?: string | string[];
  }>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function getProjectUser() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

async function getProject(projectId: string, userId: string) {
  try {
    const supabase = await getSupabaseServerClient();

    return await getProjectForUser(supabase, projectId, userId);
  } catch (error) {
    if (error instanceof ProjectError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

async function getProjectIssues(projectId: string) {
  try {
    const issues = await listProjectIssues(projectId);

    return { error: null, issues };
  } catch (error) {
    if (error instanceof IssueError && error.status === 404) {
      notFound();
    }

    return {
      error: "Nie udało się pobrać usterek.",
      issues: [] as ProjectIssue[],
    };
  }
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const [{ id }, queryParams] = await Promise.all([params, searchParams]);
  const user = await getProjectUser();

  if (!user) {
    redirect("/login");
  }

  const [project, issuesResult] = await Promise.all([
    getProject(id, user.id),
    getProjectIssues(id),
  ]);
  const email = user.email ?? "uzytkownik@remontraport.pl";
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name
      ? user.user_metadata.full_name
      : (email.split("@")[0]?.split(".")[0] ?? "Alicja");
  const displayName = fullName.slice(0, 1).toUpperCase() + fullName.slice(1);
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <ProjectPageView
      currentPath={`/projects/${project.id}`}
      displayName={displayName}
      email={email}
      initials={initials}
      issuesResult={issuesResult}
      project={project}
      projectError={firstParam(queryParams.projectError)}
      projectMessage={firstParam(queryParams.projectMessage)}
    />
  );
}
