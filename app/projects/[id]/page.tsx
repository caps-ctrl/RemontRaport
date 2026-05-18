import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebar } from "@/app/app-sidebar";
import {
  deleteProjectAction,
  updateProjectAction,
} from "@/app/dashboard/projects/actions";
import { getProjectForUser, ProjectError, type Project } from "@/lib/projects";
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

type IconName =
  | "alert"
  | "bell"
  | "camera"
  | "chevron"
  | "document"
  | "folder"
  | "note"
  | "save"
  | "trash"
  | "upload";

const projectStatuses = ["W trakcie", "Planowany", "Zakończony", "Wstrzymany"];

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
    case "note":
      return (
        <svg {...common}>
          <path d="M6 4h12v16H6Z" />
          <path d="M9 8h6" />
          <path d="M9 12h4" />
          <path d="m14 20 4-4" />
        </svg>
      );
    case "save":
      return (
        <svg {...common}>
          <path d="M5 4h12l2 2v14H5Z" />
          <path d="M8 4v6h8V4" />
          <path d="M8 20v-6h8v6" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
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

function Input({
  defaultValue,
  label,
  name,
  required,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-[13px] font-extrabold text-slate-700">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function ProjectImage({ project }: { project: Project }) {
  if (project.image_url) {
    return (
      <Image
        alt=""
        className="h-full w-full object-cover"
        height={520}
        priority
        src={project.image_url}
        width={900}
      />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#d4c4b2_0_38%,#f5efe7_39_70%,#a98f72_71_100%)]">
      <Icon name="camera" className="size-14 text-white/85" />
    </div>
  );
}

function ControlCard({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: IconName;
  title: string;
}) {
  return (
    <section className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.045)]">
      <h2 className="flex items-center gap-3 text-[18px] font-extrabold text-slate-950">
        <Icon name={icon} className="size-5 text-blue-600" />
        {title}
      </h2>
      {children}
    </section>
  );
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

  const project = await getProject(id, user.id);
  const email = user.email ?? "uzytkownik@remontraport.pl";
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name
      ? user.user_metadata.full_name
      : (email.split("@")[0]?.split(".")[0] ?? "Alicja");
  const displayName = fullName.slice(0, 1).toUpperCase() + fullName.slice(1);
  const initials = displayName.slice(0, 1).toUpperCase();
  const projectError = firstParam(queryParams.projectError);
  const projectMessage = firstParam(queryParams.projectMessage);
  const currentPath = `/projects/${project.id}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppSidebar activeItem="projects" />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <Topbar email={email} initials={initials} name={displayName} />

        <div className="mt-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600"
            href="/projects"
          >
            <Icon name="chevron" className="size-4 rotate-180" />
            Wróć do projektów
          </Link>
          <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
                <Icon name="folder" className="size-5" />
                Projekt
              </p>
              <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.045em] text-slate-950">
                {project.name}
              </h1>
              <p className="mt-2 text-[15px] leading-6 text-slate-500">
                {project.location || "Brak lokalizacji"} · klient:{" "}
                {project.client_name || "brak danych"}
              </p>
            </div>
            <span className="w-fit rounded-[8px] bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-600">
              {project.status ?? "W trakcie"}
            </span>
          </div>
        </div>

        {projectMessage ? (
          <div className="mt-6 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800">
            {projectMessage}
          </div>
        ) : null}
        {projectError ? (
          <div className="mt-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
            {projectError}
          </div>
        ) : null}

        <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
            <div className="h-[360px]">
              <ProjectImage project={project} />
            </div>
            <div className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-3">
              {[
                ["Status", project.status ?? "W trakcie"],
                ["Start", project.start_date ?? "Nie ustawiono"],
                ["Utworzono", new Date(project.created_at).toLocaleDateString("pl-PL")],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[10px] bg-slate-50 p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <ControlCard icon="save" title="Kontrola projektu">
            <form
              action={updateProjectAction}
              className="mt-5 grid gap-4 md:grid-cols-2"
            >
              <input name="id" type="hidden" defaultValue={project.id} />
              <input name="redirect_to" type="hidden" defaultValue={currentPath} />
              <Input
                defaultValue={project.name}
                label="Nazwa projektu"
                name="name"
                required
              />
              <Input
                defaultValue={project.client_name ?? ""}
                label="Klient"
                name="client_name"
              />
              <Input
                defaultValue={project.location ?? ""}
                label="Lokalizacja"
                name="location"
              />
              <label className="block text-[13px] font-extrabold text-slate-700">
                Status
                <select
                  className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  defaultValue={project.status ?? "W trakcie"}
                  name="status"
                >
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                defaultValue={project.start_date ?? ""}
                label="Data startu"
                name="start_date"
                type="date"
              />
              <label className="block rounded-[10px] border border-dashed border-blue-200 bg-blue-50/50 p-4 text-[13px] font-extrabold text-slate-700 md:col-span-2">
                Zmień zdjęcie projektu
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="mt-3 block w-full text-sm font-semibold text-slate-600 file:mr-4 file:h-10 file:rounded-[8px] file:border-0 file:bg-blue-600 file:px-4 file:text-sm file:font-extrabold file:text-white hover:file:bg-blue-700"
                  name="image"
                  type="file"
                />
                <span className="mt-2 block text-xs font-semibold text-slate-500">
                  JPG, PNG, WebP lub GIF do 5 MB.
                </span>
              </label>
              <button className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-blue-600 px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 md:col-span-2">
                <Icon name="save" className="size-5" />
                Zapisz zmiany
              </button>
            </form>
          </ControlCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ControlCard icon="camera" title="Zdjęcia">
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
              Galeria i dokumentacja zdjęciowa projektu będzie dostępna w tym
              miejscu.
            </p>
            <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-[8px] border border-slate-200 px-4 text-sm font-extrabold text-blue-600">
              <Icon name="upload" className="size-4" />
              Dodaj zdjęcia
            </button>
          </ControlCard>
          <ControlCard icon="alert" title="Usterki">
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
              Kontroluj zgłoszone usterki, priorytety i statusy napraw.
            </p>
            <button className="mt-5 h-10 rounded-[8px] border border-slate-200 px-4 text-sm font-extrabold text-orange-600">
              Dodaj usterkę
            </button>
          </ControlCard>
          <ControlCard icon="document" title="Raport">
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
              Przygotuj raport PDF z postępami, zdjęciami i notatkami.
            </p>
            <button className="mt-5 h-10 rounded-[8px] bg-slate-950 px-4 text-sm font-extrabold text-white">
              Generuj raport
            </button>
          </ControlCard>
        </div>

        <form action={deleteProjectAction} className="mt-6">
          <input name="id" type="hidden" defaultValue={project.id} />
          <input name="redirect_to" type="hidden" defaultValue="/projects" />
          <button className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-5 text-sm font-extrabold text-red-600 transition hover:bg-red-100">
            <Icon name="trash" className="size-5" />
            Usuń projekt
          </button>
        </form>
      </section>
    </main>
  );
}
