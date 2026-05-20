"use client";

import Image from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type {
  CreateIssueFormAction,
  IssueFormState,
} from "@/app/projects/[id]/issues/new/actions";
import type { ProjectIssue } from "@/lib/issues";
import {
  getZodErrorMessage,
  issueDraftSchema,
  maxIssueImages,
} from "@/lib/validation";

type IconName = "camera" | "check" | "upload" | "x";
type IssueFormMode = "create" | "edit";
type ExistingImagePreview = {
  id: string | null;
  kind: "existing";
  url: string;
};
type SelectedImagePreview = {
  id: string;
  file: File;
  kind: "selected";
  url: string;
};
type ImagePreview = ExistingImagePreview | SelectedImagePreview;

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
    case "x":
      return (
        <svg {...common}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
  }
}

function Field({
  defaultValue,
  label,
  name,
  placeholder,
  required,
}: {
  defaultValue?: string;
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
        defaultValue={defaultValue}
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

function formatImageCount(count: number) {
  if (count === 0) {
    return "Brak";
  }

  if (count === 1) {
    return "1 zdjęcie";
  }

  if (count < 5) {
    return `${count} zdjęcia`;
  }

  return `${count} zdjęć`;
}

function makePreviewId(file: File, index: number) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}

export function IssueForm({
  action,
  issue,
  mode = "create",
}: {
  action: CreateIssueFormAction;
  issue?: ProjectIssue;
  mode?: IssueFormMode;
}) {
  const initialStatus = issue?.status ?? "Nie naprawiona";
  const initialPriority = issue?.priority ?? "Normalna";
  const initialImagePreviews = useMemo<ExistingImagePreview[]>(() => {
    const imagePreviews =
      issue?.images
        .filter((image) => image.image_url)
        .map((image) => ({
          id: image.id || null,
          kind: "existing" as const,
          url: image.image_url as string,
        })) ?? [];

    return imagePreviews.length > 0 || !issue?.image_url
      ? imagePreviews
      : [
          {
            id: null,
            kind: "existing" as const,
            url: issue.image_url,
          },
        ];
  }, [issue]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const selectedImagePreviewsRef = useRef<SelectedImagePreview[]>([]);
  const [actionState, formAction, isPending] = useActionState(
    action,
    initialIssueFormState,
  );
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState(initialPriority);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<
    SelectedImagePreview[]
  >([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [hideServerState, setHideServerState] = useState(false);
  const isFixed = status === "Naprawiona";
  const activeExistingImagePreviews = useMemo(
    () =>
      initialImagePreviews.filter(
        (image) => !image.id || !removedImageIds.includes(image.id),
      ),
    [initialImagePreviews, removedImageIds],
  );
  const imagePreviews = useMemo<ImagePreview[]>(
    () => [...activeExistingImagePreviews, ...selectedImagePreviews],
    [activeExistingImagePreviews, selectedImagePreviews],
  );
  const error =
    clientError ??
    (!hideServerState && actionState.status === "error"
      ? actionState.error
      : null);
  const message =
    !hideServerState && actionState.status === "success"
      ? actionState.message
      : null;

  useEffect(() => {
    selectedImagePreviewsRef.current = selectedImagePreviews;
  }, [selectedImagePreviews]);

  useEffect(
    () => () => {
      selectedImagePreviewsRef.current.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
    },
    [],
  );

  function syncImageInput(previews: SelectedImagePreview[]) {
    if (!imageInputRef.current) {
      return;
    }

    const dataTransfer = new DataTransfer();

    previews.forEach((preview) => dataTransfer.items.add(preview.file));
    imageInputRef.current.files = dataTransfer.files;
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter(
      (file) => file.size > 0,
    );

    if (files.length === 0) {
      selectedImagePreviews.forEach((preview) =>
        URL.revokeObjectURL(preview.url),
      );
      setSelectedImagePreviews([]);
      return;
    }

    selectedImagePreviews.forEach((preview) =>
      URL.revokeObjectURL(preview.url),
    );
    setSelectedImagePreviews(
      files.map((file, index) => ({
        id: makePreviewId(file, index),
        file,
        kind: "selected",
        url: URL.createObjectURL(file),
      })),
    );
  }

  function removeImagePreview(preview: ImagePreview) {
    setHideServerState(true);
    setClientError(null);

    if (preview.kind === "existing") {
      if (!preview.id) {
        return;
      }

      const imageId = preview.id;

      setRemovedImageIds((imageIds) =>
        imageIds.includes(imageId) ? imageIds : [...imageIds, imageId],
      );
      return;
    }

    const nextPreviews = selectedImagePreviews.filter(
      (image) => image.id !== preview.id,
    );

    URL.revokeObjectURL(preview.url);
    setSelectedImagePreviews(nextPreviews);
    syncImageInput(nextPreviews);
  }

  function handleReset(event: FormEvent<HTMLFormElement>) {
    event.currentTarget.reset();
    selectedImagePreviews.forEach((preview) =>
      URL.revokeObjectURL(preview.url),
    );
    setStatus(initialStatus);
    setPriority(initialPriority);
    setSelectedImagePreviews([]);
    setRemovedImageIds([]);
    setClientError(null);
    setHideServerState(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const images = formData
      .getAll("images")
      .filter((image): image is File => image instanceof File && image.size > 0);

    if (activeExistingImagePreviews.length + images.length > maxIssueImages) {
      event.preventDefault();
      setHideServerState(true);
      setClientError(
        `Usterka może mieć maksymalnie ${maxIssueImages} zdjęć.`,
      );
      return;
    }

    const parsed = issueDraftSchema.safeParse({
      description: formData.get("description"),
      images,
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
      {removedImageIds.map((imageId) => (
        <input
          defaultValue={imageId}
          key={imageId}
          name="delete_image_ids"
          type="hidden"
        />
      ))}
      <section className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
        <div className="relative h-[360px] bg-slate-100">
          {imagePreviews.length > 0 ? (
            <div
              className={
                imagePreviews.length === 1
                  ? "h-full"
                  : `grid h-full auto-rows-fr gap-2 p-2 ${
                      imagePreviews.length <= 4
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`
              }
            >
              {imagePreviews.map((preview) => (
                <div
                  className="relative overflow-hidden rounded-[10px] bg-slate-200"
                  key={`${preview.kind}-${preview.id}`}
                >
                  <Image
                    alt=""
                    className="h-full w-full object-cover"
                    height={520}
                    src={preview.url}
                    unoptimized
                    width={760}
                  />
                  {preview.kind === "selected" || preview.id ? (
                    <button
                      aria-label="Usuń zdjęcie"
                      className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full bg-slate-950/75 text-white shadow-lg transition hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-white/70"
                      onClick={() => removeImagePreview(preview)}
                      type="button"
                    >
                      <Icon name="x" className="size-5" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#f1f5f9_0_38%,#e0f2fe_39_70%,#dbeafe_71_100%)]">
              <div className="text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-[14px] bg-white/85 text-blue-600 shadow-sm">
                  <Icon name="camera" className="size-9" />
                </span>
                <p className="mt-4 text-sm font-extrabold text-slate-700">
                  Dodaj zdjęcia usterki
                </p>
              </div>
            </div>
          )}
        </div>
        <label className="block border-t border-slate-100 p-5 text-[13px] font-extrabold text-slate-700">
          {mode === "edit" ? "Dodaj kolejne zdjęcia" : "Zdjęcia usterki"}
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-3 block w-full text-sm font-semibold text-slate-600 file:mr-4 file:h-10 file:rounded-[8px] file:border-0 file:bg-blue-600 file:px-4 file:text-sm file:font-extrabold file:text-white hover:file:bg-blue-700"
            multiple
            name="images"
            onChange={handleImageChange}
            ref={imageInputRef}
            type="file"
          />
          <span className="mt-2 block text-xs font-semibold text-slate-500">
            JPG, PNG, WebP lub GIF. Maksymalnie {maxIssueImages} zdjęć na
            usterkę, każde do 5 MB.
          </span>
        </label>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.045)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-extrabold tracking-[-0.035em] text-slate-950">
              {mode === "edit" ? "Edytuj usterkę" : "Nowa usterka"}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {mode === "edit"
                ? "Zaktualizuj opis, status, priorytet lub zdjęcia usterki."
                : "Opisz problem, dodaj zdjęcia i określ, czy usterka jest już naprawiona."}
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
            defaultValue={issue?.title ?? ""}
            label="Tytuł usterki"
            name="title"
            placeholder="Np. Pęknięta płytka przy oknie"
            required
          />
          <Field
            defaultValue={issue?.location ?? ""}
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
              defaultValue={issue?.description ?? ""}
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
            ["Zdjęcia", formatImageCount(imagePreviews.length)],
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
            {isPending
              ? "Zapisywanie..."
              : mode === "edit"
                ? "Zapisz zmiany"
                : "Zapisz usterkę"}
          </button>
        </div>
      </section>
    </form>
  );
}
