"use server";

import { revalidatePath } from "next/cache";
import { createProjectIssue, IssueError } from "@/lib/issues";

export type IssueFormState = {
  error?: string;
  issueId?: string;
  message?: string;
  status: "idle" | "success" | "error";
};

export type CreateIssueFormAction = (
  state: IssueFormState,
  formData: FormData,
) => Promise<IssueFormState>;

export async function createIssueAction(
  projectId: string,
  _state: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  try {
    const issue = await createProjectIssue(projectId, formData);

    revalidatePath(`/projects/${projectId}`);

    return {
      issueId: issue.id,
      message: "Usterka została zapisana.",
      status: "success",
    };
  } catch (error) {
    return {
      error:
        error instanceof IssueError
          ? error.message
          : "Nie udało się zapisać usterki.",
      status: "error",
    };
  }
}
