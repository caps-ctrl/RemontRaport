import { revalidatePath } from "next/cache";
import {
  createProject,
  listCurrentUserProjects,
  ProjectError,
  type ProjectPayload,
} from "@/lib/projects";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

export async function GET() {
  try {
    const projects = await listCurrentUserProjects();

    return Response.json({ projects });
  } catch (error) {
    return jsonError(error, "Nie udało się pobrać projektów.");
  }
}

export async function POST(request: Request) {
  try {
    const project = await createProject(await readProjectJson(request));

    revalidatePath("/dashboard");

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Nie udało się dodać projektu.");
  }
}
