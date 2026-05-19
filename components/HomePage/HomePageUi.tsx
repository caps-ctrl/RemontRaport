import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Icon } from "@/components/ui/Icon";

export type HomeUser = {
  email: string;
} | null;

const navItems = [
  "Problem",
  "Rozwiązanie",
  "Dla kogo",
  "Jak to działa",
  "Cennik",
];

export const toneClasses = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  teal: "bg-teal-50 text-teal-600 ring-teal-100",
  orange: "bg-orange-50 text-orange-500 ring-orange-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/ł/g, "l")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

export function HomeHeader({ user }: { user: HomeUser }) {
  const initials = user?.email.slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[58px] max-w-[1260px] items-center justify-between px-4 md:px-6">
        <BrandLogo href="#" framed iconClassName="size-8" />
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

export function FinalCta() {
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

export function SectionHeading({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-28 text-center text-[28px] font-extrabold tracking-[-0.04em] text-slate-950"
    >
      {children}
    </h2>
  );
}

export function LogoMini() {
  return <BrandLogo variant="mini" />;
}

export function RoomThumb({
  variant = 0,
  className = "h-[50px]",
}: {
  variant?: number;
  className?: string;
}) {
  const gradients = [
    "bg-[linear-gradient(135deg,#d8cbbb_0_48%,#b39c83_49_60%,#f5f1eb_61_100%)]",
    "bg-[linear-gradient(135deg,#c9b8a5_0_34%,#efe8dd_35_70%,#a88f74_71_100%)]",
    "bg-[linear-gradient(135deg,#eee8de_0_42%,#b79c7f_43_56%,#d6c7b5_57_100%)]",
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-md ${className} ${gradients[variant]}`}
    >
      <span className="absolute bottom-1.5 left-1.5 h-3 w-6 rounded-sm bg-white/55" />
      <span className="absolute right-1.5 top-1.5 h-5 w-3 rounded-sm bg-slate-900/10" />
    </div>
  );
}
