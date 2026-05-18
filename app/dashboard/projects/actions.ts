"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProject,
  deleteProject,
  ProjectError,
  type ProjectPayload,
  updateProject,
} from "@/lib/projects";

function readFormString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function readProjectId(formData: FormData) {
  const projectId = readFormString(formData, "id").trim();

  if (!projectId) {
    throw new ProjectError("Brakuje identyfikatora projektu.");
  }

  return projectId;
}

function readProjectPayload(formData: FormData): ProjectPayload {
  return {
    name: readFormString(formData, "name"),
    client_name: readFormString(formData, "client_name"),
    location: readFormString(formData, "location"),
    status: readFormString(formData, "status"),
    start_date: readFormString(formData, "start_date"),
  };
}

function readProjectImage(formData: FormData) {
  const value = formData.get("image");

  return value instanceof File && value.size > 0 ? value : null;
}

function readProjectRedirectPath(formData: FormData) {
  const value = readFormString(formData, "redirect_to");

  if (
    /^\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    return value;
  }

  return value === "/projects" ? "/projects" : "/dashboard";
}

function getProjectErrorMessage(error: unknown, fallback: string) {
  return error instanceof ProjectError ? error.message : fallback;
}

function redirectWithProjectState(
  type: "projectError" | "projectMessage",
  message: string,
  path = "/dashboard",
): never {
  const params = new URLSearchParams({ [type]: message });

  redirect(`${path}?${params.toString()}#projects`);
}

export async function createProjectAction(formData: FormData) {
  const redirectPath = readProjectRedirectPath(formData);

  try {
    await createProject(readProjectPayload(formData), readProjectImage(formData));
  } catch (error) {
    redirectWithProjectState(
      "projectError",
      getProjectErrorMessage(error, "Nie udało się dodać projektu."),
      redirectPath,
    );
  }

  revalidatePath(redirectPath);
  redirectWithProjectState("projectMessage", "Projekt został dodany.", redirectPath);
}

export async function updateProjectAction(formData: FormData) {
  const redirectPath = readProjectRedirectPath(formData);

  try {
    await updateProject(
      readProjectId(formData),
      readProjectPayload(formData),
      readProjectImage(formData),
    );
  } catch (error) {
    redirectWithProjectState(
      "projectError",
      getProjectErrorMessage(error, "Nie udało się zaktualizować projektu."),
      redirectPath,
    );
  }

  revalidatePath(redirectPath);
  redirectWithProjectState(
    "projectMessage",
    "Projekt został zaktualizowany.",
    redirectPath,
  );
}

export async function deleteProjectAction(formData: FormData) {
  const redirectPath = readProjectRedirectPath(formData);

  try {
    await deleteProject(readProjectId(formData));
  } catch (error) {
    redirectWithProjectState(
      "projectError",
      getProjectErrorMessage(error, "Nie udało się usunąć projektu."),
      redirectPath,
    );
  }

  revalidatePath(redirectPath);
  redirectWithProjectState("projectMessage", "Projekt został usunięty.", redirectPath);
}

export async function deleteProjectOptimisticAction(projectId: string) {
  try {
    await deleteProject(projectId);
  } catch (error) {
    return {
      error: getProjectErrorMessage(error, "Nie udało się usunąć projektu."),
      ok: false,
    };
  }

  revalidatePath("/projects");

  return { error: null, ok: true };
}
