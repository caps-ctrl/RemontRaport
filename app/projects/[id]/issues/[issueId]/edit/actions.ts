"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { IssueFormState } from "@/app/projects/[id]/issues/new/actions";
import { IssueError, updateProjectIssue } from "@/lib/issues";

export async function updateIssueAction(
  projectId: string,
  issueId: string,
  _state: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  try {
    await updateProjectIssue(projectId, issueId, formData);

    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/issues/${issueId}/edit`);
  } catch (error) {
    return {
      error:
        error instanceof IssueError
          ? error.message
          : "Nie udało się zaktualizować usterki.",
      status: "error",
    };
  }

  redirect(`/projects/${projectId}`);
}
