"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ProjectIssue } from "@/lib/issues";
import type { Project } from "@/lib/projects";

function formatDate(value?: string | null) {
  if (!value) {
    return "Nie ustawiono";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Brak danych";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
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

function makeReportStats(issues: ProjectIssue[]) {
  const open = issues.filter((issue) => issue.status === "Nie naprawiona");
  const inProgress = issues.filter(
    (issue) => issue.status === "W trakcie naprawy",
  );
  const fixed = issues.filter((issue) => issue.status === "Naprawiona");
  const urgent = issues.filter(
    (issue) => issue.priority === "Pilna" || issue.priority === "Krytyczna",
  );
  const photos = issues.reduce(
    (total, issue) => total + issue.images.length,
    0,
  );

  return {
    fixed: fixed.length,
    inProgress: inProgress.length,
    open: open.length,
    photos,
    total: issues.length,
    urgent: urgent.length,
  };
}

function makeReportSummary(project: Project, issues: ProjectIssue[]) {
  const stats = makeReportStats(issues);

  if (stats.total === 0) {
    return `Projekt "${project.name}" nie ma usterek dodanych do tego raportu.`;
  }

  if (stats.urgent > 0) {
    return `Projekt "${project.name}" wymaga priorytetowej kontroli: ${stats.urgent} usterek ma wysoki priorytet, a ${stats.open} nadal oczekuje na naprawę.`;
  }

  if (stats.open > 0 || stats.inProgress > 0) {
    return `Projekt "${project.name}" ma aktywne usterki do domknięcia. W raporcie uwzględniono ${stats.total} zgłoszeń i ${stats.photos} zdjęć dokumentacyjnych.`;
  }

  return `Wszystkie usterki dodane do raportu projektu "${project.name}" są oznaczone jako naprawione.`;
}

function ProjectCover({ project }: { project: Project }) {
  if (project.image_url) {
    return (
      <Image
        alt=""
        className="h-full w-full object-cover"
        height={420}
        priority
        src={project.image_url}
        width={780}
      />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#d4c4b2_0_38%,#f5efe7_39_70%,#a98f72_71_100%)]">
      <Icon name="camera" className="size-12 text-white/85" />
    </div>
  );
}

function ReportControls({
  includedCount,
  issues,
  onAddAll,
  onRemoveAll,
  onToggle,
  removedIssues,
  totalCount,
}: {
  includedCount: number;
  issues: ProjectIssue[];
  onAddAll: () => void;
  onRemoveAll: () => void;
  onToggle: (issueId: string) => void;
  removedIssues: ProjectIssue[];
  totalCount: number;
}) {
  return (
    <section
      className="mt-6 rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.055)]"
      data-print-hide="true"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[18px] font-extrabold text-slate-950">
            Usterki w raporcie
          </h2>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
            Te przyciski zmieniają tylko zawartość aktualnego raportu.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[8px] bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600">
            {includedCount}/{totalCount} dodane
          </span>
          <button
            className="h-10 rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
            onClick={onAddAll}
            type="button"
          >
            Dodaj wszystkie
          </button>
          <button
            className="h-10 rounded-[8px] border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-600 transition hover:bg-red-100"
            onClick={onRemoveAll}
            type="button"
          >
            Usuń wszystkie z raportu
          </button>
        </div>
      </div>

      {removedIssues.length > 0 ? (
        <div className="mt-4 rounded-[10px] bg-slate-50 p-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
            Poza raportem
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {removedIssues.map((issue) => (
              <div
                className="flex items-center justify-between gap-3 rounded-[8px] bg-white px-3 py-2"
                key={issue.id}
              >
                <span className="truncate text-sm font-extrabold text-slate-800">
                  {issue.title}
                </span>
                <button
                  className="shrink-0 rounded-[7px] bg-blue-600 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-blue-700"
                  onClick={() => onToggle(issue.id)}
                  type="button"
                >
                  Dodaj
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : issues.length > 0 ? (
        <p className="mt-4 rounded-[10px] bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-700">
          Wszystkie usterki są dodane do raportu.
        </p>
      ) : null}
    </section>
  );
}

function ReportPreview({
  issues,
  onToggleIssue,
  project,
}: {
  issues: ProjectIssue[];
  onToggleIssue: (issueId: string) => void;
  project: Project;
}) {
  const stats = makeReportStats(issues);
  const generatedAt = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
  const statItems = [
    ["Usterki", stats.total],
    ["Nie naprawione", stats.open],
    ["W trakcie", stats.inProgress],
    ["Naprawione", stats.fixed],
    ["Pilne / krytyczne", stats.urgent],
    ["Zdjęcia", stats.photos],
  ];

  return (
    <article
      className="mt-6 overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.055)]"
      data-report-document="true"
      id="report-preview"
    >
      <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="h-[250px]">
          <ProjectCover project={project} />
        </div>
        <section className="flex flex-col justify-between gap-5 p-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-blue-600">
              <Icon name="document" className="size-4" />
              Raport projektu
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.035em] text-slate-950">
              {project.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-5 text-slate-500">
              {makeReportSummary(project, issues)}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["Klient", project.client_name || "Brak danych"],
              ["Lokalizacja", project.location || "Brak lokalizacji"],
              ["Status", project.status ?? "W trakcie"],
              ["Wygenerowano", generatedAt],
              ["Start", formatDate(project.start_date)],
              ["Utworzono", formatDate(project.created_at)],
            ].map(([label, value]) => (
              <div className="rounded-[8px] bg-slate-50 p-3" key={label}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
                  {label}
                </p>
                <p className="mt-0.5 text-xs font-extrabold text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="border-t border-slate-100 p-5">
        <h3 className="text-[18px] font-extrabold tracking-[-0.025em] text-slate-950">
          Podsumowanie
        </h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          {statItems.map(([label, value]) => (
            <div className="rounded-[8px] bg-slate-50 p-3" key={label}>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-[20px] font-extrabold tracking-[-0.03em] text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-[18px] font-extrabold tracking-[-0.025em] text-slate-950">
              Usterki projektu
            </h3>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
              Pozycje wybrane do tego raportu.
            </p>
          </div>
          <span className="w-fit rounded-[7px] bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-orange-600">
            {issues.length} pozycji
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="mt-4 rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-extrabold text-slate-700">
              Brak usterek dodanych do raportu.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {issues.map((issue, index) => (
              <section
                className="rounded-[10px] border border-slate-200 bg-white p-4"
                key={issue.id}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                      Usterka {index + 1}
                    </p>
                    <h4 className="mt-1 text-[17px] font-extrabold tracking-[-0.025em] text-slate-950">
                      {issue.title}
                    </h4>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
                      {issue.description ||
                        issue.ai_description ||
                        "Brak opisu usterki."}
                    </p>
                    {issue.ai_description ? (
                      <div className="mt-3 rounded-[8px] border border-blue-100 bg-blue-50/70 p-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-blue-500">
                          Analiza AI
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                          {issue.ai_description}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <span
                      className={`rounded-[7px] px-2.5 py-1.5 text-[11px] font-extrabold ${issueStatusTone(issue.status)}`}
                    >
                      {issue.status}
                    </span>
                    <span
                      className={`rounded-[7px] px-2.5 py-1.5 text-[11px] font-extrabold ${issuePriorityTone(issue.priority)}`}
                    >
                      {issue.priority}
                    </span>
                    <button
                      className="rounded-[7px] border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-extrabold text-red-600 transition hover:bg-red-100"
                      data-print-hide="true"
                      onClick={() => onToggleIssue(issue.id)}
                      type="button"
                    >
                      Usuń z raportu
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {[
                    ["Miejsce", issue.location || "Brak miejsca"],
                    ["Dodano", formatDateTime(issue.created_at)],
                    ["Aktualizacja", formatDateTime(issue.updated_at)],
                  ].map(([label, value]) => (
                    <div className="rounded-[8px] bg-slate-50 p-3" key={label}>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs font-extrabold text-slate-950">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {issue.images.length > 0 ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {issue.images.map((image) =>
                      image.image_url ? (
                        <div
                          className="relative h-[120px] overflow-hidden rounded-[8px] bg-slate-100"
                          key={image.id || image.storage_path}
                        >
                          <Image
                            alt=""
                            className="h-full w-full object-cover"
                            height={220}
                            src={image.image_url}
                            width={320}
                          />
                        </div>
                      ) : null,
                    )}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

export function ReportBuilder({
  issues,
  project,
}: {
  issues: ProjectIssue[];
  project: Project;
}) {
  const [includedIssueIds, setIncludedIssueIds] = useState(
    () => new Set(issues.map((issue) => issue.id)),
  );
  const includedIssues = useMemo(
    () => issues.filter((issue) => includedIssueIds.has(issue.id)),
    [includedIssueIds, issues],
  );
  const removedIssues = useMemo(
    () => issues.filter((issue) => !includedIssueIds.has(issue.id)),
    [includedIssueIds, issues],
  );

  function toggleIssue(issueId: string) {
    setIncludedIssueIds((current) => {
      const next = new Set(current);

      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }

      return next;
    });
  }

  return (
    <>
      <ReportControls
        includedCount={includedIssues.length}
        issues={issues}
        onAddAll={() =>
          setIncludedIssueIds(new Set(issues.map((issue) => issue.id)))
        }
        onRemoveAll={() => setIncludedIssueIds(new Set())}
        onToggle={toggleIssue}
        removedIssues={removedIssues}
        totalCount={issues.length}
      />
      <ReportPreview
        issues={includedIssues}
        onToggleIssue={toggleIssue}
        project={project}
      />
    </>
  );
}
