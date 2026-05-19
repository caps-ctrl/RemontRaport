import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { Topbar } from "@/components/ui/TopBar";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/app/app-sidebar";
import { ProjectCreateDialog } from "@/app/dashboard/project-create-dialog";
import { ProjectsGrid } from "@/app/projects/projects-grid";
import { listProjectsForUser, type Project } from "@/lib/projects";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Projekty - RemontRaport",
  description: "Lista projektów RemontRaport.",
};

type ProjectsPageProps = {
  searchParams: Promise<{
    projectError?: string | string[];
    projectMessage?: string | string[];
  }>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function getProjectsUser() {
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
    const projects = await listProjectsForUser(supabase, userId);

    return { error: null, projects };
  } catch {
    return {
      error: "Nie udało się pobrać projektów.",
      projects: [] as Project[],
    };
  }
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;
  const user = await getProjectsUser();

  if (!user) {
    redirect("/login");
  }

  const { error: projectsError, projects } = await getProjects(user.id);
  const email = user.email ?? "uzytkownik@remontraport.pl";
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name
      ? user.user_metadata.full_name
      : (email.split("@")[0]?.split(".")[0] ?? "Alicja");
  const displayName = fullName.slice(0, 1).toUpperCase() + fullName.slice(1);
  const initials = displayName.slice(0, 1).toUpperCase();
  const projectError =
    firstParam(params.projectError) ?? projectsError ?? undefined;
  const projectMessage = firstParam(params.projectMessage);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppSidebar activeItem="projects" />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <Topbar email={email} initials={initials} name={displayName} />

        <div className="mt-11 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
              <Icon name="folder" className="size-5" />
              Projekty
            </p>
            <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.045em] text-slate-950">
              Wszystkie projekty
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
              Zarządzaj realizacjami, zdjęciami, klientami i statusami prac w
              jednym miejscu.
            </p>
          </div>
          <ProjectCreateDialog
            className="sm:w-auto"
            redirectTo="/projects"
            triggerLabel="Nowy projekt"
            variant="hero"
          />
        </div>

        <div
          className="mt-8 rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.055)]"
          id="projects"
        >
          {projectMessage ? (
            <div className="mt-5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800">
              {projectMessage}
            </div>
          ) : null}
          {projectError ? (
            <div className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
              {projectError}
            </div>
          ) : null}

          <div className="mt-5">
            <ProjectsGrid projects={projects} />
          </div>
        </div>
      </section>
    </main>
  );
}
