import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppSidebar } from "@/app/app-sidebar";
import {
  deleteProjectAction,
  updateProjectAction,
} from "@/app/dashboard/projects/actions";
import type { ProjectIssue } from "@/lib/issues";
import type { Project } from "@/lib/projects";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Icon, type IconName } from "@/components/ui/icon";

const projectStatuses = ["W trakcie", "Planowany", "Zakończony", "Wstrzymany"];

type ProjectIssuesResult = {
  error: string | null;
  issues: ProjectIssue[];
};

type ProjectPageViewProps = {
  currentPath: string;
  displayName: string;
  email: string;
  initials: string;
  issuesResult: ProjectIssuesResult;
  project: Project;
  projectError?: string;
  projectMessage?: string;
};

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
      <BrandLogo />
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
  maxLength,
  minLength,
  name,
  required,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  maxLength?: number;
  minLength?: number;
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
        maxLength={maxLength}
        minLength={minLength}
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

function formatIssueTimestamp(value: string) {
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

function issueStatusTone(status: string) {
  if (status === "Naprawiona") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "W trakcie naprawy") {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-orange-50 text-orange-600";
}

function issuePriorityTone(priority: string) {
  if (priority === "Krytyczna" || priority === "Pilna") {
    return "bg-red-50 text-red-600";
  }

  if (priority === "Niska") {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-orange-50 text-orange-600";
}

function IssueThumb({ issue }: { issue: ProjectIssue }) {
  if (issue.image_url) {
    return (
      <Image
        alt=""
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        height={220}
        src={issue.image_url}
        width={520}
      />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#fde7d3_0_36%,#fff7ed_37_68%,#fb923c_69_100%)]">
      <Icon name="alert" className="size-10 text-white/90" />
    </div>
  );
}

function IssueCard({ issue }: { issue: ProjectIssue }) {
  return (
    <article className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_24px_54px_rgba(15,23,42,0.09)]">
      <div className="relative h-[170px] overflow-hidden">
        <IssueThumb issue={issue} />
        <span
          className={`absolute left-4 top-4 rounded-[7px] px-3 py-2 text-[12px] font-extrabold shadow-sm ${issueStatusTone(issue.status)}`}
        >
          {issue.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[20px] font-extrabold leading-6 tracking-[-0.035em] text-slate-950">
              {issue.title}
            </h3>
            <p className="mt-2 truncate text-[15px] font-semibold text-slate-500">
              {issue.location || "Brak miejsca"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-[7px] px-3 py-2 text-[12px] font-extrabold ${issuePriorityTone(issue.priority)}`}
          >
            {issue.priority}
          </span>
        </div>
        <p className="mt-4 line-clamp-3 text-sm font-semibold leading-6 text-slate-500">
          {issue.description || "Brak opisu usterki."}
        </p>
        <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
          <div className="rounded-[10px] bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
              Dodano
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-950">
              {formatIssueTimestamp(issue.created_at)}
            </p>
          </div>
          <div className="rounded-[10px] bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
              Typ
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-950">
              Usterka
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function IssuesPanel({
  error,
  issues,
  projectId,
}: {
  error: string | null;
  issues: ProjectIssue[];
  projectId: string;
}) {
  return (
    <section className="mt-6 rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-[22px] font-extrabold tracking-[-0.035em] text-slate-950">
            <Icon name="alert" className="size-6 text-orange-500" />
            Usterki projektu
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Lista usterek pobierana tylko dla tego projektu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-[8px] bg-orange-50 px-3 py-2 text-xs font-extrabold text-orange-600">
            {issues.length} usterek
          </span>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-[8px] bg-orange-500 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(249,115,22,0.18)] transition hover:bg-orange-600"
            href={`/projects/${projectId}/issues/new`}
          >
            Dodaj usterkę
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
          {error}
        </div>
      ) : null}

      {issues.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-[12px] bg-orange-50 text-orange-500">
            <Icon name="alert" className="size-8" />
          </div>
          <h3 className="mt-5 text-[20px] font-extrabold text-slate-950">
            Brak usterek
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
            Dodaj pierwszą usterkę, żeby kontrolować status naprawy, priorytet i
            dokumentację zdjęciową.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {issues.map((issue) => (
            <IssueCard issue={issue} key={issue.id} />
          ))}
        </div>
      )}
    </section>
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

export function ProjectPageView({
  currentPath,
  displayName,
  email,
  initials,
  issuesResult,
  project,
  projectError,
  projectMessage,
}: ProjectPageViewProps) {
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
                [
                  "Utworzono",
                  new Date(project.created_at).toLocaleDateString("pl-PL"),
                ],
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
              <input
                name="redirect_to"
                type="hidden"
                defaultValue={currentPath}
              />
              <Input
                defaultValue={project.name}
                label="Nazwa projektu"
                maxLength={140}
                minLength={2}
                name="name"
                required
              />
              <Input
                defaultValue={project.client_name ?? ""}
                label="Klient"
                maxLength={120}
                name="client_name"
              />
              <Input
                defaultValue={project.location ?? ""}
                label="Lokalizacja"
                maxLength={160}
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
            <Link
              className="mt-5 inline-flex h-10 items-center justify-center rounded-[8px] border border-slate-200 px-4 text-sm font-extrabold text-orange-600 transition hover:border-orange-200 hover:bg-orange-50"
              href={`/projects/${project.id}/issues/new`}
            >
              Dodaj usterkę
            </Link>
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

        <IssuesPanel
          error={issuesResult.error}
          issues={issuesResult.issues}
          projectId={project.id}
        />

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
