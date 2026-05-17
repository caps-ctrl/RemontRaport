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

function getProjectErrorMessage(error: unknown, fallback: string) {
  return error instanceof ProjectError ? error.message : fallback;
}

function redirectWithProjectState(
  type: "projectError" | "projectMessage",
  message: string,
): never {
  const params = new URLSearchParams({ [type]: message });

  redirect(`/dashboard?${params.toString()}#projects`);
}

export async function createProjectAction(formData: FormData) {
  try {
    await createProject(readProjectPayload(formData), readProjectImage(formData));
  } catch (error) {
    redirectWithProjectState(
      "projectError",
      getProjectErrorMessage(error, "Nie udało się dodać projektu."),
    );
  }

  revalidatePath("/dashboard");
  redirectWithProjectState("projectMessage", "Projekt został dodany.");
}

export async function updateProjectAction(formData: FormData) {
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
    );
  }

  revalidatePath("/dashboard");
  redirectWithProjectState("projectMessage", "Projekt został zaktualizowany.");
}

export async function deleteProjectAction(formData: FormData) {
  try {
    await deleteProject(readProjectId(formData));
  } catch (error) {
    redirectWithProjectState(
      "projectError",
      getProjectErrorMessage(error, "Nie udało się usunąć projektu."),
    );
  }

  revalidatePath("/dashboard");
  redirectWithProjectState("projectMessage", "Projekt został usunięty.");
}
