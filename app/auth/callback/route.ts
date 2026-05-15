import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL("/login?message=Adres e-mail został potwierdzony.", requestUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=Nie udało się potwierdzić adresu e-mail.", requestUrl.origin),
  );
}
