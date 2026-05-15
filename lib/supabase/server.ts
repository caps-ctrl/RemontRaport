import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function readRequiredEnv(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  throw new Error(
    `Missing required environment variable. Expected one of: ${names.join(", ")}`,
  );
}

export async function getSupabaseServerClient() {
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error(
      "Supabase server client is configured for the Node.js runtime.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    readRequiredEnv(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]),
    readRequiredEnv([
      "SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ]),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can read cookies only. Server Actions and Route Handlers can write them.
          }
        },
      },
    },
  );
}
