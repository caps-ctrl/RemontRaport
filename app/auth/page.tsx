import { redirect } from "next/navigation";

type AuthRedirectProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
    mode?: string | string[];
  }>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthRedirect({
  searchParams,
}: AuthRedirectProps) {
  const params = await searchParams;
  const nextParams = new URLSearchParams();
  const error = firstParam(params.error);
  const message = firstParam(params.message);

  if (error) {
    nextParams.set("error", error);
  }

  if (message) {
    nextParams.set("message", message);
  }

  const mode = firstParam(params.mode); // np. "register" albo "login"

  const path = mode === "register" ? "/register" : "/login";

  redirect(`${path}${nextParams.size ? `?${nextParams.toString()}` : ""}`);
}
