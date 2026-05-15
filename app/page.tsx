import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type IconName =
  | "user"
  | "arrow"
  | "play"
  | "check"
  | "shield"
  | "lock"
  | "image"
  | "message"
  | "users"
  | "folder"
  | "camera"
  | "alert"
  | "file"
  | "building"
  | "helmet"
  | "drill"
  | "investor"
  | "download"
  | "gift";

type IconProps = {
  name: IconName;
  className?: string;
};

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

const trustItems = [
  { label: "Oszczędzaj czas", icon: "check" as const, tone: "emerald" },
  { label: "Profesjonalny wizerunek", icon: "shield" as const, tone: "blue" },
  { label: "Bezpieczne dane", icon: "lock" as const, tone: "orange" },
];

const problemCards = [
  {
    icon: "image" as const,
    title: "Bałagan w zdjęciach",
    body: "Zdjęcia z placu budowy są wszędzie: w telefonach, galeriach i na dyskach. Trudno cokolwiek szybko znaleźć.",
    tone: "teal",
  },
  {
    icon: "message" as const,
    title: "Raporty rozproszone po WhatsAppie",
    body: "Notatki i ustalenia giną w wiadomościach. Trudno odtworzyć przebieg prac i udowodnić postępy.",
    tone: "orange",
  },
  {
    icon: "users" as const,
    title: "Trudna komunikacja postępów",
    body: "Klienci pytają o status, a przygotowanie raportu zajmuje zbyt dużo czasu i wybija z pracy.",
    tone: "blue",
  },
];

const solutionCards = [
  {
    icon: "folder" as const,
    title: "Wszystko w jednym miejscu",
    body: "Zdjęcia, notatki, usterki i plany uporządkowane w projektach.",
    tone: "teal",
    label: "01",
  },
  {
    icon: "camera" as const,
    title: "Szybkie dodawanie",
    body: "Rób zdjęcia w aplikacji, dodawaj notatki i opis z telefonu lub z komputera.",
    tone: "blue",
    label: "02",
  },
  {
    icon: "alert" as const,
    title: "Pełna kontrola usterek",
    body: "Oznaczaj usterki na zdjęciach, śledź ich status i przypisuj odpowiedzialnych.",
    tone: "orange",
    label: "03",
  },
  {
    icon: "file" as const,
    title: "Raport gotowy w 5 minut",
    body: "Generuj przejrzyste raporty PDF z postępów, notatek i usterek w jednym kliknięciu.",
    tone: "teal",
    label: "04",
  },
];

const audienceCards = [
  {
    icon: "building" as const,
    title: "Firmy remontowe",
    body: "Zorganizuj projekty i raporty, usprawnij pracę całego zespołu i oszczędzaj czas.",
    tone: "blue",
  },
  {
    icon: "helmet" as const,
    title: "Kierownicy projektów",
    body: "Miej pełny wgląd w postępy, zadania i usterki na wszystkich budowach.",
    tone: "teal",
  },
  {
    icon: "drill" as const,
    title: "Ekipy wykończeniowe",
    body: "Łatwo dokumentuj prace, komunikuj się z biurem i unikaj nieporozumień.",
    tone: "orange",
  },
  {
    icon: "investor" as const,
    title: "Inwestorzy / koordynatorzy",
    body: "Otrzymuj przejrzyste raporty i miej pewność, że projekt idzie zgodnie z planem.",
    tone: "blue",
  },
];

const steps = [
  {
    icon: "folder" as const,
    title: "Dodaj projekt",
    body: "Wprowadź podstawowe dane projektu i zaproś zespół.",
  },
  {
    icon: "camera" as const,
    title: "Wrzuć zdjęcia i notatki",
    body: "Dodawaj zdjęcia prosto z telefonu, pisz notatki i opisuj prace.",
  },
  {
    icon: "alert" as const,
    title: "Oznacz usterki",
    body: "Zaznacz usterki na zdjęciach, ustal status i przypisz osobę.",
  },
  {
    icon: "file" as const,
    title: "Wygeneruj raport i wyślij klientowi",
    body: "Raport PDF gotowy w 5 minut. Wyślij mailem jednym kliknięciem.",
  },
];

const reportBenefits = [
  "Twoje logo i dane firmy",
  "Podsumowanie postępów",
  "Galerie zdjęć z opisami",
  "Lista usterek ze statusami",
  "Profesjonalny PDF gotowy do wysyłki",
];

const starterFeatures = [
  "1 projekt",
  "Do 100 zdjęć miesięcznie",
  "Podstawowe raporty PDF",
];
const proFeatures = [
  "Nielimitowane projekty",
  "Nielimitowane zdjęcia",
  "Zaawansowane raporty i usterki",
  "Priorytetowe wsparcie",
];

const toneClasses = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  teal: "bg-teal-50 text-teal-600 ring-teal-100",
  orange: "bg-orange-50 text-orange-500 ring-orange-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
};

const solutionAccentClasses = {
  blue: {
    surface: "from-blue-50/95 via-white to-white",
    icon: "bg-blue-600 text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]",
    line: "bg-blue-600",
    label: "text-blue-600",
  },
  teal: {
    surface: "from-teal-50/95 via-white to-white",
    icon: "bg-teal-600 text-white shadow-[0_14px_28px_rgba(13,148,136,0.18)]",
    line: "bg-teal-500",
    label: "text-teal-600",
  },
  orange: {
    surface: "from-orange-50/95 via-white to-white",
    icon: "bg-orange-500 text-white shadow-[0_14px_28px_rgba(249,115,22,0.18)]",
    line: "bg-orange-500",
    label: "text-orange-500",
  },
  emerald: {
    surface: "from-emerald-50/95 via-white to-white",
    icon: "bg-emerald-600 text-white shadow-[0_14px_28px_rgba(5,150,105,0.18)]",
    line: "bg-emerald-500",
    label: "text-emerald-600",
  },
};

function Icon({ name, className = "" }: IconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "user":
      return (
        <svg {...common}>
          <path d="M19 20a7 7 0 0 0-14 0" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m9 7 8 5-8 5Z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.2 2.7 7.7 7 10 4.3-2.3 7-5.8 7-10V6Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="6" y="10" width="12" height="10" rx="2" />
          <path d="M9 10V7a3 3 0 0 1 6 0v3" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="m3 16 4.2-4.2a2 2 0 0 1 2.8 0l1.6 1.6 2.1-2.1a2 2 0 0 1 2.8 0L21 15.8" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M8.4 18.6a8 8 0 1 0-2.9-3l-1 3.9Z" />
          <path d="M8.6 9.2c.8 2.7 2.6 4.5 5.2 5.2l1.4-1.4-2-1-1 .7c-.9-.5-1.6-1.2-2.1-2.1l.7-1-1-2Z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 19a5 5 0 0 0-10 0" />
          <circle cx="11" cy="8" r="3" />
          <path d="M21 19a4 4 0 0 0-4-4" />
          <path d="M17 5.2a3 3 0 0 1 0 5.6" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
          <path d="M4 10h16" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M5 8h3l1.5-2h5L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13.5" r="3.2" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="m12 3 10 18H2Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7Z" />
          <path d="M14 3v5h5" />
          <path d="M9.5 12h5" />
          <path d="M9.5 16h5" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V5l8-2 8 2v16" />
          <path d="M9 21v-5h6v5" />
          <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      );
    case "helmet":
      return (
        <svg {...common}>
          <path d="M4 14a8 8 0 0 1 16 0" />
          <path d="M3 14h18" />
          <path d="M8 14v-3a4 4 0 0 1 8 0v3" />
          <path d="M6 18h12" />
        </svg>
      );
    case "drill":
      return (
        <svg {...common}>
          <path d="M4 8h10v5H4Z" />
          <path d="M14 10.5h4l3-2v4l-3-2" />
          <path d="M8 13v6h4v-6" />
          <path d="M6 6V4h5v2" />
        </svg>
      );
    case "investor":
      return (
        <svg {...common}>
          <path d="M7 20a5 5 0 0 1 10 0" />
          <circle cx="12" cy="9" r="3" />
          <path d="M8.5 7.5 12 4l3.5 3.5" />
          <path d="M5 11h14" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 4v10" />
          <path d="m8 10 4 4 4-4" />
          <path d="M5 20h14" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <path d="M4 11h16v10H4Z" />
          <path d="M12 11v10" />
          <path d="M3 7h18v4H3Z" />
          <path d="M12 7H8.8A2.3 2.3 0 1 1 12 3.8Z" />
          <path d="M12 7h3.2A2.3 2.3 0 1 0 12 3.8Z" />
        </svg>
      );
  }
}

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

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1260px] items-center gap-10 px-5 py-8 md:px-8 md:py-6 lg:grid-cols-[0.66fr_1fr] lg:gap-9">
        <div className="relative z-10 max-w-[560px]">
          <h1 className="text-balance text-[44px] font-extrabold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-[58px] lg:text-[56px]">
            <span className="block lg:whitespace-nowrap">
              Raporty z remontu
            </span>
            <span className="block text-blue-600">w 5 minut</span>
          </h1>
          <p className="mt-7 max-w-[500px] text-lg leading-8 text-slate-600">
            Dodawaj zdjęcia, notatki i usterki z prac remontowych. Generuj
            przejrzysty raport dla klienta bez szukania zdjęć po telefonie i
            WhatsAppie.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="/register"
              className="inline-flex h-[58px] items-center justify-center gap-3 whitespace-nowrap rounded-[9px] bg-blue-600 px-8 text-base font-bold text-white shadow-[0_18px_32px_rgba(37,99,235,0.25)] transition hover:bg-blue-700"
            >
              Załóż darmowe konto
              <Icon name="arrow" className="size-5" />
            </a>
            <a
              href="#jak-to-dziala"
              className="inline-flex h-[58px] items-center justify-center gap-3 whitespace-nowrap rounded-[9px] border border-slate-200 bg-white px-8 text-base font-bold text-slate-900 shadow-[0_12px_26px_rgba(15,23,42,0.07)] transition hover:border-blue-200 hover:text-blue-600"
            >
              Zobacz demo
              <Icon name="play" className="size-5" />
            </a>
          </div>
          <div className="mt-10 grid gap-4 text-[13px] font-semibold text-slate-700 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full ring-1 ${toneClasses[item.tone as keyof typeof toneClasses]}`}
                >
                  <Icon name={item.icon} className="size-5" />
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ProductMockup />
      </div>
    </section>
  );
}

function ProductMockup() {
  return (
    <div className="relative min-h-[340px] lg:min-h-[400px]">
      <div className="absolute inset-x-0 top-7 mx-auto h-[330px] max-w-[660px] rounded-[28px] bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.12),transparent_58%)] blur-3xl" />
      <div className="relative ml-auto grid max-w-[625px] grid-cols-[126px_minmax(0,1fr)_188px] overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.13)] max-md:scale-[0.82] max-md:origin-top-right max-sm:scale-[0.68]">
        <aside className="min-h-[390px] border-r border-slate-200 bg-white p-3.5">
          <LogoMini />
          <div className="mt-5 space-y-1.5">
            {[
              "Pulpit",
              "Projekty",
              "Raporty",
              "Usterki",
              "Notatki",
              "Zadania",
              "Klienci",
              "Ustawienia",
            ].map((item, index) => (
              <div
                key={item}
                className={`flex h-8 items-center gap-2.5 rounded-md px-3 text-[11px] font-semibold ${
                  index === 0 ? "bg-blue-50 text-blue-600" : "text-slate-500"
                }`}
              >
                <span className="size-3 rounded-[3px] border border-current" />
                {item}
              </div>
            ))}
          </div>
          <div className="absolute bottom-5 left-4 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="grid size-5 place-items-center rounded-full border border-slate-300 text-[10px]">
              ?
            </span>
            Pomoc
          </div>
        </aside>
        <main className="bg-slate-50/40 p-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold text-slate-950">
              Projekty
            </h2>
            <button className="h-8 rounded-md bg-blue-600 px-3 text-[10px] font-bold text-white">
              + Dodaj
            </button>
          </div>
          <div className="mt-2.5 h-8 rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-medium text-slate-400">
            Szukaj projektów...
          </div>
          <div className="mt-3 space-y-2.5">
            <ProjectRow
              title="Mieszkanie - Warszawa, Wola"
              progress={62}
              count="+12"
            />
            <ProjectRow
              title="Dom - Konstancin"
              progress={38}
              count="+8"
              tone="teal"
            />
            <ProjectRow title="Biuro - Mokotów" progress={75} count="+15" />
          </div>
        </main>
        <aside className="border-l border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-slate-950">
              Raport
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
              Gotowy
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-extrabold leading-4 text-slate-950">
              Mieszkanie - Warszawa, Wola
            </p>
            <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">
              Okres raportu: 01.05.2024 - 15.05.2024
            </p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200">
            {[
              ["Postęp prac", "62%"],
              ["Zdjęcia", "48"],
              ["Usterki", "7"],
              ["Notatki", "13"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-100 px-3 py-2 last:border-0"
              >
                <span className="text-[10px] font-semibold text-slate-500">
                  {label}
                </span>
                <span className="text-[11px] font-extrabold text-slate-950">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <h3 className="mt-4 text-[11px] font-extrabold text-slate-950">
            Ostatnie usterki
          </h3>
          <div className="mt-2 space-y-1.5">
            <IssueRow
              dot="bg-red-500"
              title="Nierówna płytka przy oknie"
              status="Nowe"
            />
            <IssueRow
              dot="bg-yellow-500"
              title="Zarysowanie ściany"
              status="W trakcie"
              tone="yellow"
            />
            <IssueRow
              dot="bg-orange-400"
              title="Brak fugi w narożniku"
              status="Zakończone"
              tone="emerald"
            />
          </div>
          <button className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-[10px] font-bold text-white">
            <Icon name="download" className="size-4" />
            Pobierz raport (PDF)
          </button>
        </aside>
      </div>
      <PhoneMockup />
    </div>
  );
}

function LogoMini() {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-extrabold tracking-[-0.03em] text-slate-950">
      <span className="grid size-5 place-items-center text-blue-600">
        <svg viewBox="0 0 28 28" className="size-5" fill="none" aria-hidden>
          <path
            d="m5 12 9-8 9 8v11H5Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 23v-8h4v8M18 23V11"
            stroke="#0f9f8f"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Remont<span className="-ml-1 text-blue-600">Raport</span>
    </div>
  );
}

function ProjectRow({
  title,
  progress,
  count,
  tone = "blue",
}: {
  title: string;
  progress: number;
  count: string;
  tone?: "blue" | "teal";
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <h3 className="truncate pr-2 text-[11px] font-extrabold leading-4 text-slate-950">
          {title}
        </h3>
        <span className="text-slate-300">⋮</span>
      </div>
      <div className="mt-2 flex items-center gap-2.5">
        <span className="text-[10px] font-bold text-slate-500">Postęp</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${tone === "teal" ? "bg-teal-500" : "bg-blue-600"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-extrabold text-slate-700">
          {progress}%
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
        <RoomThumb className="h-[32px]" />
        <RoomThumb className="h-[32px]" variant={1} />
        <RoomThumb className="h-[32px]" variant={2} />
        <div className="grid h-[32px] place-items-center rounded-md bg-slate-100 text-[11px] font-extrabold text-slate-500">
          {count}
        </div>
      </div>
    </article>
  );
}

function RoomThumb({
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

function IssueRow({
  dot,
  title,
  status,
  tone = "orange",
}: {
  dot: string;
  title: string;
  status: string;
  tone?: "orange" | "yellow" | "emerald";
}) {
  const badge = {
    orange: "bg-orange-50 text-orange-500",
    yellow: "bg-yellow-50 text-yellow-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 p-1.5">
      <span className={`size-2.5 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-extrabold text-slate-800">
          {title}
        </p>
        <p className="text-[9px] font-medium text-slate-500">Łazienka</p>
      </div>
      <span
        className={`rounded px-2 py-1 text-[9px] font-extrabold ${badge[tone]}`}
      >
        {status}
      </span>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="absolute bottom-5 left-[20%] w-[108px] rounded-[21px] border-4 border-slate-950 bg-white p-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.28)] sm:left-[16%] lg:left-[12%] lg:w-[116px]">
      <div className="flex items-center justify-between text-[8px] font-bold text-slate-700">
        <span>‹</span>
        <span>Mieszkanie - Wola</span>
        <span>⋮</span>
      </div>
      <div className="mt-3 flex gap-2 border-b border-slate-100 text-[8px] font-bold text-slate-500">
        <span className="border-b-2 border-blue-600 pb-1 text-blue-600">
          Zdjęcia
        </span>
        <span>Notatki</span>
        <span>Usterki</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <RoomThumb
            key={index}
            className="h-[31px]"
            variant={(index % 3) as 0 | 1 | 2}
          />
        ))}
      </div>
      <div className="absolute -bottom-2 -right-2 grid size-6 place-items-center rounded-full bg-blue-600 text-base font-bold text-white">
        +
      </div>
    </div>
  );
}

function SectionHeading({
  children,
  id,
}: {
  children: React.ReactNode;
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

function FeatureCard({
  icon,
  title,
  body,
  tone,
  label,
}: {
  icon: IconName;
  title: string;
  body: string;
  tone: keyof typeof toneClasses;
  label?: string;
}) {
  const accent = solutionAccentClasses[tone];

  return (
    <article
      className={`group relative min-h-[208px] overflow-hidden rounded-[16px] border border-slate-200 bg-gradient-to-br ${accent.surface} p-5 shadow-[0_18px_42px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_54px_rgba(15,23,42,0.09)]`}
    >
      <div
        className={`absolute inset-x-5 top-0 h-1 rounded-b-full ${accent.line}`}
      />
      <div className="absolute -right-10 -top-10 size-28 rounded-full bg-white/75 blur-2xl transition duration-300 group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`grid size-14 place-items-center rounded-[15px] ${accent.icon}`}
        >
          <Icon name={icon} className="size-7" />
        </div>
        {label ? (
          <span
            className={`font-mono text-[12px] font-bold tracking-[0.02em] ${accent.label}`}
          >
            {label}
          </span>
        ) : null}
      </div>
      <h3 className="relative mt-7 text-[17px] font-extrabold leading-6 tracking-[-0.025em] text-slate-950">
        {title}
      </h3>
      <p className="relative mt-3 text-[14px] leading-6 text-slate-600">
        {body}
      </p>
      <div className="relative mt-5 flex items-center gap-2 text-[12px] font-extrabold text-slate-400">
        <span className={`h-px flex-1 ${accent.line} opacity-40`} />
        <span className={accent.label}>RemontRaport</span>
      </div>
    </article>
  );
}

function ProblemSection() {
  return (
    <section className="bg-white py-7 md:py-9">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <SectionHeading id="problem">Problem</SectionHeading>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {problemCards.map((card) => (
            <article
              key={card.title}
              className="flex gap-5 rounded-[10px] border border-slate-100 bg-slate-50/70 p-6 shadow-[0_14px_32px_rgba(15,23,42,0.03)]"
            >
              <div
                className={`grid size-16 shrink-0 place-items-center rounded-[15px] ring-1 ${toneClasses[card.tone as keyof typeof toneClasses]}`}
              >
                <Icon name={card.icon} className="size-9" />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-3 text-[14px] leading-6 text-slate-600">
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="bg-white py-6 md:py-8">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <SectionHeading id="rozwiazanie">Rozwiązanie</SectionHeading>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {solutionCards.map((card) => (
              <FeatureCard
                key={card.title}
                {...card}
                tone={card.tone as keyof typeof toneClasses}
              />
            ))}
          </div>
          <ReportPreview />
        </div>
      </div>
    </section>
  );
}

function ReportPreview() {
  return (
    <article className="rounded-[14px] bg-teal-50 p-7 shadow-[inset_0_0_0_1px_rgba(20,184,166,0.16)]">
      <h3 className="text-[19px] font-extrabold tracking-[-0.025em] text-slate-950">
        Przejrzyste raporty, które robią wrażenie
      </h3>
      <div className="mt-6 grid gap-6 sm:grid-cols-[160px_1fr] lg:grid-cols-[170px_1fr]">
        <div className="rounded-[9px] bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.11)]">
          <LogoMini />
          <p className="mt-4 text-[12px] font-extrabold text-slate-950">
            Raport z remontu
          </p>
          <p className="text-[11px] font-semibold text-slate-500">
            Mieszkanie - Wola
          </p>
          <div className="mt-3 aspect-[1.42] overflow-hidden rounded-md">
            <RoomThumb className="h-full" />
          </div>
          <div className="mt-3 h-2 rounded bg-slate-100" />
          <div className="mt-2 h-2 w-2/3 rounded bg-slate-100" />
        </div>
        <ul className="space-y-4">
          {reportBenefits.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[14px] font-semibold leading-6 text-slate-700"
            >
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-teal-500 text-teal-600">
                <Icon name="check" className="size-3.5" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function AudienceSection() {
  return (
    <section className="bg-white py-6 md:py-8">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <SectionHeading id="dla-kogo">Dla kogo</SectionHeading>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {audienceCards.map((card) => (
            <article
              key={card.title}
              className="flex gap-5 rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_12px_26px_rgba(15,23,42,0.035)]"
            >
              <div
                className={`grid size-14 shrink-0 place-items-center rounded-[14px] bg-white ${card.tone === "orange" ? "text-orange-500" : card.tone === "teal" ? "text-teal-600" : "text-blue-600"}`}
              >
                <Icon name={card.icon} className="size-10" />
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-slate-600">
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  return (
    <section className="bg-white py-6 md:py-8">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <SectionHeading id="jak-to-dziala">Jak to działa</SectionHeading>
        <div className="mt-5 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  return (
    <>
      <article className="flex min-h-[108px] gap-5 rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
        <div className="relative grid size-14 shrink-0 place-items-center rounded-[12px] bg-blue-50 text-blue-600">
          <Icon name={step.icon} className="size-9" />
          <span className="absolute -left-2 -top-2 grid size-8 place-items-center rounded-full bg-blue-600 text-[16px] font-extrabold text-white">
            {index + 1}
          </span>
        </div>
        <div>
          <h3 className="text-[15px] font-extrabold text-slate-950">
            {index + 1}. {step.title}
          </h3>
          <p className="mt-2 text-[13px] leading-5 text-slate-600">
            {step.body}
          </p>
        </div>
      </article>
      {index < steps.length - 1 && (
        <div
          className="hidden text-3xl font-light text-slate-300 md:block"
          aria-hidden
        >
          →
        </div>
      )}
    </>
  );
}

function PricingSection() {
  return (
    <section className="bg-white py-6 md:py-8">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <SectionHeading id="cennik">Cennik</SectionHeading>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          <PriceCard
            name="Starter"
            price="0"
            badge="Darmowy"
            features={starterFeatures}
          />
          <PriceCard
            name="Pro"
            price="59"
            badge="Najpopularniejszy"
            highlighted
            features={proFeatures}
          />
          <article className="flex min-h-[170px] items-center gap-5 rounded-[10px] border border-slate-100 bg-slate-50/80 p-7 shadow-[0_12px_26px_rgba(15,23,42,0.035)]">
            <div className="grid size-14 shrink-0 place-items-center rounded-[13px] bg-teal-50 text-teal-600 ring-1 ring-teal-100">
              <Icon name="gift" className="size-8" />
            </div>
            <div>
              <h3 className="text-[21px] font-extrabold tracking-[-0.03em] text-slate-950">
                Zacznij za darmo
              </h3>
              <p className="mt-3 text-[14px] leading-6 text-slate-600">
                Załóż darmowe konto i przetestuj RemontRaport. Płatne plany
                odblokowują więcej projektów, zaawansowane raporty i funkcje dla
                zespołów.
              </p>
              <a
                href="#cennik"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
              >
                Zobacz pełny cennik
                <Icon name="arrow" className="size-4" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  name,
  price,
  badge,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  badge: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <article
      className={`rounded-[10px] bg-white p-7 shadow-[0_12px_26px_rgba(15,23,42,0.035)] ${
        highlighted ? "border-2 border-blue-600" : "border border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3
          className={`text-[21px] font-extrabold tracking-[-0.03em] ${highlighted ? "text-blue-600" : "text-slate-950"}`}
        >
          {name}
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${
            highlighted
              ? "bg-orange-50 text-orange-500 ring-1 ring-orange-200"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {badge}
        </span>
      </div>
      <div className="mt-5 flex items-end gap-2">
        {highlighted && (
          <span className="pb-2 text-[15px] font-bold text-slate-500">od</span>
        )}
        <span className="text-[40px] font-extrabold leading-none tracking-[-0.05em] text-slate-950">
          {price}
        </span>
        <span className="pb-2 text-[22px] font-extrabold text-slate-950">
          zł
        </span>
        <span className="pb-2 text-[12px] font-semibold text-slate-500">
          {highlighted ? "/ miesiąc" : "na zawsze"}
        </span>
      </div>
      <ul className="mt-6 space-y-2.5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-[14px] font-semibold text-slate-600"
          >
            <Icon name="check" className="size-4 text-blue-600" />
            {feature}
          </li>
        ))}
      </ul>
    </article>
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
