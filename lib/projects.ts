import "server-only";

import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getZodErrorMessage,
  imageMimeTypes,
  maxImageSize,
  projectCreateSchema,
  projectImageSchema,
  projectUpdateSchema,
} from "@/lib/validation";

export const PROJECT_COLUMNS =
  "id,user_id,name,client_name,location,status,start_date,image_path,created_at";

const PROJECT_IMAGES_BUCKET = "project-images";
export type Project = {
  id: string;
  user_id: string;
  name: string;
  client_name: string | null;
  location: string | null;
  status: string | null;
  start_date: string | null;
  image_path: string | null;
  image_url: string | null;
  created_at: string;
};

export type ProjectPayload = {
  name?: unknown;
  client_name?: unknown;
  clientName?: unknown;
  location?: unknown;
  status?: unknown;
  start_date?: unknown;
  startDate?: unknown;
  image_path?: unknown;
  imagePath?: unknown;
};

type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>;

type ProjectMutationValues = {
  name?: string;
  client_name?: string | null;
  location?: string | null;
  status?: string | null;
  start_date?: string | null;
  image_path?: string | null;
};

export class ProjectError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ProjectError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readField(
  payload: ProjectPayload,
  snakeName: keyof ProjectPayload,
  camelName?: keyof ProjectPayload,
) {
  const record = payload as Record<string, unknown>;

  if (Object.prototype.hasOwnProperty.call(record, snakeName)) {
    return record[snakeName];
  }

  if (camelName && Object.prototype.hasOwnProperty.call(record, camelName)) {
    return record[camelName];
  }

  return undefined;
}

function parseOptionalText(value: unknown, label: string) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new ProjectError(`${label} ma niepoprawny format.`);
  }

  return value.trim() || null;
}

function parseProjectPayload(
  payload: ProjectPayload,
  mode: "create" | "update",
): ProjectMutationValues {
  if (!isRecord(payload)) {
    throw new ProjectError("Niepoprawne dane projektu.");
  }

  const candidate = {
    client_name: parseOptionalText(
      readField(payload, "client_name", "clientName"),
      "Nazwa klienta",
    ),
    location: parseOptionalText(readField(payload, "location"), "Lokalizacja"),
    name: readField(payload, "name"),
    start_date: readField(payload, "start_date", "startDate"),
    status: readField(payload, "status") || "W trakcie",
  };
  const schema = mode === "create" ? projectCreateSchema : projectUpdateSchema;
  const parsed = schema.safeParse(candidate);

  if (!parsed.success) {
    throw new ProjectError(getZodErrorMessage(parsed.error));
  }

  return parsed.data;
}

function assertProjectId(projectId: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      projectId,
    )
  ) {
    throw new ProjectError("Niepoprawny identyfikator projektu.");
  }
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    name: String(row.name),
    client_name:
      typeof row.client_name === "string" ? row.client_name : null,
    location: typeof row.location === "string" ? row.location : null,
    status: typeof row.status === "string" ? row.status : null,
    start_date: typeof row.start_date === "string" ? row.start_date : null,
    image_path: typeof row.image_path === "string" ? row.image_path : null,
    image_url: typeof row.image_url === "string" ? row.image_url : null,
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  };
}

function isProjectImageFile(file: File | null | undefined): file is File {
  return Boolean(file && file.size > 0);
}

function getProjectImageExtension(file: File) {
  const [, subtype = "jpg"] = file.type.split("/");
  const extension = subtype === "jpeg" ? "jpg" : subtype;

  return extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
}

async function uploadProjectImage(
  supabase: SupabaseServerClient,
  userId: string,
  image: File | null | undefined,
) {
  if (!isProjectImageFile(image)) {
    return undefined;
  }

  const parsedImage = projectImageSchema.safeParse(image);

  if (!parsedImage.success) {
    throw new ProjectError(getZodErrorMessage(parsedImage.error));
  }

  if (!imageMimeTypes.includes(image.type as (typeof imageMimeTypes)[number])) {
    throw new ProjectError("Zdjęcie musi być w formacie JPG, PNG, WebP lub GIF.");
  }

  if (image.size > maxImageSize) {
    throw new ProjectError("Zdjęcie może mieć maksymalnie 5 MB.");
  }

  const path = `${userId}/${crypto.randomUUID()}.${getProjectImageExtension(image)}`;
  const { error } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(path, image, {
      cacheControl: "3600",
      contentType: image.type,
      upsert: false,
    });

  if (error) {
    throw new ProjectError("Nie udało się przesłać zdjęcia projektu.", 500);
  }

  return path;
}

async function signProjectImages(
  supabase: SupabaseServerClient,
  projects: Project[],
) {
  return Promise.all(
    projects.map(async (project) => {
      if (!project.image_path) {
        return project;
      }

      const { data } = await supabase.storage
        .from(PROJECT_IMAGES_BUCKET)
        .createSignedUrl(project.image_path, 60 * 60);

      return {
        ...project,
        image_url: data?.signedUrl ?? null,
      };
    }),
  );
}

async function signProjectImage(
  supabase: SupabaseServerClient,
  project: Project,
) {
  const [signedProject] = await signProjectImages(supabase, [project]);

  return signedProject;
}

async function getAuthenticatedProjectContext(): Promise<{
  supabase: SupabaseServerClient;
  user: User;
}> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ProjectError("Brak autoryzacji.", 401);
  }

  return { supabase, user };
}

export async function listProjectsForUser(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ProjectError("Nie udało się pobrać projektów.", 500);
  }

  return signProjectImages(supabase, (data ?? []).map((row) => mapProject(row)));
}

export async function listCurrentUserProjects() {
  const { supabase, user } = await getAuthenticatedProjectContext();

  return listProjectsForUser(supabase, user.id);
}

export async function getProjectForUser(
  supabase: SupabaseServerClient,
  projectId: string,
  userId: string,
) {
  assertProjectId(projectId);

  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ProjectError("Nie udało się pobrać projektu.", 500);
  }

  if (!data) {
    throw new ProjectError("Nie znaleziono projektu.", 404);
  }

  return signProjectImage(supabase, mapProject(data));
}

export async function createProject(
  payload: ProjectPayload,
  image?: File | null,
) {
  const { supabase, user } = await getAuthenticatedProjectContext();
  const values = parseProjectPayload(payload, "create");
  const imagePath = await uploadProjectImage(supabase, user.id, image);
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...values,
      ...(imagePath ? { image_path: imagePath } : {}),
      user_id: user.id,
    })
    .select(PROJECT_COLUMNS)
    .single();

  if (error || !data) {
    throw new ProjectError("Nie udało się dodać projektu.", 500);
  }

  return mapProject(data);
}

export async function updateProject(
  projectId: string,
  payload: ProjectPayload,
  image?: File | null,
) {
  assertProjectId(projectId);

  const { supabase, user } = await getAuthenticatedProjectContext();
  const values = parseProjectPayload(payload, "update");
  const imagePath = await uploadProjectImage(supabase, user.id, image);
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...values,
      ...(imagePath ? { image_path: imagePath } : {}),
    })
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select(PROJECT_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new ProjectError("Nie udało się zaktualizować projektu.", 500);
  }

  if (!data) {
    throw new ProjectError("Nie znaleziono projektu.", 404);
  }

  return mapProject(data);
}

export async function deleteProject(projectId: string) {
  assertProjectId(projectId);

  const { supabase, user } = await getAuthenticatedProjectContext();
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new ProjectError("Nie udało się usunąć projektu.", 500);
  }

  if (!data) {
    throw new ProjectError("Nie znaleziono projektu.", 404);
  }

  return { id: projectId };
}
