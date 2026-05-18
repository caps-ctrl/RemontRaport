"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteProjectOptimisticAction } from "@/app/dashboard/projects/actions";
import type { Project } from "@/lib/projects";

type IconName = "camera" | "folder" | "search";

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
    case "camera":
      return (
        <svg {...common}>
          <path d="M5 8h3l1.5-2h5L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13.5" r="3.2" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
          <path d="M4 10h16" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
  }
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

function statusTone(status?: string | null) {
  if (status === "Zakończony" || status === "Zakończone") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "Planowany" || status === "W trakcie") {
    return "bg-blue-50 text-blue-600";
  }

  return "bg-orange-50 text-orange-600";
}

function ProjectThumb({ project }: { project: Project }) {
  if (project.image_url) {
    return (
      <Image
        alt=""
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        height={220}
        src={project.image_url}
        width={520}
      />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#d4c4b2_0_38%,#f5efe7_39_70%,#a98f72_71_100%)]">
      <Icon name="camera" className="size-10 text-white/85" />
    </div>
  );
}

function ProjectCard({
  isDeleting,
  onDelete,
  project,
}: {
  isDeleting: boolean;
  onDelete: (project: Project) => void;
  project: Project;
}) {
  const status = project.status ?? "W trakcie";

  return (
    <article
      className={`group relative flex min-h-[330px] flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_54px_rgba(15,23,42,0.09)] ${
        isDeleting ? "pointer-events-none scale-[0.98] opacity-45" : ""
      }`}
    >
      <div className="relative h-[170px] overflow-hidden">
        <ProjectThumb project={project} />
        <span
          className={`absolute left-4 top-4 rounded-[7px] px-3 py-2 text-[12px] font-extrabold shadow-sm ${statusTone(status)}`}
        >
          {status}
        </span>
      </div>
      <Link
        aria-label={`Otwórz projekt ${project.name}`}
        className="absolute inset-0 z-0"
        href={`/projects/${project.id}`}
      />
      <div className="relative z-10 flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-[20px] font-extrabold tracking-[-0.035em] text-slate-950">
              {project.name}
            </h3>
            <p className="mt-2 truncate text-[15px] font-semibold text-slate-500">
              {project.location || "Brak lokalizacji"}
            </p>
          </div>
          <details className="relative z-20 shrink-0">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-[8px] text-xl font-bold text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 [&::-webkit-details-marker]:hidden">
              ⋮
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-40 rounded-[10px] border border-slate-200 bg-white p-2 shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
              <button
                className="w-full rounded-[8px] px-3 py-2 text-left text-sm font-extrabold text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                disabled={isDeleting}
                onClick={() => onDelete(project)}
                type="button"
              >
                {isDeleting ? "Usuwanie..." : "Usuń projekt"}
              </button>
            </div>
          </details>
        </div>
        <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
          <div className="rounded-[10px] bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
              Data
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-950">
              {formatProjectTimestamp(project.created_at)}
            </p>
          </div>
          <div className="rounded-[10px] bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
              Klient
            </p>
            <p className="mt-1 truncate text-sm font-extrabold text-slate-950">
              {project.client_name || "Brak danych"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [items, setItems] = useState(projects);
  const [query, setQuery] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = normalizedQuery
    ? items.filter((project) =>
        [
          project.name,
          project.location,
          project.client_name,
          project.status,
        ].some((value) => value?.toLowerCase().includes(normalizedQuery)),
      )
    : items;

  function restoreProject(project: Project, index: number) {
    setItems((current) => {
      if (current.some((item) => item.id === project.id)) {
        return current;
      }

      const next = [...current];
      next.splice(Math.min(index, next.length), 0, project);

      return next;
    });
  }

  function handleDelete(project: Project) {
    const index = items.findIndex((item) => item.id === project.id);

    if (index === -1 || deletingIds.has(project.id)) {
      return;
    }

    setError(null);
    setDeletingIds((current) => new Set(current).add(project.id));
    setItems((current) => current.filter((item) => item.id !== project.id));

    startTransition(async () => {
      const result = await deleteProjectOptimisticAction(project.id);

      setDeletingIds((current) => {
        const next = new Set(current);
        next.delete(project.id);

        return next;
      });

      if (!result.ok) {
        restoreProject(project, index);
        setError(result.error ?? "Nie udało się usunąć projektu.");
      }
    });
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
          />
          <input
            className="h-11 w-full rounded-[8px] border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Szukaj projektu..."
            type="search"
            value={query}
          />
        </div>
        <span className="rounded-[8px] bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600">
          {filteredItems.length} z {items.length} projektów
        </span>
      </div>

      {error ? (
        <div className="mb-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
          {error}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-[12px] bg-blue-50 text-blue-600">
            <Icon name="folder" className="size-8" />
          </div>
          <h2 className="mt-5 text-[20px] font-extrabold text-slate-950">
            Brak projektów
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
            Dodaj pierwszy projekt i zacznij porządkować zdjęcia, notatki oraz
            status prac.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
          <h2 className="text-[20px] font-extrabold text-slate-950">
            Nic nie znaleziono
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Zmień frazę wyszukiwania albo wyczyść pole.
          </p>
        </div>
      ) : (
        <div>
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredItems.map((project) => (
              <ProjectCard
                isDeleting={deletingIds.has(project.id)}
                key={project.id}
                onDelete={handleDelete}
                project={project}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
