import "server-only";

import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const PROFILE_COLUMNS = "id,full_name,company_name,created_at";

export type UserProfile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
};

export type ProfileUpdateValues = {
  company_name: string | null;
  full_name: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof getSupabaseServerClient>>;

export class ProfileError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ProfileError";
    this.status = status;
  }
}

function metadataText(user: User, key: string) {
  const value = user.user_metadata?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id),
    full_name: typeof row.full_name === "string" ? row.full_name : null,
    company_name:
      typeof row.company_name === "string" ? row.company_name : null,
    created_at: typeof row.created_at === "string" ? row.created_at : "",
  };
}

export function makeFallbackProfile(user: User): UserProfile {
  return {
    id: user.id,
    full_name: metadataText(user, "full_name") ?? metadataText(user, "name"),
    company_name:
      metadataText(user, "company_name") ?? metadataText(user, "company"),
    created_at: user.created_at ?? "",
  };
}

export async function getProfileForUser(
  supabase: SupabaseServerClient,
  user: User,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new ProfileError("Nie udało się pobrać profilu.", 500);
  }

  return data ? mapProfile(data) : makeFallbackProfile(user);
}

export async function updateProfileForUser(
  supabase: SupabaseServerClient,
  userId: string,
  values: ProfileUpdateValues,
) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        company_name: values.company_name,
        full_name: values.full_name,
        id: userId,
      },
      { onConflict: "id" },
    )
    .select(PROFILE_COLUMNS)
    .single();

  if (error || !data) {
    throw new ProfileError("Nie udało się zapisać profilu.", 500);
  }

  return mapProfile(data);
}
