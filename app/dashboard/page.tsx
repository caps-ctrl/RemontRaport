import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { AppSidebar } from "@/app/app-sidebar";
import { deleteProjectAction } from "@/app/dashboard/projects/actions";
import { ProjectCreateDialog } from "@/app/dashboard/project-create-dialog";
import {
  getDashboardSummaryForUser,
  type DashboardStat,
  type DashboardSummary,
} from "@/lib/dashboard";
import { listProjectsForUser, type Project } from "@/lib/projects";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Dashboard - RemontRaport",
  description: "Panel użytkownika RemontRaport.",
};

type DashboardPageProps = {
  searchParams: Promise<{
    projectError?: string | string[];
    projectMessage?: string | string[];
  }>;
};

type IconName =
  | "alert"
  | "camera"
  | "check"
  | "chevron"
  | "client"
  | "document"
  | "folder"
  | "gift"
  | "home"
  | "note"
  | "plus"
  | "settings"
  | "trend"
  | "user";

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function getDashboardUser() {
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

async function getDashboardProjects(userId: string): Promise<{
  error: string | null;
  projects: Project[];
}> {
  try {
    const supabase = await getSupabaseServerClient();
    const projects = await listProjectsForUser(supabase, userId);

    return { error: null, projects };
  } catch {
    return {
      error: "Nie udało się pobrać projektów.",
      projects: [],
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
    case "alert":
      return (
        <svg {...common}>
          <path d="m12 3 10 18H2Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M5 8h3l1.5-2h5L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13.5" r="3.2" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "client":
      return (
        <svg {...common}>
          <path d="M16 19a5 5 0 0 0-10 0" />
          <circle cx="11" cy="8" r="3" />
          <path d="M21 19a4 4 0 0 0-4-4" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7Z" />
          <path d="M14 3v5h5" />
          <path d="M9.5 12h5" />
          <path d="M9.5 16h5" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
          <path d="M4 10h16" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <path d="M4 11h16v10H4Z" />
          <path d="M12 11v10" />
          <path d="M3 7h18v4H3Z" />
          <path d="M12 7H8.8A2.3 2.3 0 1 1 12 3.8Z" />
          <path d="M12 7h3.2A2.3 2.3 0 1 0 12 3.8Z" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m4 11 8-7 8 7" />
          <path d="M6 10v10h12V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case "note":
      return (
        <svg {...common}>
          <path d="M6 4h12v16H6Z" />
          <path d="M9 8h6" />
          <path d="M9 12h4" />
          <path d="m14 20 4-4" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2 2 0 1 1-2.82 2.82l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.66V21a2 2 0 1 1-4 0v-.08A1.8 1.8 0 0 0 8.7 19.3a1.8 1.8 0 0 0-2 .36l-.06.06a2 2 0 1 1-2.82-2.82l.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.66-1.1H2.5a2 2 0 1 1 0-4h.08A1.8 1.8 0 0 0 4.2 8.7a1.8 1.8 0 0 0-.36-2l-.06-.06A2 2 0 1 1 6.6 3.8l.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 9.8 2.58V2.5a2 2 0 1 1 4 0v.08a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 2-.36l.06-.06a2 2 0 1 1 2.82 2.82l-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.66 1.1h.08a2 2 0 1 1 0 4h-.08A1.8 1.8 0 0 0 19.4 15Z" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="m4 16 5-5 4 4 7-8" />
          <path d="M15 7h5v5" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path d="M19 20a7 7 0 0 0-14 0" />
          <circle cx="12" cy="8" r="3.5" />
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
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <path
            d="M10 23v-8h4v8M18 23V11"
            stroke="#0f9f8f"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[25px] font-extrabold tracking-[-0.045em] text-slate-950">
        Remont<span className="text-blue-600">Raport</span>
      </span>
    </Link>
  );
}

function Sidebar() {
  return <AppSidebar activeItem="dashboard" />;
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
        <form action={logout}>
          <button className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600">
            Wyloguj
          </button>
        </form>
      </div>
    </header>
  );
}

async function getDashboardSummary(userId: string, projects: Project[]) {
  try {
    const supabase = await getSupabaseServerClient();
    const dashboard = await getDashboardSummaryForUser(
      supabase,
      userId,
      projects.map((project) => ({
        id: project.id,
        status: project.status,
      })),
    );

    return { dashboard, error: null };
  } catch {
    return {
      dashboard: {
        activeProjects: 0,
        completedProjects: 0,
        openIssues: 0,
        plannedProjects: 0,
        projectProgress: 0,
        stats: [
          {
            caption: "Nie udało się pobrać danych z Supabase",
            icon: "folder",
            label: "Liczba projektów",
            tone: "blue",
            value: 0,
          },
          {
            caption: "Nie udało się pobrać danych z Supabase",
            icon: "trend",
            label: "Liczba aktywnych projektów",
            tone: "teal",
            value: 0,
          },
          {
            caption: "Nie udało się pobrać danych z Supabase",
            icon: "alert",
            label: "Liczba otwartych usterek",
            tone: "orange",
            value: 0,
          },
        ],
        totalProjects: 0,
      } satisfies DashboardSummary,
      error: "Nie udało się pobrać statystyk pulpitu.",
    };
  }
}

function StatCard({ stat }: { stat: DashboardStat }) {
  const tone = {
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-teal-50 text-teal-600",
    orange: "bg-orange-50 text-orange-500",
  }[stat.tone];

  return (
    <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-6">
        <div
          className={`grid size-14 shrink-0 place-items-center rounded-[12px] ${tone}`}
        >
          <Icon name={stat.icon} className="size-8" />
        </div>
        <div>
          <p className="min-h-10 text-[15px] font-semibold leading-5 text-slate-600">
            {stat.label}
          </p>
          <p className="mt-4 text-[43px] font-extrabold leading-none tracking-[-0.05em] text-slate-950">
            {stat.value}
          </p>
        </div>
      </div>
      <p className="mt-5 text-[13px] font-semibold leading-5 text-slate-500">
        {stat.caption}
      </p>
    </article>
  );
}

function StatusBadge({ status, tone }: { status: string; tone: string }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
  }[tone];

  return (
    <span
      className={`rounded-[7px] px-3 py-2 text-[12px] font-extrabold ${styles}`}
    >
      {status}
    </span>
  );
}

function formatProjectTimestamp(value: string) {
  if (!value) {
    return "Dzisiaj, 09:15";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Dzisiaj, 09:15";
  }

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  if (isToday) {
    return `Dzisiaj, ${time}`;
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function projectStatusTone(status?: string | null) {
  if (status === "Zakończony" || status === "Zakończone") {
    return "green";
  }

  if (status === "Planowany" || status === "W trakcie") {
    return "blue";
  }

  return "orange";
}

function ProjectThumb({ project }: { project: Project }) {
  if (project.image_url) {
    return (
      <Image
        alt=""
        className="size-[72px] shrink-0 rounded-[10px] object-cover shadow-sm"
        height={72}
        src={project.image_url}
        width={72}
      />
    );
  }

  return (
    <div className="grid size-[72px] shrink-0 place-items-center rounded-[10px] bg-[linear-gradient(135deg,#d4c4b2_0_38%,#f5efe7_39_70%,#a98f72_71_100%)] shadow-sm">
      <Icon name="camera" className="size-7 text-white/85" />
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const status = project.status ?? "W trakcie";

  return (
    <article className="grid gap-4 border-b border-slate-100 py-4 last:border-0 md:grid-cols-[minmax(260px,1.8fr)_190px_150px_44px] md:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <ProjectThumb project={project} />
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-extrabold tracking-[-0.02em] text-slate-950">
            {project.name}
          </h3>
          <p className="mt-1 truncate text-[15px] font-semibold text-slate-500">
            {project.location || "Brak lokalizacji"}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[15px] font-extrabold text-slate-950">
          {formatProjectTimestamp(project.created_at)}
        </p>
        <p className="mt-1 text-[13px] font-semibold text-slate-500">
          klient: {project.client_name || "brak danych"}
        </p>
      </div>

      <div className="md:justify-self-start">
        <StatusBadge status={status} tone={projectStatusTone(status)} />
      </div>

      <details className="relative justify-self-start md:justify-self-end">
        <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-[8px] text-xl font-bold text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 [&::-webkit-details-marker]:hidden">
          ⋮
        </summary>
        <div className="absolute right-0 z-10 mt-2 w-40 rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
          <form action={deleteProjectAction}>
            <input name="id" type="hidden" defaultValue={project.id} />
            <button className="w-full rounded-[8px] px-3 py-2 text-left text-sm font-extrabold text-red-600 transition hover:bg-red-50">
              Usuń projekt
            </button>
          </form>
        </div>
      </details>
    </article>
  );
}

function ProjectsPanel({
  error,
  message,
  projects,
}: {
  error?: string;
  message?: string;
  projects: Project[];
}) {
  return (
    <section
      id="projects"
      className="scroll-mt-8 rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.055)]"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-slate-950">
            Projekty
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Bieżące realizacje, dane klienta i status prac.
          </p>
        </div>
        <span className="rounded-[8px] bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600">
          {projects.length} projektów
        </span>
      </div>

      {message ? (
        <div className="mt-5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
          {error}
        </div>
      ) : null}

      <ProjectCreateDialog className="mt-6" />

      <div className="mt-7 space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">
            Brak projektów. Dodaj pierwszy projekt powyżej.
          </div>
        ) : (
          <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white">
            <div className="hidden border-b border-slate-100 bg-slate-50/70 px-4 py-3 text-[12px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:grid md:grid-cols-[minmax(260px,1.8fr)_190px_150px_44px] md:items-center">
              <span>Projekt</span>
              <span>Data</span>
              <span>Status</span>
              <span className="text-right">Akcje</span>
            </div>
            <div className="max-h-[430px] overflow-y-auto px-4 pr-3">
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProgressCard({ dashboard }: { dashboard: DashboardSummary }) {
  return (
    <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-extrabold text-slate-950">
          Postęp projektów
        </h2>
        <button className="rounded-[7px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          Wszystkie
        </button>
      </div>
      <div className="mt-6 flex items-center gap-7">
        <div
          className="relative grid size-[118px] place-items-center rounded-full"
          style={{
            background: `conic-gradient(#0f5df4 0 ${dashboard.projectProgress}%, #e8edf5 ${dashboard.projectProgress}% 100%)`,
          }}
        >
          <div className="grid size-[84px] place-items-center rounded-full bg-white text-center">
            <span className="block text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
              {dashboard.projectProgress}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              średni postęp
            </span>
          </div>
        </div>
        <div className="space-y-3 text-sm font-semibold">
          {[
            ["Zakończone", dashboard.completedProjects, "bg-teal-500"],
            ["W trakcie", dashboard.activeProjects, "bg-blue-600"],
            ["Planowane", dashboard.plannedProjects, "bg-slate-300"],
          ].map(([label, value, dot]) => (
            <div key={label} className="flex items-center gap-3 text-slate-700">
              <span className={`size-2.5 rounded-full ${dot}`} />
              <span className="min-w-[110px]">{label}</span>
              <span className="font-extrabold text-slate-950">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600"
        >
          Zobacz raport postępów
          <Icon name="chevron" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const user = await getDashboardUser();

  if (!user) {
    redirect("/login");
  }

  const { error: projectsError, projects } = await getDashboardProjects(
    user.id,
  );
  const { dashboard, error: dashboardError } = await getDashboardSummary(
    user.id,
    projects,
  );

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
      <Sidebar />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <Topbar email={email} initials={initials} name={displayName} />

        <div className="mt-11 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-[34px] font-extrabold tracking-[-0.045em] text-slate-950">
              Witaj, {displayName}
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-slate-500">
              Oto podsumowanie Twoich projektów i najważniejsze aktualności.
            </p>
          </div>
          {dashboardError ? (
            <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
              {dashboardError}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/projects"
              className="inline-flex h-12 items-center justify-center gap-2 px-3 text-[15px] font-extrabold text-blue-600"
            >
              Zobacz wszystkie projekty
              <Icon name="chevron" className="size-5" />
            </Link>
            <ProjectCreateDialog
              className="sm:w-auto"
              triggerLabel="Nowy projekt"
              variant="hero"
            />
          </div>
        </div>

        <div className="mt-9 grid gap-6 xl:grid-cols-[1fr_315px]">
          <div className="space-y-7">
            <div className="grid gap-5 md:grid-cols-3">
              {dashboard.stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>
            <ProjectsPanel
              error={projectError}
              message={projectMessage}
              projects={projects}
            />
          </div>
          <aside className="space-y-5">
            <ProgressCard dashboard={dashboard} />
          </aside>
        </div>
      </section>
    </main>
  );
}
