import "server-only";

import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getZodErrorMessage,
  imageMimeTypes,
  issueDraftSchema,
  maxImageSize,
} from "@/lib/validation";

const ISSUE_IMAGES_BUCKET = "issue-images";

export const ISSUE_COLUMNS =
  "id,project_id,created_by,title,description,location,status,priority,created_at,updated_at";

export type ProjectIssue = {
  id: string;
  project_id: string;
  created_by: string;
  title: string;
  description: string | null;
  location: string | null;
  status: string;
  priority: string;
  image_path: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>;

type ParsedIssueInput = {
  description: string;
  image?: File;
  location?: string | null;
  priority: string;
  status: string;
  title: string;
};

export class IssueError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "IssueError";
    this.status = status;
  }
}

function assertProjectId(projectId: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      projectId,
    )
  ) {
    throw new IssueError("Niepoprawny identyfikator projektu.");
  }
}

function readFormString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function readIssueImage(formData: FormData) {
  const image = formData.get("image");

  return image instanceof File && image.size > 0 ? image : undefined;
}

function parseIssueFormData(formData: FormData): ParsedIssueInput {
  const parsed = issueDraftSchema.safeParse({
    description: readFormString(formData, "description"),
    image: readIssueImage(formData),
    location: readFormString(formData, "location"),
    priority: readFormString(formData, "priority"),
    status: readFormString(formData, "status"),
    title: readFormString(formData, "title"),
  });

  if (!parsed.success) {
    throw new IssueError(getZodErrorMessage(parsed.error));
  }

  return parsed.data;
}

function mapIssue(row: Record<string, unknown>): ProjectIssue {
  const issueImages = Array.isArray(row.project_issue_images)
    ? (row.project_issue_images as Record<string, unknown>[])
    : [];
  const firstImage = issueImages.find(
    (image) => typeof image.storage_path === "string",
  );

  return {
    id: String(row.id),
    project_id: String(row.project_id),
    created_by: String(row.created_by),
    title: String(row.title),
    description:
      typeof row.description === "string" ? row.description : null,
    location: typeof row.location === "string" ? row.location : null,
    status: String(row.status),
    priority: String(row.priority),
    image_path:
      typeof firstImage?.storage_path === "string"
        ? firstImage.storage_path
        : null,
    image_url: null,
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
  };
}

function isIssueImageFile(file: File | null | undefined): file is File {
  return Boolean(file && file.size > 0);
}

function getImageExtension(file: File) {
  const [, subtype = "jpg"] = file.type.split("/");
  const extension = subtype === "jpeg" ? "jpg" : subtype;

  return extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
}

async function getAuthenticatedIssueContext(): Promise<{
  supabase: SupabaseServerClient;
  user: User;
}> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new IssueError("Brak autoryzacji.", 401);
  }

  return { supabase, user };
}

async function assertProjectOwnership(
  supabase: SupabaseServerClient,
  projectId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new IssueError("Nie udało się zweryfikować projektu.", 500);
  }

  if (!data) {
    throw new IssueError("Nie znaleziono projektu.", 404);
  }
}

async function uploadIssueImage(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string,
  image: File | undefined,
) {
  if (!isIssueImageFile(image)) {
    return null;
  }

  if (!imageMimeTypes.includes(image.type as (typeof imageMimeTypes)[number])) {
    throw new IssueError("Zdjęcie musi być w formacie JPG, PNG, WebP lub GIF.");
  }

  if (image.size > maxImageSize) {
    throw new IssueError("Zdjęcie może mieć maksymalnie 5 MB.");
  }

  const path = `${userId}/${projectId}/${crypto.randomUUID()}.${getImageExtension(image)}`;
  const { error } = await supabase.storage
    .from(ISSUE_IMAGES_BUCKET)
    .upload(path, image, {
      cacheControl: "3600",
      contentType: image.type,
      upsert: false,
    });

  if (error) {
    throw new IssueError("Nie udało się przesłać zdjęcia usterki.", 500);
  }

  return path;
}

async function removeIssueImage(
  supabase: SupabaseServerClient,
  imagePath: string | null,
) {
  if (!imagePath) {
    return;
  }

  await supabase.storage.from(ISSUE_IMAGES_BUCKET).remove([imagePath]);
}

async function signIssueImages(
  supabase: SupabaseServerClient,
  issues: ProjectIssue[],
) {
  return Promise.all(
    issues.map(async (issue) => {
      if (!issue.image_path) {
        return issue;
      }

      const { data } = await supabase.storage
        .from(ISSUE_IMAGES_BUCKET)
        .createSignedUrl(issue.image_path, 60 * 60);

      return {
        ...issue,
        image_url: data?.signedUrl ?? null,
      };
    }),
  );
}

export async function createProjectIssue(
  projectId: string,
  formData: FormData,
) {
  assertProjectId(projectId);

  const { supabase, user } = await getAuthenticatedIssueContext();
  await assertProjectOwnership(supabase, projectId, user.id);

  const issueInput = parseIssueFormData(formData);
  const imagePath = await uploadIssueImage(
    supabase,
    user.id,
    projectId,
    issueInput.image,
  );
  const { data, error } = await supabase
    .from("project_issues")
    .insert({
      created_by: user.id,
      description: issueInput.description,
      location: issueInput.location ?? null,
      priority: issueInput.priority,
      project_id: projectId,
      status: issueInput.status,
      title: issueInput.title,
    })
    .select(ISSUE_COLUMNS)
    .single();

  if (error || !data) {
    await removeIssueImage(supabase, imagePath);
    throw new IssueError("Nie udało się zapisać usterki.", 500);
  }

  const issue = mapIssue(data);

  if (!imagePath) {
    return issue;
  }

  const { error: imageRecordError } = await supabase
    .from("project_issue_images")
    .insert({
      created_by: user.id,
      issue_id: issue.id,
      storage_path: imagePath,
    });

  if (imageRecordError) {
    await Promise.all([
      removeIssueImage(supabase, imagePath),
      supabase
        .from("project_issues")
        .delete()
        .eq("id", issue.id)
        .eq("created_by", user.id),
    ]);

    throw new IssueError("Nie udało się zapisać zdjęcia usterki.", 500);
  }

  return issue;
}

export async function listProjectIssues(projectId: string) {
  assertProjectId(projectId);

  const { supabase, user } = await getAuthenticatedIssueContext();
  await assertProjectOwnership(supabase, projectId, user.id);

  const { data, error } = await supabase
    .from("project_issues")
    .select(`${ISSUE_COLUMNS},project_issue_images(storage_path,created_at)`)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new IssueError("Nie udało się pobrać usterek.", 500);
  }

  return signIssueImages(supabase, (data ?? []).map((row) => mapIssue(row)));
}
