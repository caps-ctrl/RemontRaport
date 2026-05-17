import { revalidatePath } from "next/cache";
import {
  deleteProject,
  ProjectError,
  type ProjectPayload,
  updateProject,
} from "@/lib/projects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProjectRouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(error: unknown, fallback: string) {
  if (error instanceof ProjectError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  return Response.json({ error: fallback }, { status: 500 });
}

async function readProjectJson(request: Request): Promise<ProjectPayload> {
  try {
    return (await request.json()) as ProjectPayload;
  } catch {
    throw new ProjectError("Niepoprawny JSON.", 400);
  }
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  try {
    const { id } = await context.params;
    const project = await updateProject(id, await readProjectJson(request));

    revalidatePath("/dashboard");

    return Response.json({ project });
  } catch (error) {
    return jsonError(error, "Nie udało się zaktualizować projektu.");
  }
}

export async function PUT(request: Request, context: ProjectRouteContext) {
  return PATCH(request, context);
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  try {
    const { id } = await context.params;
    const deletedProject = await deleteProject(id);

    revalidatePath("/dashboard");

    return Response.json({ project: deletedProject });
  } catch (error) {
    return jsonError(error, "Nie udało się usunąć projektu.");
  }
}
