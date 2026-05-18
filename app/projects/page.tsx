import type { Metadata } from "next";
import Link from "next/link";
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

type IconName = "bell" | "camera" | "chevron" | "folder" | "plus";

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

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M5 8h3l1.5-2h5L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13.5" r="3.2" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
          <path d="M4 10h16" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
  }
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="RemontRaport"
    >
      <span className="grid size-8 place-items-center text-blue-600">
        <svg viewBox="0 0 28 28" className="size-7" fill="none" aria-hidden>
          <path
            d="m5 12 9-8 9 8v11H5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.3"
          />
          <path
            d="M10 23v-8h4v8M18 23V11"
            stroke="#0f9f8f"
            strokeLinejoin="round"
            strokeWidth="2.3"
          />
        </svg>
      </span>
      <span className="text-[25px] font-extrabold tracking-[-0.045em] text-slate-950">
        Remont<span className="text-blue-600">Raport</span>
      </span>
    </Link>
  );
}

function Topbar({
  email,
  initials,
  name,
}: {
  email: string;
  initials: string;
  name: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Logo />
      <div className="flex items-center gap-5">
        <button
          className="relative hidden text-slate-600 transition hover:text-blue-600 sm:block"
          aria-label="Powiadomienia"
        >
          <Icon name="bell" className="size-7" />
          <span className="absolute -right-1 -top-2 grid size-5 place-items-center rounded-full bg-blue-600 text-[11px] font-extrabold text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700 ring-4 ring-slate-100">
            {initials}
          </span>
          <div className="hidden md:block">
            <p className="text-[15px] font-extrabold text-slate-950">{name}</p>
            <p className="max-w-[190px] truncate text-sm text-slate-500">
              {email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
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
