import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ProblemSection } from "@/components/HomePage/ProblemSection";
import { SolutionSection } from "@/components/HomePage/SolutionSection";
import { AudienceSection } from "@/components/HomePage/AudienceSection";
import { StepsSection } from "@/components/HomePage/StepsSection";
import { PricingSection } from "@/components/HomePage/PricingSection";
import { Icon } from "@/components/HomePage/HomePage-Ui";
import { Hero } from "@/components/HomePage/Hero";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HomeUser = {
  email: string;
} | null;

const navItems = [
  "Problem",
  "Rozwiązanie",
  "Dla kogo",
  "Jak to działa",
  "Cennik",
];

//ZOSTAWIC - Logo , Header
function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5" aria-label="RemontRaport">
      <span className="grid size-8 place-items-center rounded-[9px] text-blue-600 ring-1 ring-blue-100">
        <svg viewBox="0 0 28 28" className="size-6" fill="none" aria-hidden>
          <path
            d="m5 12 9-8 9 8v11H5Z"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          <path
            d="M10 23v-8h4v8M18 23V11"
            stroke="#0f9f8f"
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[24px] font-extrabold tracking-[-0.04em] text-slate-950">
        Remont<span className="text-blue-600">Raport</span>
      </span>
    </a>
  );
}

function Header({ user }: { user: HomeUser }) {
  const initials = user?.email.slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[58px] max-w-[1260px] items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-[14px] font-semibold text-slate-900 lg:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${slugify(item)}`}
              className="transition hover:text-blue-600"
            >
              {item}
            </a>
          ))}
        </nav>
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="hidden h-10 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-800 shadow-sm transition hover:border-blue-200 hover:text-blue-600 sm:flex"
            >
              <span className="grid size-7 place-items-center rounded-full bg-blue-50 text-[12px] font-extrabold text-blue-600">
                {initials}
              </span>
              Profil
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-[8px] bg-blue-600 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition hover:bg-blue-700"
            >
              Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden items-center gap-2 whitespace-nowrap text-[14px] font-semibold text-slate-900 transition hover:text-blue-600 sm:flex"
            >
              <Icon name="user" className="size-5" />
              Zaloguj się
            </Link>
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-[8px] bg-blue-600 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition hover:bg-blue-700"
            >
              Załóż darmowe konto
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function FinalCta() {
  return (
    <section className="bg-white pb-10 pt-3">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[14px] bg-blue-700 px-7 py-8 text-white shadow-[0_20px_46px_rgba(37,99,235,0.28)] md:px-28">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute -left-12 bottom-0 h-28 w-64 rounded-t-[40px] border border-white/60" />
            <div className="absolute left-[47%] bottom-0 h-24 w-40 border-l border-white/70" />
            <div className="absolute left-[51%] bottom-24 h-12 w-px bg-white/70" />
            <div className="absolute right-7 bottom-0 h-24 w-72 rounded-t-[50px] border border-white/60" />
          </div>
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.04em] text-orange-300">
                Zacznij już dziś
              </p>
              <h2 className="mt-3 text-balance text-[30px] font-extrabold tracking-[-0.045em] md:text-[36px]">
                Oszczędzaj czas i buduj zaufanie klientów
              </h2>
              <p className="mt-2 text-lg font-medium text-blue-50">
                Dołącz do firm, które tworzą przejrzyste raporty z remontów w
                kilka minut.
              </p>
            </div>
            <div>
              <a
                href="/register"
                className="inline-flex h-[58px] items-center justify-center gap-3 rounded-[9px] bg-white px-9 text-base font-extrabold text-blue-700 shadow-[0_18px_32px_rgba(15,23,42,0.16)] transition hover:bg-blue-50"
              >
                Załóż darmowe konto
                <Icon name="arrow" className="size-5" />
              </a>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-semibold text-blue-50">
                <span className="flex items-center gap-1">
                  <Icon name="check" className="size-4 text-emerald-300" />
                  Bez karty kredytowej
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="check" className="size-4 text-emerald-300" />
                  Konfiguracja w 1 minutę
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/ł/g, "l")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

async function getHomeUser(): Promise<HomeUser> {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.email ? { email: user.email } : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const user = await getHomeUser();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Header user={user} />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <AudienceSection />
      <StepsSection />
      <PricingSection />
      <FinalCta />
    </main>
  );
}
