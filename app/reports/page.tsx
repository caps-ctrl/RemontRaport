import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/app/app-sidebar";
import { ProjectSelector } from "@/app/reports/project-selector";
import { PrintReportButton } from "@/app/reports/report-actions";
import { ReportBuilder } from "@/app/reports/report-builder";
import { Icon } from "@/components/ui/Icon";
import { Topbar } from "@/components/ui/TopBar";
import { IssueError, listProjectIssues, type ProjectIssue } from "@/lib/issues";
import {
  getProjectForUser,
  listProjectsForUser,
  ProjectError,
  type Project,
} from "@/lib/projects";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Raporty - RemontRaport",
  description: "Generowanie raportów projektowych RemontRaport.",
};

type ReportsPageProps = {
  searchParams: Promise<{
    projectId?: string | string[];
  }>;
};

type ReportData = {
  error: string | null;
  issues: ProjectIssue[];
  project: Project | null;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function getReportsUser() {
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

async function getProjects(userId: string) {
  try {
    const supabase = await getSupabaseServerClient();

    return {
      error: null,
      projects: await listProjectsForUser(supabase, userId),
    };
  } catch {
    return {
      error: "Nie udało się pobrać projektów.",
      projects: [] as Project[],
    };
  }
}

async function getReportData(
  projectId: string | undefined,
  userId: string,
): Promise<ReportData> {
  if (!projectId) {
    return { error: null, issues: [], project: null };
  }

  try {
    const supabase = await getSupabaseServerClient();
    const [project, issues] = await Promise.all([
      getProjectForUser(supabase, projectId, userId),
      listProjectIssues(projectId),
    ]);

    return { error: null, issues, project };
  } catch (error) {
    if (
      (error instanceof ProjectError || error instanceof IssueError) &&
      error.status === 404
    ) {
      return {
        error: "Nie znaleziono projektu albo nie masz do niego dostępu.",
        issues: [],
        project: null,
      };
    }

    return {
      error: "Nie udało się wygenerować raportu dla tego projektu.",
      issues: [],
      project: null,
    };
  }
}

function EmptyReportState() {
  return (
    <section className="mt-7 rounded-[12px] border border-dashed border-slate-200 bg-white px-4 py-16 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-[12px] bg-blue-50 text-blue-600">
        <Icon name="document" className="size-8" />
      </div>
      <h2 className="mt-5 text-[22px] font-extrabold text-slate-950">
        Wybierz projekt
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        Raport powstanie na podstawie danych projektu, listy usterek, statusów,
        priorytetów i zdjęć zapisanych w Supabase.
      </p>
      <Link
        className="mt-6 inline-flex h-11 items-center justify-center rounded-[8px] bg-blue-600 px-5 text-sm font-extrabold text-white"
        data-print-hide="true"
        href="/projects"
      >
        Przejdź do projektów
      </Link>
    </section>
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const user = await getReportsUser();

  if (!user) {
    redirect("/login");
  }

  const { error: projectsError, projects } = await getProjects(user.id);
  const selectedProjectId = firstParam(params.projectId) ?? projects[0]?.id;
  const report = await getReportData(selectedProjectId, user.id);
  const email = user.email ?? "uzytkownik@remontraport.pl";
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name
      ? user.user_metadata.full_name
      : (email.split("@")[0]?.split(".")[0] ?? "Alicja");
  const displayName = fullName.slice(0, 1).toUpperCase() + fullName.slice(1);
  const initials = displayName.slice(0, 1).toUpperCase();
  const error = projectsError ?? report.error;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppSidebar activeItem="reports" />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <div data-print-hide="true">
          <Topbar email={email} initials={initials} name={displayName} />
        </div>

        <div
          className="mt-11 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"
          data-print-hide="true"
        >
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
              <Icon name="document" className="size-5" />
              Raporty
            </p>
            <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.045em] text-slate-950">
              Generator raportów
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
              Wybierz projekt, a raport zbierze dane projektu, statusy usterek,
              priorytety i dokumentację zdjęciową.
            </p>
          </div>
          {report.project ? <PrintReportButton /> : null}
        </div>

        <div className="mt-7" data-print-hide="true">
          <ProjectSelector
            projects={projects}
            selectedProjectId={report.project?.id ?? selectedProjectId}
          />
        </div>

        {error ? (
          <div
            className="mt-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700"
            data-print-hide="true"
          >
            {error}
          </div>
        ) : null}

        {report.project ? (
          <ReportBuilder
            key={report.project.id}
            issues={report.issues}
            project={report.project}
          />
        ) : (
          <EmptyReportState />
        )}
      </section>
    </main>
  );
}
