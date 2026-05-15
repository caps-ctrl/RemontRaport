import type { Metadata } from "next";
import { AuthPage } from "../auth/auth-ui";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Logowanie - RemontRaport",
  description: "Zaloguj się do panelu RemontRaport.",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <AuthPage searchParams={searchParams} variant="login" />;
}
