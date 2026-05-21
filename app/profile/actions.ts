"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProfileForUser, ProfileError } from "@/lib/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  getZodErrorMessage,
  passwordChangeSchema,
  profileUpdateSchema,
} from "@/lib/validation";

type ProfileMessageScope = "password" | "profile";
type ProfileMessageType = "Error" | "Message";

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(
  scope: ProfileMessageScope,
  type: ProfileMessageType,
  message: string,
): never {
  const params = new URLSearchParams({ [`${scope}${type}`]: message });

  redirect(`/profile?${params.toString()}`);
}

async function getProfileActionContext(scope: ProfileMessageScope) {
  let supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>;

  try {
    supabase = await getSupabaseServerClient();
  } catch {
    redirectWithMessage(scope, "Error", "Błąd po stronie serwera.");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirectWithMessage(scope, "Error", "Brak autoryzacji.");
  }

  return { supabase, user };
}

export async function updateProfileAction(formData: FormData) {
  const parsed = profileUpdateSchema.safeParse({
    company_name: readFormString(formData, "company_name"),
    full_name: readFormString(formData, "full_name"),
  });

  if (!parsed.success) {
    redirectWithMessage("profile", "Error", getZodErrorMessage(parsed.error));
  }

  const { supabase, user } = await getProfileActionContext("profile");

  try {
    await updateProfileForUser(supabase, user.id, parsed.data);
    await supabase.auth.updateUser({
      data: {
        company_name: parsed.data.company_name,
        full_name: parsed.data.full_name,
      },
    });
  } catch (error) {
    if (error instanceof ProfileError) {
      redirectWithMessage("profile", "Error", error.message);
    }

    redirectWithMessage("profile", "Error", "Nie udało się zapisać profilu.");
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirectWithMessage("profile", "Message", "Dane profilu zapisane.");
}

export async function changePasswordAction(formData: FormData) {
  const parsed = passwordChangeSchema.safeParse({
    current_password: readFormString(formData, "current_password"),
    password: readFormString(formData, "password"),
    passwordConfirm: readFormString(formData, "passwordConfirm"),
  });

  if (!parsed.success) {
    redirectWithMessage("password", "Error", getZodErrorMessage(parsed.error));
  }

  const { supabase, user } = await getProfileActionContext("password");
  const email = user.email;

  if (!email) {
    redirectWithMessage(
      "password",
      "Error",
      "Nie można zmienić hasła dla konta bez adresu e-mail.",
    );
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.current_password,
  });

  if (signInError) {
    redirectWithMessage("password", "Error", "Aktualne hasło jest niepoprawne.");
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    redirectWithMessage("password", "Error", "Nie udało się zmienić hasła.");
  }

  revalidatePath("/profile");
  redirectWithMessage("password", "Message", "Hasło zostało zmienione.");
}
