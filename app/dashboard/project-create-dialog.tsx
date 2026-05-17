"use client";

import { useId, useState } from "react";
import { createProjectAction } from "@/app/dashboard/projects/actions";

const projectStatuses = ["W trakcie", "Planowany", "Zakończony", "Wstrzymany"];

const inputClass =
  "mt-2 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ProjectField({
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-[13px] font-extrabold text-slate-700">
      {label}
      <input
        className={inputClass}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}

export function ProjectCreateDialog({
  className = "",
  triggerLabel = "Dodaj projekt",
  variant = "panel",
}: {
  className?: string;
  triggerLabel?: string;
  variant?: "panel" | "hero";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const isHero = variant === "hero";

  return (
    <div className={`w-full ${className}`}>
      <button
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={
          isHero
            ? "radar-hover inline-flex h-12 w-full items-center justify-center gap-3 rounded-[8px] bg-blue-600 px-9 text-[16px] font-extrabold text-white shadow-[0_16px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 sm:w-auto"
            : "radar-hover flex min-h-[78px] w-full items-center justify-center gap-3 rounded-[12px] border border-dashed border-blue-200 bg-blue-50/70 px-5 text-[15px] font-extrabold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
        }
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span
          className={
            isHero
              ? "text-white"
              : "grid size-10 place-items-center rounded-[10px] bg-blue-600 text-white shadow-[0_12px_22px_rgba(37,99,235,0.2)]"
          }
        >
          <PlusIcon className={isHero ? "size-6" : "size-5"} />
        </span>
        {triggerLabel}
      </button>

      {isOpen ? (
        <div
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-[760px] overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h2
                  className="text-[24px] font-extrabold tracking-[-0.04em] text-slate-950"
                  id={titleId}
                >
                  Nowy projekt
                </h2>
                <p
                  className="mt-1 text-sm font-semibold text-slate-500"
                  id={descriptionId}
                >
                  Dodaj podstawowe dane realizacji i rozpocznij porządkowanie
                  raportów.
                </p>
              </div>
              <button
                aria-label="Zamknij formularz"
                className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <form
              action={createProjectAction}
              className="grid gap-4 p-6 md:grid-cols-2"
            >
              <ProjectField
                label="Nazwa projektu"
                name="name"
                placeholder="Mieszkanie - Wola"
                required
              />
              <ProjectField
                label="Klient"
                name="client_name"
                placeholder="Jan Kowalski"
              />
              <ProjectField
                label="Lokalizacja"
                name="location"
                placeholder="Warszawa"
              />
              <label className="block text-[13px] font-extrabold text-slate-700">
                Status
                <select
                  className={inputClass}
                  defaultValue="W trakcie"
                  name="status"
                >
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <ProjectField
                label="Data startu"
                name="start_date"
                placeholder="2026-05-15"
                type="date"
              />
              <label className="block rounded-[10px] border border-dashed border-blue-200 bg-blue-50/50 p-4 text-[13px] font-extrabold text-slate-700 md:col-span-2">
                Zdjęcie projektu
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
              <div className="flex flex-col gap-3 sm:flex-row md:col-span-2 md:justify-end">
                <button
                  className="h-11 rounded-[8px] border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Anuluj
                </button>
                <button className="radar-hover inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-blue-600 px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700">
                  <PlusIcon className="size-5" />
                  Dodaj projekt
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
