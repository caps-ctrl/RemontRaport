"use client";

import Form from "next/form";
import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Project } from "@/lib/projects";

export function ProjectSelector({
  projects,
  selectedProjectId,
}: {
  projects: Project[];
  selectedProjectId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form
      action="/reports"
      className="grid gap-4 rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_18px_42px_rgba(15,23,42,0.055)] md:grid-cols-[1fr_auto]"
      data-print-hide="true"
      ref={formRef}
      replace
      scroll={false}
    >
      <label className="block text-[13px] font-extrabold text-slate-700">
        Projekt do raportu
        <select
          className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          defaultValue={selectedProjectId ?? ""}
          disabled={projects.length === 0}
          name="projectId"
          onChange={() => formRef.current?.requestSubmit()}
        >
          {projects.length === 0 ? (
            <option value="">Brak projektów</option>
          ) : null}
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
              {project.location ? ` - ${project.location}` : ""}
            </option>
          ))}
        </select>
      </label>
      <button
        className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-[8px] bg-blue-600 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55"
        disabled={projects.length === 0}
        type="submit"
      >
        <Icon name="document" className="size-5" />
        Generuj raport
      </button>
    </Form>
  );
}
