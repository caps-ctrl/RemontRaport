import {
  DashboardError,
  getCurrentUserDashboardSummary,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(error: unknown) {
  if (error instanceof DashboardError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  return Response.json(
    { error: "Nie udało się pobrać danych pulpitu." },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const dashboard = await getCurrentUserDashboardSummary();

    return Response.json({ dashboard });
  } catch (error) {
    return jsonError(error);
  }
}
