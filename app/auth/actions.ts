"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type AuthMode = "login" | "register";
type MessageType = "error" | "message";

const authPaths: Record<AuthMode, string> = {
  login: "/login",
  register: "/register",
};

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function redirectWithMessage(
  mode: AuthMode,
  type: MessageType,
  message: string,
): never {
  const params = new URLSearchParams({ [type]: message });

  redirect(`${authPaths[mode]}?${params.toString()}`);
}

function validateCredentials(mode: AuthMode, email: string, password: string) {
  if (!email || !email.includes("@")) {
    redirectWithMessage(mode, "error", "Podaj poprawny adres e-mail.");
  }

  if (password.length < 6) {
    redirectWithMessage(mode, "error", "Hasło musi mieć minimum 6 znaków.");
  }
}

async function getAuthClient(mode: AuthMode) {
  try {
    return await getSupabaseServerClient();
  } catch {
    redirectWithMessage(mode, "error", "Błąd po stronie serwera.");
  }
}

export async function login(formData: FormData) {
  const email = readFormString(formData, "email");
  const password = readFormString(formData, "password");

  validateCredentials("login", email, password);

  const supabase = await getAuthClient("login");
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithMessage(
      "login",
      "error",
      "Nie udało się zalogować. Sprawdź e-mail i hasło.",
    );
  }

  redirectWithMessage("login", "message", "Zalogowano pomyślnie.");
}

export async function register(formData: FormData) {
  const fullName = readFormString(formData, "name");
  const companyName = readFormString(formData, "company");
  const email = readFormString(formData, "email");
  const password = readFormString(formData, "password");
  const passwordConfirm = readFormString(formData, "passwordConfirm");

  validateCredentials("register", email, password);

  if (!fullName) {
    redirectWithMessage("register", "error", "Podaj imię i nazwisko.");
  }

  if (password !== passwordConfirm) {
    redirectWithMessage("register", "error", "Hasła muszą być takie same.");
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const supabase = await getAuthClient("register");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName || null,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirectWithMessage(
      "register",
      "error",
      "Nie udało się utworzyć konta. Spróbuj ponownie.",
    );
  }

  redirectWithMessage(
    "login",
    "message",
    "Konto zostało utworzone. Sprawdź skrzynkę e-mail.",
  );
}

export async function signInWithGoogle() {
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const supabase = await getAuthClient("login");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirectWithMessage(
      "login",
      "error",
      "Nie udało się rozpocząć logowania przez Google.",
    );
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await getAuthClient("login");

  await supabase.auth.signOut();
  redirectWithMessage("login", "message", "Wylogowano pomyślnie.");
}
