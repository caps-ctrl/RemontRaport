"use client";

import Image from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import { useActionState, useMemo, useState } from "react";
import type {
  CreateIssueFormAction,
  IssueFormState,
} from "@/app/projects/[id]/issues/new/actions";
import { getZodErrorMessage, issueDraftSchema } from "@/lib/validation";

type IconName = "camera" | "check" | "upload";

const initialIssueFormState: IssueFormState = {
  status: "idle",
};

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
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
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

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block text-[13px] font-extrabold text-slate-700">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        maxLength={name === "title" ? 140 : 160}
        minLength={required ? 3 : undefined}
        name={name}
        placeholder={placeholder}
        required={required}
        type="text"
      />
    </label>
  );
}

export function IssueForm({ action }: { action: CreateIssueFormAction }) {
  const [actionState, formAction, isPending] = useActionState(
    action,
    initialIssueFormState,
  );
  const [status, setStatus] = useState("Nie naprawiona");
  const [priority, setPriority] = useState("Normalna");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [hideServerState, setHideServerState] = useState(false);
  const isFixed = status === "Naprawiona";
  const previewUrl = useMemo(() => imageUrl, [imageUrl]);
  const error =
    clientError ??
    (!hideServerState && actionState.status === "error"
      ? actionState.error
      : null);
  const message =
    !hideServerState && actionState.status === "success"
      ? actionState.message
      : null;

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImageUrl(null);
      return;
    }

    setImageUrl(URL.createObjectURL(file));
  }

  function handleReset(event: FormEvent<HTMLFormElement>) {
    event.currentTarget.reset();
    setStatus("Nie naprawiona");
    setPriority("Normalna");
    setImageUrl(null);
    setClientError(null);
    setHideServerState(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const image = formData.get("image");
    const parsed = issueDraftSchema.safeParse({
      description: formData.get("description"),
      image: image instanceof File && image.size > 0 ? image : undefined,
      location: formData.get("location"),
      priority: formData.get("priority"),
      status: formData.get("status"),
      title: formData.get("title"),
    });

    if (!parsed.success) {
      event.preventDefault();
      setHideServerState(true);
      setClientError(getZodErrorMessage(parsed.error));
      return;
    }

    setHideServerState(false);
    setClientError(null);
  }

  return (
    <form
      action={formAction}
      className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"
      encType="multipart/form-data"
      onReset={handleReset}
      onSubmit={handleSubmit}
    >
      <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
        <div className="relative h-[360px] bg-slate-100">
          {previewUrl ? (
            <Image
              alt=""
              className="h-full w-full object-cover"
              height={520}
              src={previewUrl}
              unoptimized
              width={760}
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#f1f5f9_0_38%,#e0f2fe_39_70%,#dbeafe_71_100%)]">
              <div className="text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-[14px] bg-white/85 text-blue-600 shadow-sm">
                  <Icon name="camera" className="size-9" />
                </span>
                <p className="mt-4 text-sm font-extrabold text-slate-700">
                  Dodaj zdjęcie usterki
                </p>
              </div>
            </div>
          )}
        </div>
        <label className="block border-t border-slate-100 p-5 text-[13px] font-extrabold text-slate-700">
          Zdjęcie usterki
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-3 block w-full text-sm font-semibold text-slate-600 file:mr-4 file:h-10 file:rounded-[8px] file:border-0 file:bg-blue-600 file:px-4 file:text-sm file:font-extrabold file:text-white hover:file:bg-blue-700"
            name="image"
            onChange={handleImageChange}
            type="file"
          />
          <span className="mt-2 block text-xs font-semibold text-slate-500">
            JPG, PNG, WebP lub GIF do 5 MB.
          </span>
        </label>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.045)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-extrabold tracking-[-0.035em] text-slate-950">
              Nowa usterka
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              Opisz problem, dodaj zdjęcie i określ, czy usterka jest już
              naprawiona.
            </p>
          </div>
          <span
            className={`rounded-[8px] px-3 py-2 text-xs font-extrabold ${
              isFixed
                ? "bg-emerald-50 text-emerald-700"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <Field
            label="Tytuł usterki"
            name="title"
            placeholder="Np. Pęknięta płytka przy oknie"
            required
          />
          <Field
            label="Miejsce"
            name="location"
            placeholder="Np. Łazienka, ściana prawa"
          />
          <label className="block text-[13px] font-extrabold text-slate-700">
            Status naprawy
            <select
              className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              name="status"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option>Nie naprawiona</option>
              <option>W trakcie naprawy</option>
              <option>Naprawiona</option>
            </select>
          </label>
          <label className="block text-[13px] font-extrabold text-slate-700">
            Priorytet
            <select
              className="mt-2 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              name="priority"
              onChange={(event) => setPriority(event.target.value)}
              value={priority}
            >
              <option>Niska</option>
              <option>Normalna</option>
              <option>Pilna</option>
              <option>Krytyczna</option>
            </select>
          </label>
          <label className="block text-[13px] font-extrabold text-slate-700 md:col-span-2">
            Opis usterki
            <textarea
              className="mt-2 min-h-[150px] w-full resize-y rounded-[8px] border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              maxLength={1200}
              minLength={8}
              name="description"
              placeholder="Opisz, co jest uszkodzone, kiedy zauważono problem i co trzeba sprawdzić."
              required
            />
          </label>
        </div>

        <div className="mt-6 grid gap-3 rounded-[12px] bg-slate-50 p-4 sm:grid-cols-3">
          {[
            ["Status", status],
            ["Priorytet", priority],
            ["Zdjęcie", previewUrl ? "Dodane" : "Brak"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>

        {error ? (
          <div className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="mt-5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-800">
            {message}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-[8px] border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
            type="reset"
          >
            Wyczyść
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-blue-600 px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700"
            disabled={isPending}
            type="submit"
          >
            <Icon name="check" className="size-5" />
            {isPending ? "Zapisywanie..." : "Zapisz usterkę"}
          </button>
        </div>
      </section>
    </form>
  );
}
