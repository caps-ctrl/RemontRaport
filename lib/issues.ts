import "server-only";

import type { User } from "@supabase/supabase-js";
import {
  getFreeImageLimitMessage,
  PlanUsageError,
} from "@/lib/plan-limits";
import { analyzeIssueImages } from "@/lib/ai-image-analysis";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getZodErrorMessage,
  imageMimeTypes,
  issueDraftSchema,
  maxIssueImages,
  maxImageSize,
} from "@/lib/validation";

const ISSUE_IMAGES_BUCKET = "issue-images";

export const ISSUE_COLUMNS =
  "id,project_id,created_by,title,description,ai_description,ai_analysis,location,status,priority,created_at,updated_at";

export type ProjectIssue = {
  id: string;
  project_id: string;
  created_by: string;
  title: string;
  description: string | null;
  ai_description: string | null;
  ai_analysis: Record<string, unknown> | null;
  location: string | null;
  status: string;
  priority: string;
  image_path: string | null;
  image_url: string | null;
  images: ProjectIssueImage[];
  created_at: string;
  updated_at: string;
};

export type ProjectIssueImage = {
  id: string;
  storage_path: string;
  image_url: string | null;
  created_at: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>;

type ParsedIssueInput = {
  description: string | null;
  images: File[];
  location?: string | null;
  priority: string;
  status: string;
  title: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class IssueError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "IssueError";
    this.status = status;
  }
}

function assertProjectId(projectId: string) {
  if (!uuidPattern.test(projectId)) {
    throw new IssueError("Niepoprawny identyfikator projektu.");
  }
}

function assertIssueId(issueId: string) {
  if (!uuidPattern.test(issueId)) {
    throw new IssueError("Niepoprawny identyfikator usterki.");
  }
}

function assertImageId(imageId: string) {
  if (!uuidPattern.test(imageId)) {
    throw new IssueError("Niepoprawny identyfikator zdjęcia.");
  }
}

function readFormString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function readIssueImages(formData: FormData) {
  const images = formData
    .getAll("images")
    .filter((image): image is File => image instanceof File && image.size > 0);
  const legacyImage = formData.get("image");

  if (legacyImage instanceof File && legacyImage.size > 0) {
    return [...images, legacyImage];
  }

  return images;
}

function readImageIdsToDelete(formData: FormData) {
  const imageIds = formData
    .getAll("delete_image_ids")
    .filter((imageId): imageId is string => typeof imageId === "string")
    .map((imageId) => imageId.trim())
    .filter(Boolean);

  imageIds.forEach(assertImageId);

  return [...new Set(imageIds)];
}

function parseIssueFormData(formData: FormData): ParsedIssueInput {
  const parsed = issueDraftSchema.safeParse({
    description: readFormString(formData, "description"),
    images: readIssueImages(formData),
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
  const images = (
    Array.isArray(row.project_issue_images)
      ? (row.project_issue_images as Record<string, unknown>[])
      : []
  )
    .filter((image) => typeof image.storage_path === "string")
    .map((image): ProjectIssueImage => ({
      id: typeof image.id === "string" ? image.id : "",
      storage_path: String(image.storage_path),
      image_url: null,
      created_at: typeof image.created_at === "string" ? image.created_at : "",
    }))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const firstImage = images[0];

  return {
    id: String(row.id),
    project_id: String(row.project_id),
    created_by: String(row.created_by),
    title: String(row.title),
    description:
      typeof row.description === "string" ? row.description : null,
    ai_description:
      typeof row.ai_description === "string" ? row.ai_description : null,
    ai_analysis:
      row.ai_analysis && typeof row.ai_analysis === "object"
        ? (row.ai_analysis as Record<string, unknown>)
        : null,
    location: typeof row.location === "string" ? row.location : null,
    status: String(row.status),
    priority: String(row.priority),
    image_path: firstImage?.storage_path ?? null,
    image_url: null,
    images,
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

function getIssuePlanError(error: unknown) {
  if (error instanceof PlanUsageError) {
    return error.message;
  }

  return null;
}

function getDatabasePlanErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes("Plan darmowy")
  ) {
    return error.message;
  }

  return null;
}

async function assertCanAddIssueImagesForPlan({
  imagesToAdd,
  imagesToRemove = 0,
  supabase,
  userId,
}: {
  imagesToAdd: number;
  imagesToRemove?: number;
  supabase: SupabaseServerClient;
  userId: string;
}) {
  let message: string | null;

  try {
    message = await getFreeImageLimitMessage({
      imagesToAdd,
      imagesToRemove,
      supabase,
      userId,
    });
  } catch (error) {
    throw new IssueError(
      getIssuePlanError(error) ?? "Nie udało się sprawdzić limitów planu.",
      500,
    );
  }

  if (message) {
    throw new IssueError(message, 402);
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

async function removeIssueImages(
  supabase: SupabaseServerClient,
  imagePaths: string[],
) {
  if (imagePaths.length === 0) {
    return;
  }

  await supabase.storage.from(ISSUE_IMAGES_BUCKET).remove(imagePaths);
}

async function uploadIssueImages(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string,
  images: File[],
) {
  const imagePaths: string[] = [];

  try {
    for (const image of images) {
      const imagePath = await uploadIssueImage(
        supabase,
        userId,
        projectId,
        image,
      );

      if (imagePath) {
        imagePaths.push(imagePath);
      }
    }
  } catch (error) {
    await removeIssueImages(supabase, imagePaths);
    throw error;
  }

  return imagePaths;
}

async function signIssueImages(
  supabase: SupabaseServerClient,
  issues: ProjectIssue[],
) {
  return Promise.all(
    issues.map(async (issue) => {
      const images = await Promise.all(
        issue.images.map(async (image) => {
          const { data } = await supabase.storage
            .from(ISSUE_IMAGES_BUCKET)
            .createSignedUrl(image.storage_path, 60 * 60);

          return {
            ...image,
            image_url: data?.signedUrl ?? null,
          };
        }),
      );
      const firstImage = images[0] ?? null;

      return {
        ...issue,
        image_path: firstImage?.storage_path ?? null,
        image_url: firstImage?.image_url ?? null,
        images,
      };
    }),
  );
}

async function signIssueImage(
  supabase: SupabaseServerClient,
  issue: ProjectIssue,
) {
  const [signedIssue] = await signIssueImages(supabase, [issue]);

  return signedIssue;
}

async function getProjectIssueForContext(
  supabase: SupabaseServerClient,
  projectId: string,
  issueId: string,
) {
  const { data, error } = await supabase
    .from("project_issues")
    .select(`${ISSUE_COLUMNS},project_issue_images(id,storage_path,created_at)`)
    .eq("id", issueId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    throw new IssueError("Nie udało się pobrać usterki.", 500);
  }

  if (!data) {
    throw new IssueError("Nie znaleziono usterki.", 404);
  }

  return signIssueImage(supabase, mapIssue(data));
}

async function insertIssueImageRecords(
  supabase: SupabaseServerClient,
  issueId: string,
  userId: string,
  imagePaths: string[],
) {
  if (imagePaths.length === 0) {
    return;
  }

  const { error } = await supabase.from("project_issue_images").insert(
    imagePaths.map((imagePath) => ({
      created_by: userId,
      issue_id: issueId,
      storage_path: imagePath,
    })),
  );

  if (error) {
    const planError = getDatabasePlanErrorMessage(error);

    throw new IssueError(
      planError ?? "Nie udało się zapisać zdjęcia usterki.",
      planError ? 402 : 500,
    );
  }
}

export async function createProjectIssue(
  projectId: string,
  formData: FormData,
) {
  assertProjectId(projectId);

  const { supabase, user } = await getAuthenticatedIssueContext();
  await assertProjectOwnership(supabase, projectId, user.id);

  const issueInput = parseIssueFormData(formData);

  if (!issueInput.description && issueInput.images.length === 0) {
    throw new IssueError(
      "Dodaj opis usterki albo przynajmniej jedno zdjęcie do analizy AI.",
    );
  }

  await assertCanAddIssueImagesForPlan({
    imagesToAdd: issueInput.images.length,
    supabase,
    userId: user.id,
  });

  const aiResult = await analyzeIssueImages(issueInput.images);

  const imagePaths = await uploadIssueImages(
    supabase,
    user.id,
    projectId,
    issueInput.images,
  );
  const { data, error } = await supabase
    .from("project_issues")
    .insert({
      created_by: user.id,
      ai_analysis: aiResult?.analysis ?? null,
      ai_description: aiResult?.description ?? null,
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
    await removeIssueImages(supabase, imagePaths);
    throw new IssueError("Nie udało się zapisać usterki.", 500);
  }

  const issue = mapIssue(data);

  if (imagePaths.length === 0) {
    return issue;
  }

  try {
    await insertIssueImageRecords(supabase, issue.id, user.id, imagePaths);
  } catch (error) {
    await Promise.all([
      removeIssueImages(supabase, imagePaths),
      supabase
        .from("project_issues")
        .delete()
        .eq("id", issue.id)
        .eq("created_by", user.id),
    ]);

    throw error;
  }

  return issue;
}

export async function getProjectIssue(projectId: string, issueId: string) {
  assertProjectId(projectId);
  assertIssueId(issueId);

  const { supabase, user } = await getAuthenticatedIssueContext();
  await assertProjectOwnership(supabase, projectId, user.id);

  return getProjectIssueForContext(supabase, projectId, issueId);
}

export async function updateProjectIssue(
  projectId: string,
  issueId: string,
  formData: FormData,
) {
  assertProjectId(projectId);
  assertIssueId(issueId);

  const { supabase, user } = await getAuthenticatedIssueContext();
  await assertProjectOwnership(supabase, projectId, user.id);

  const currentIssue = await getProjectIssueForContext(
    supabase,
    projectId,
    issueId,
  );
  const issueInput = parseIssueFormData(formData);
  const imageIdsToDelete = readImageIdsToDelete(formData);
  const currentImageById = new Map(
    currentIssue.images.map((image) => [image.id, image]),
  );
  const imagesToDelete = imageIdsToDelete.map((imageId) => {
    const image = currentImageById.get(imageId);

    if (!image) {
      throw new IssueError("Nie znaleziono zdjęcia do usunięcia.", 404);
    }

    return image;
  });
  const finalImageCount =
    currentIssue.images.length - imagesToDelete.length + issueInput.images.length;

  if (finalImageCount > maxIssueImages) {
    throw new IssueError(
      `Usterka może mieć maksymalnie ${maxIssueImages} zdjęć.`,
    );
  }

  if (!issueInput.description && finalImageCount === 0) {
    throw new IssueError(
      "Dodaj opis usterki albo przynajmniej jedno zdjęcie do analizy AI.",
    );
  }

  await assertCanAddIssueImagesForPlan({
    imagesToAdd: issueInput.images.length,
    imagesToRemove: imagesToDelete.length,
    supabase,
    userId: user.id,
  });

  const aiResult = await analyzeIssueImages(issueInput.images);

  const imagePaths = await uploadIssueImages(
    supabase,
    user.id,
    projectId,
    issueInput.images,
  );

  if (imagePaths.length > 0) {
    try {
      await insertIssueImageRecords(supabase, issueId, user.id, imagePaths);
    } catch (error) {
      await removeIssueImages(supabase, imagePaths);
      throw error;
    }
  }

  const { data, error } = await supabase
    .from("project_issues")
    .update({
      description: issueInput.description,
      ai_analysis: aiResult?.analysis ?? currentIssue.ai_analysis,
      ai_description: aiResult?.description ?? currentIssue.ai_description,
      location: issueInput.location ?? null,
      priority: issueInput.priority,
      status: issueInput.status,
      title: issueInput.title,
    })
    .eq("id", issueId)
    .eq("project_id", projectId)
    .select(ISSUE_COLUMNS)
    .maybeSingle();

  if (error || !data) {
    if (imagePaths.length > 0) {
      await Promise.all([
        removeIssueImages(supabase, imagePaths),
        supabase
          .from("project_issue_images")
          .delete()
          .eq("issue_id", issueId)
          .in("storage_path", imagePaths),
      ]);
    }

    throw new IssueError("Nie udało się zaktualizować usterki.", 500);
  }

  if (imagesToDelete.length > 0) {
    const { error: deleteImagesError } = await supabase
      .from("project_issue_images")
      .delete()
      .eq("issue_id", issueId)
      .in(
        "id",
        imagesToDelete.map((image) => image.id),
      );

    if (deleteImagesError) {
      throw new IssueError("Nie udało się usunąć zdjęcia usterki.", 500);
    }

    await removeIssueImages(
      supabase,
      imagesToDelete.map((image) => image.storage_path),
    );
  }

  return getProjectIssueForContext(supabase, projectId, issueId);
}

export async function listProjectIssues(projectId: string) {
  assertProjectId(projectId);

  const { supabase, user } = await getAuthenticatedIssueContext();
  await assertProjectOwnership(supabase, projectId, user.id);

  const { data, error } = await supabase
    .from("project_issues")
    .select(`${ISSUE_COLUMNS},project_issue_images(id,storage_path,created_at)`)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new IssueError("Nie udało się pobrać usterek.", 500);
  }

  return signIssueImages(supabase, (data ?? []).map((row) => mapIssue(row)));
}
