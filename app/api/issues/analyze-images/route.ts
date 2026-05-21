import { analyzeIssueImages } from "@/lib/ai-image-analysis";
import { getZodErrorMessage, issueImagesSchema } from "@/lib/validation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Brak autoryzacji." }, { status: 401 });
  }

  const formData = await request.formData();
  const images = formData
    .getAll("images")
    .filter((image): image is File => image instanceof File && image.size > 0);
  const parsedImages = issueImagesSchema.safeParse(images);

  if (!parsedImages.success) {
    console.error("Invalid issue images:", parsedImages.error);
    return Response.json(
      { error: getZodErrorMessage(parsedImages.error) },
      { status: 400 },
    );
  }

  const result = await analyzeIssueImages(parsedImages.data);

  if (!result) {
    return Response.json(
      { error: "Nie udało się przygotować opisu AI." },
      { status: 503 },
    );
  }

  return Response.json({
    analysis: result.analysis,
    description: result.analysis.visibleDamage,
    title: result.analysis.title,
  });
}
