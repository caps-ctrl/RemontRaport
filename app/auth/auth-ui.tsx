import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { login, logout, register, signInWithGoogle } from "./actions";

type AuthVariant = "login" | "register";

type AuthSearchParams = Promise<{
  error?: string | string[];
  message?: string | string[];
}>;

type AuthPageProps = {
  searchParams: AuthSearchParams;
  variant: AuthVariant;
};

type IconName =
  | "arrow-left"
  | "arrow-right"
  | "camera"
  | "check"
  | "clock"
  | "folder"
  | "home"
  | "lock"
  | "mail"
  | "message"
  | "shield";

const registerBenefits = [
  {
    icon: "clock" as const,
    title: "Szybkie raporty",
    body: "Generuj profesjonalne raporty PDF w 5 minut na podstawie zdjęć i notatek.",
  },
  {
    icon: "folder" as const,
    title: "Porządek w projektach",
    body: "Wszystkie usterki, zadania i plany uporządkowane w jednym miejscu.",
  },
  {
    icon: "message" as const,
    title: "Przejrzysta komunikacja z klientem",
    body: "Udostępniaj raporty, zbieraj podpisy i buduj zaufanie na każdym etapie prac.",
  },
];

const loginStats = [
  {
    icon: "check" as const,
    title: "Porządek i kontrola",
    body: "Wszystkie informacje z projektów w jednym miejscu",
  },
  {
    icon: "shield" as const,
    title: "Bezpieczne dane",
    body: "Twoje dane są bezpieczne i zawsze dostępne",
  },
  {
    icon: "clock" as const,
    title: "Oszczędność czasu",
    body: "Szybkie raporty i udostępnianie w kilka sekund",
  },
];

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function getAuthStatus() {
  let userEmail: string | null = null;
  let configurationError: string | null = null;

  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    userEmail = user?.email ?? null;
  } catch {
    configurationError =
      "Brakuje konfiguracji Supabase: ustaw SUPABASE_URL i SUPABASE_ANON_KEY albo NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY.";
  }

  return { configurationError, userEmail };
}

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
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
    case "arrow-left":
      return (
        <svg {...common}>
          <path d="M19 12H5" />
          <path d="m11 6-6 6 6 6" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M5 8h3l1.5-2h5L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13.5" r="3.2" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
          <path d="M4 10h16" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="m4 11 8-7 8 7" />
          <path d="M6 10v10h12V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m5 8 7 5 7-5" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M8.4 18.6a8 8 0 1 0-2.9-3l-1 3.9Z" />
          <path d="M8.6 9.2c.8 2.7 2.6 4.5 5.2 5.2l1.4-1.4-2-1-1 .7c-.9-.5-1.6-1.2-2.1-2.1l.7-1-1-2Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.2 2.7 7.7 7 10 4.3-2.3 7-5.8 7-10V6Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
  }
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3"
      aria-label="RemontRaport"
    >
      <span className="grid size-10 place-items-center rounded-[10px] text-blue-600">
        <svg viewBox="0 0 28 28" className="size-8" fill="none" aria-hidden>
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
      <span className="text-[31px] font-extrabold tracking-[-0.05em] text-slate-950">
        Remont<span className="text-blue-600">Raport</span>
      </span>
    </Link>
  );
}

function Header({ variant }: { variant: AuthVariant }) {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1420px] items-center justify-between px-5 md:px-10">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-[15px] font-semibold text-slate-700 transition hover:text-blue-600"
        >
          <Icon
            name={variant === "login" ? "arrow-left" : "home"}
            className="size-5"
          />
          {variant === "login"
            ? "Wróć do strony głównej"
            : "Powrót do strony głównej"}
        </Link>
      </div>
    </header>
  );
}

function ProductPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative rounded-[14px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] ${compact ? "mx-auto mt-7 max-w-[530px] p-3" : "mt-7 p-4"}`}
    >
      <div className="grid grid-cols-[120px_1fr_170px] overflow-hidden rounded-[10px] border border-slate-100 bg-white">
        <aside className="border-r border-slate-100 p-3">
          <div className="text-[12px] font-extrabold text-blue-600">
            RemontRaport
          </div>
          {[
            "Pulpit",
            "Projekty",
            "Raporty",
            "Usterki",
            "Notatki",
            "Zadania",
            "Klienci",
          ].map((item, index) => (
            <div
              key={item}
              className={`mt-2 flex h-7 items-center gap-2 rounded-md px-2 text-[10px] font-semibold ${index === 1 ? "bg-blue-50 text-blue-600" : "text-slate-500"}`}
            >
              <span className="size-2.5 rounded-[2px] border border-current" />
              {item}
            </div>
          ))}
        </aside>
        <main className="bg-slate-50/40 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-extrabold text-slate-950">
              Projekty
            </h3>
            <span className="rounded bg-blue-600 px-3 py-1.5 text-[9px] font-bold text-white">
              + Dodaj projekt
            </span>
          </div>
          <div className="mt-3 h-7 rounded border border-slate-200 bg-white px-2 py-1 text-[9px] text-slate-400">
            Szukaj projektów...
          </div>
          {[
            ["Mieszkanie - Warszawa, Wola", "62%", "bg-blue-600"],
            ["Dom - Konstancin", "38%", "bg-teal-500"],
            ["Biuro - Mokotów", "75%", "bg-blue-600"],
          ].map(([title, progress, color]) => (
            <div
              key={title}
              className="mt-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="text-[11px] font-extrabold text-slate-950">
                {title}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-slate-500">
                Postęp
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={`block h-full rounded-full ${color}`}
                    style={{ width: progress }}
                  />
                </span>
                {progress}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <RoomThumb />
                <RoomThumb tone="light" />
                <RoomThumb tone="warm" />
                <div className="grid h-8 place-items-center rounded bg-slate-100 text-[10px] font-extrabold text-slate-500">
                  +12
                </div>
              </div>
            </div>
          ))}
        </main>
        <aside className="border-l border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-extrabold text-slate-950">
              Raport
            </h3>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
              Gotowy
            </span>
          </div>
          <p className="mt-5 text-[11px] font-extrabold leading-4 text-slate-950">
            Mieszkanie - Warszawa, Wola
          </p>
          <div className="mt-4 rounded-lg border border-slate-200">
            {["Postęp prac 62%", "Zdjęcia 48", "Usterki 7", "Notatki 13"].map(
              (item) => (
                <div
                  key={item}
                  className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold text-slate-600 last:border-0"
                >
                  {item}
                </div>
              ),
            )}
          </div>
          <div className="mt-5 space-y-2">
            {["Nieszczelna płytka", "Zarysowanie ściany", "Brak fugi"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-md border border-slate-100 px-2 py-1.5 text-[9px] font-bold text-slate-700"
                >
                  {item}
                </div>
              ),
            )}
          </div>
          <div className="mt-4 rounded-md bg-blue-600 py-2 text-center text-[10px] font-bold text-white">
            Pobierz raport (PDF)
          </div>
        </aside>
      </div>
      <div className="absolute -bottom-5 -left-4 w-[125px] rounded-[18px] border-4 border-slate-950 bg-white p-2 shadow-[0_18px_38px_rgba(15,23,42,0.25)]">
        <div className="text-center text-[8px] font-bold text-slate-700">
          Mieszkanie - Wola
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <RoomThumb key={index} tone={index % 2 ? "light" : "warm"} />
          ))}
        </div>
        <div className="absolute -bottom-2 -right-2 grid size-6 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
          +
        </div>
      </div>
    </div>
  );
}

function RoomThumb({
  tone = "default",
}: {
  tone?: "default" | "light" | "warm";
}) {
  const colors = {
    default:
      "bg-[linear-gradient(135deg,#d6c6b6_0_48%,#b79b7e_49_61%,#f3eee7_62_100%)]",
    light:
      "bg-[linear-gradient(135deg,#efe8dd_0_43%,#c9b59d_44_58%,#ffffff_59_100%)]",
    warm: "bg-[linear-gradient(135deg,#cbb79f_0_35%,#f6f0e7_36_72%,#a98f73_73_100%)]",
  };

  return (
    <div className={`relative h-8 overflow-hidden rounded ${colors[tone]}`}>
      <span className="absolute bottom-1 left-1 h-2 w-4 rounded-sm bg-white/65" />
      <span className="absolute right-1 top-1 h-4 w-2 rounded-sm bg-slate-900/10" />
    </div>
  );
}

function AlertMessage({
  error,
  message,
  configurationError,
}: {
  error?: string;
  message?: string;
  configurationError?: string | null;
}) {
  if (!error && !message && !configurationError) {
    return null;
  }

  return (
    <div className="space-y-3">
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}
      {configurationError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {configurationError}
        </div>
      ) : null}
    </div>
  );
}

function SessionCard({ userEmail }: { userEmail: string | null }) {
  if (!userEmail) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <p className="text-sm font-semibold text-slate-500">Aktualna sesja</p>
      <p className="mt-1 text-base font-extrabold text-slate-950">
        {userEmail}
      </p>
      <form action={logout} className="mt-4">
        <button className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800">
          Wyloguj
        </button>
      </form>
    </div>
  );
}

function RegisterIntro() {
  return (
    <div>
      <h1 className="max-w-[620px] text-[44px] font-extrabold leading-[1.04] tracking-[-0.055em] text-slate-950 md:text-[58px]">
        Załóż <span className="text-blue-600">darmowe</span> konto
      </h1>
      <p className="mt-5 max-w-[500px] text-[18px] leading-8 text-slate-600">
        Dołącz do firm, które tworzą przejrzyste raporty z remontów w kilka
        minut.
      </p>
      <div className="mt-8 space-y-6">
        {registerBenefits.map((item, index) => (
          <div key={item.title} className="flex max-w-[520px] gap-5">
            <div
              className={`grid size-14 shrink-0 place-items-center rounded-[14px] border bg-white ${index === 2 ? "border-orange-100 text-orange-500 shadow-[0_12px_28px_rgba(249,115,22,0.09)]" : "border-blue-100 text-blue-600 shadow-[0_12px_28px_rgba(37,99,235,0.08)]"}`}
            >
              <Icon name={item.icon} className="size-8" />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold text-slate-950">
                {item.title}
              </h2>
              <p className="mt-1.5 text-[14px] leading-6 text-slate-600">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
      <ProductPanel />
    </div>
  );
}

function LoginIntro() {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-blue-50/30 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)] md:p-10">
      <div className="absolute right-[-80px] top-24 size-56 rounded-full border border-blue-200/80" />
      <div className="absolute bottom-36 left-0 grid grid-cols-6 gap-3 opacity-35">
        {Array.from({ length: 30 }).map((_, index) => (
          <span key={index} className="size-1 rounded-full bg-blue-300" />
        ))}
      </div>
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-[15px] font-bold text-teal-700">
          <Icon name="shield" className="size-5" />
          Twoje projekty. Twoje dane. Pod kontrolą.
        </div>
        <h1 className="mt-7 max-w-[560px] text-[50px] font-extrabold leading-[1.03] tracking-[-0.06em] text-slate-950 md:text-[64px]">
          Wróć do swoich <span className="block text-blue-600">projektów</span>
        </h1>
        <p className="mt-5 max-w-[620px] text-[18px] leading-8 text-slate-600">
          Zarządzaj zdjęciami, notatkami, usterkami i raportami w jednym
          miejscu. Oszczędzaj czas i miej wszystko pod ręką.
        </p>
        <ProductPanel compact />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {loginStats.map((item, index) => (
            <div key={item.title} className="flex gap-3">
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full border ${index === 2 ? "border-orange-200 bg-orange-50 text-orange-500" : index === 1 ? "border-blue-200 bg-blue-50 text-blue-600" : "border-teal-200 bg-teal-50 text-teal-600"}`}
              >
                <Icon name={item.icon} className="size-5" />
              </span>
              <span>
                <span className="block text-[13px] font-extrabold text-slate-950">
                  {item.title}
                </span>
                <span className="mt-1 block text-[12px] leading-5 text-slate-600">
                  {item.body}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormInput({
  autoComplete,
  icon,
  label,
  minLength,
  name,
  placeholder,
  required = true,
  type,
}: {
  autoComplete?: string;
  icon?: IconName;
  label: string;
  minLength?: number;
  name: string;
  placeholder: string;
  required?: boolean;
  type: string;
}) {
  return (
    <label className="block">
      <span className="text-[15px] font-extrabold text-slate-900">{label}</span>
      <span className="mt-3 flex h-[51px] items-center rounded-[8px] border border-slate-200 bg-white px-4 shadow-[0_8px_20px_rgba(15,23,42,0.025)] transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        {icon ? (
          <Icon name={icon} className="mr-3 size-5 shrink-0 text-slate-400" />
        ) : null}
        <input
          autoComplete={autoComplete}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-slate-950 outline-none placeholder:text-slate-400"
          minLength={minLength}
          name={name}
          placeholder={placeholder}
          required={required}
          type={type}
        />
      </span>
    </label>
  );
}

function LoginForm({ disabled }: { disabled?: boolean }) {
  return (
    <form
      action={login}
      className="rounded-[18px] border border-slate-200 bg-white p-8 shadow-[0_22px_70px_rgba(15,23,42,0.10)] md:p-12"
    >
      <fieldset disabled={disabled} className="space-y-7 disabled:opacity-55">
        <div>
          <h2 className="text-[40px] font-extrabold tracking-[-0.045em] text-slate-950">
            Zaloguj się
          </h2>
          <p className="mt-3 text-[17px] leading-7 text-slate-600">
            Witamy ponownie! Zaloguj się do swojego konta.
          </p>
        </div>
        <FormInput
          autoComplete="email"
          icon="mail"
          label="Adres e-mail"
          name="email"
          placeholder="np. jan.kowalski@firma.pl"
          type="email"
        />
        <FormInput
          autoComplete="current-password"
          icon="lock"
          label="Hasło"
          minLength={6}
          name="password"
          placeholder="Wpisz swoje hasło"
          type="password"
        />
        <div className="flex items-center justify-between gap-4 text-[15px] font-semibold">
          <label className="flex items-center gap-3 text-slate-700">
            <input
              className="size-5 rounded border-slate-300 text-blue-600"
              name="remember"
              type="checkbox"
            />
            Zapamiętaj mnie
          </label>
          <Link href="/login" className="font-extrabold text-blue-600">
            Nie pamiętasz hasła?
          </Link>
        </div>
        <button className="flex h-[62px] w-full items-center justify-center gap-3 rounded-[8px] bg-blue-600 px-6 text-[20px] font-extrabold text-white shadow-[0_16px_32px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">
          Zaloguj się
          <Icon name="arrow-right" className="ml-auto size-6" />
        </button>
        <div className="flex items-center gap-5 text-sm font-semibold text-slate-500">
          <span className="h-px flex-1 bg-slate-200" />
          lub
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <button
          className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-3 rounded-[8px] border border-slate-200 bg-white text-[15px] font-extrabold text-slate-900 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          formAction={signInWithGoogle}
          formNoValidate
          type="submit"
        >
          <span className="text-xl text-blue-600">G</span>
          Zaloguj się przez Google
        </button>
        <p className="text-center text-[16px] text-slate-600">
          Nie masz konta?{" "}
          <Link href="/register" className="font-extrabold text-blue-600">
            Załóż darmowe konto
          </Link>
        </p>
      </fieldset>
    </form>
  );
}

function RegisterForm({ disabled }: { disabled?: boolean }) {
  return (
    <form
      action={register}
      className="rounded-[18px] border border-slate-200 bg-white p-8 shadow-[0_22px_70px_rgba(15,23,42,0.10)] md:p-10"
    >
      <fieldset disabled={disabled} className="space-y-6 disabled:opacity-55">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-[-0.04em] text-slate-950">
            Utwórz konto
          </h2>
          <p className="mt-3 text-[16px] leading-7 text-slate-600">
            Wypełnij formularz, aby rozpocząć pracę z RemontRaport.
          </p>
        </div>
        <FormInput
          autoComplete="name"
          label="Imię i nazwisko"
          name="name"
          placeholder="Jan Kowalski"
          type="text"
        />
        <FormInput
          autoComplete="email"
          label="Adres e-mail"
          name="email"
          placeholder="jan.kowalski@example.com"
          type="email"
        />
        <FormInput
          label="Nazwa firmy (opcjonalnie)"
          name="company"
          placeholder="Firma Budowlana Kowalski Sp. z o.o."
          required={false}
          type="text"
        />
        <FormInput
          autoComplete="new-password"
          label="Hasło"
          minLength={6}
          name="password"
          placeholder="Min. 6 znaków"
          type="password"
        />
        <FormInput
          autoComplete="new-password"
          label="Powtórz hasło"
          minLength={6}
          name="passwordConfirm"
          placeholder="Powtórz hasło"
          type="password"
        />
        <label className="flex items-start gap-4 text-[15px] leading-6 text-slate-600">
          <input
            className="mt-0.5 size-6 rounded border-slate-300 text-teal-600"
            required
            type="checkbox"
          />
          <span>
            Akceptuję{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 underline underline-offset-2"
            >
              Regulamin
            </Link>{" "}
            oraz{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 underline underline-offset-2"
            >
              Politykę prywatności
            </Link>
            .
          </span>
        </label>
        <button className="flex h-[62px] w-full items-center justify-center rounded-[8px] bg-blue-600 px-6 text-[20px] font-extrabold text-white shadow-[0_16px_32px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400">
          Załóż darmowe konto
        </button>
        <div className="flex items-center gap-5 text-sm font-semibold text-slate-500">
          <span className="h-px flex-1 bg-slate-200" />
          lub
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <button
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[8px] border border-slate-200 bg-white text-[15px] font-extrabold text-slate-900 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          formAction={signInWithGoogle}
          formNoValidate
          type="submit"
        >
          <span className="text-xl text-blue-600">G</span>
          Kontynuuj przez Google
        </button>
        <p className="text-center text-[16px] text-slate-600">
          Masz już konto?{" "}
          <Link href="/login" className="font-extrabold text-blue-600">
            Zaloguj się
          </Link>
        </p>
      </fieldset>
    </form>
  );
}

export async function AuthPage({ searchParams, variant }: AuthPageProps) {
  const params = await searchParams;
  const error = firstParam(params.error);
  const message = firstParam(params.message);
  const { configurationError, userEmail } = await getAuthStatus();

  if (userEmail) {
    redirect("/dashboard");
  }

  if (variant === "register") {
    return (
      <main className="min-h-screen bg-white text-slate-950">
        <Header variant="register" />
        <section className="mx-auto grid max-w-[1420px] gap-12 px-5 py-10 md:px-10 lg:grid-cols-[1.02fr_0.95fr] lg:py-12">
          <RegisterIntro />
          <div className="self-start">
            <div className="mb-5">
              <AlertMessage
                configurationError={configurationError}
                error={error}
                message={message}
              />
            </div>
            <RegisterForm disabled={Boolean(configurationError)} />
            <div className="mt-5">
              <SessionCard userEmail={userEmail} />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Header variant="login" />
      <section className="mx-auto grid max-w-[1420px] gap-12 px-5 py-10 md:px-10 lg:grid-cols-[1.12fr_0.92fr]">
        <LoginIntro />
        <div className="self-center">
          <div className="mb-5">
            <AlertMessage
              configurationError={configurationError}
              error={error}
              message={message}
            />
          </div>
          <LoginForm disabled={Boolean(configurationError)} />
          <div className="mt-5">
            <SessionCard userEmail={userEmail} />
          </div>
        </div>
      </section>
      <div className="pb-8 text-center text-slate-500">
        <div className="inline-flex items-center gap-3 text-[15px] font-extrabold text-slate-600">
          <Icon name="lock" className="size-5 text-teal-600" />
          Bezpieczne logowanie
        </div>
        <p className="mt-3 text-sm">
          Twoje dane są chronione zgodnie z najwyższymi standardami
          bezpieczeństwa.
        </p>
      </div>
    </main>
  );
}
