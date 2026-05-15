import type { Metadata } from "next";
import { AuthPage } from "../auth/auth-ui";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Rejestracja - RemontRaport",
  description: "Załóż darmowe konto RemontRaport.",
};

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return <AuthPage searchParams={searchParams} variant="register" />;
}
