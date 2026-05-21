import "server-only";

import { createClient } from "@supabase/supabase-js";

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

export function getSupabaseAdminClient() {
  return createClient(
    readRequiredEnv(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]),
    readRequiredEnv(["SUPABASE_SERVICE_ROLE_KEY"]),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
