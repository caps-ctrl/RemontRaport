import "server-only";

import { getBillingProfileForUser, isSubscriptionActive } from "@/lib/billing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const FREE_PROJECT_LIMIT = 1;
export const FREE_IMAGE_LIMIT = 5;

type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>;

export class PlanUsageError extends Error {
  constructor(message = "Nie udało się sprawdzić limitów planu.") {
    super(message);
    this.name = "PlanUsageError";
  }
}

async function hasActiveProPlan(
  supabase: SupabaseServerClient,
  userId: string,
) {
  try {
    const profile = await getBillingProfileForUser(supabase, userId);

    return isSubscriptionActive(profile.stripe_subscription_status);
  } catch {
    return false;
  }
}

async function countUserProjects(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw new PlanUsageError();
  }

  return count ?? 0;
}

async function countUserProjectImages(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("image_path", "is", null);

  if (error) {
    throw new PlanUsageError();
  }

  return count ?? 0;
}

async function countUserIssueImages(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const { count, error } = await supabase
    .from("project_issue_images")
    .select("id", { count: "exact", head: true })
    .eq("created_by", userId);

  if (error) {
    throw new PlanUsageError();
  }

  return count ?? 0;
}

export async function getUserVisibleImageCount(
  supabase: SupabaseServerClient,
  userId: string,
) {
  const [projectImages, issueImages] = await Promise.all([
    countUserProjectImages(supabase, userId),
    countUserIssueImages(supabase, userId),
  ]);

  return projectImages + issueImages;
}

export async function getFreeProjectLimitMessage(
  supabase: SupabaseServerClient,
  userId: string,
) {
  if (await hasActiveProPlan(supabase, userId)) {
    return null;
  }

  const projects = await countUserProjects(supabase, userId);

  if (projects >= FREE_PROJECT_LIMIT) {
    return `Plan darmowy pozwala mieć tylko ${FREE_PROJECT_LIMIT} projekt. Przejdź na Pro, aby dodać kolejne projekty.`;
  }

  return null;
}

export async function getFreeImageLimitMessage({
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
  if (imagesToAdd <= 0 || (await hasActiveProPlan(supabase, userId))) {
    return null;
  }

  const currentImages = await getUserVisibleImageCount(supabase, userId);
  const nextImages = Math.max(0, currentImages - imagesToRemove) + imagesToAdd;

  if (nextImages > FREE_IMAGE_LIMIT) {
    return `Plan darmowy pozwala dodać maksymalnie ${FREE_IMAGE_LIMIT} zdjęć. Obecnie masz ${currentImages}, a ta operacja dałaby ${nextImages}.`;
  }

  return null;
}
