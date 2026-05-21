import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { AppSidebar } from "@/app/app-sidebar";
import {
  changePasswordAction,
  updateProfileAction,
} from "@/app/profile/actions";
import {
  getProfileForUser,
  makeFallbackProfile,
  type UserProfile,
} from "@/lib/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Profil - RemontRaport",
  description: "Profil i ustawienia konta RemontRaport.",
};

type ProfilePageProps = {
  searchParams: Promise<{
    passwordError?: string | string[];
    passwordMessage?: string | string[];
    profileError?: string | string[];
    profileMessage?: string | string[];
  }>;
};

type IconName = "building" | "lock" | "mail" | "shield" | "user";

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function getProfileUser() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user;
  } catch {
    return null;
  }
}

async function getProfileData(user: User): Promise<{
  error: string | null;
  profile: UserProfile;
}> {
  try {
    const supabase = await getSupabaseServerClient();

    return {
      error: null,
      profile: await getProfileForUser(supabase, user),
    };
  } catch {
    return {
      error: "Nie udało się pobrać danych profilu.",
      profile: makeFallbackProfile(user),
    };
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Brak danych";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Brak danych";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function Icon({
  className = "",
  name,
}: {
  className?: string;
  name: IconName;
}) {
  const common = {
    "aria-hidden": true,
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.85,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V5l8-2 8 2v16" />
          <path d="M9 21v-5h6v5" />
          <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" />
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
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.2 2.7 7.7 7 10 4.3-2.3 7-5.8 7-10V6Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path d="M19 20a7 7 0 0 0-14 0" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
      );
  }
}

function Logo() {
  return (
    <Link
      aria-label="RemontRaport"
      className="flex items-center gap-2.5"
      href="/"
    >
      <span className="grid size-8 place-items-center text-blue-600">
        <svg viewBox="0 0 28 28" className="size-7" fill="none" aria-hidden>
          <path
            d="m5 12 9-8 9 8v11H5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2.3"
          />
          <path
            d="M10 23v-8h4v8M18 23V11"
            stroke="#0f9f8f"
            strokeLinejoin="round"
            strokeWidth="2.3"
          />
        </svg>
      </span>
      <span className="text-[25px] font-extrabold tracking-[-0.045em] text-slate-950">
        Remont<span className="text-blue-600">Raport</span>
      </span>
    </Link>
  );
}

function Sidebar() {
  return <AppSidebar activeItem="profile" />;
}

function Topbar({
  email,
  initials,
  name,
}: {
  email: string;
  initials: string;
  name: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Logo />
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700">
          {initials}
        </span>
        <div className="hidden md:block">
          <p className="text-[15px] font-extrabold text-slate-950">{name}</p>
          <p className="max-w-[190px] truncate text-sm text-slate-500">
            {email}
          </p>
        </div>
      </div>
    </header>
  );
}

function Message({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) {
    return null;
  }

  return (
    <div
      className={`rounded-[10px] border px-4 py-3 text-sm font-extrabold ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ?? message}
    </div>
  );
}

function Card({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: IconName;
  title: string;
}) {
  return (
    <section className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.035)]">
      <h2 className="flex items-center gap-3 text-[18px] font-extrabold tracking-[-0.02em] text-slate-950">
        <Icon name={icon} className="size-5 text-slate-700" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  autoComplete,
  defaultValue = "",
  help,
  label,
  minLength,
  name,
  readOnly = false,
  required = false,
  type = "text",
  wide = false,
}: {
  autoComplete?: string;
  defaultValue?: string;
  help?: string;
  label: string;
  minLength?: number;
  name?: string;
  readOnly?: boolean;
  required?: boolean;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="text-[13px] font-extrabold text-slate-900">
        {label}
      </span>
      <input
        autoComplete={autoComplete}
        className={`mt-2 h-10 w-full rounded-[7px] border border-slate-200 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
          readOnly ? "bg-slate-50" : "bg-white"
        }`}
        defaultValue={defaultValue}
        minLength={minLength}
        name={name}
        readOnly={readOnly}
        required={required}
        type={type}
      />
      {help ? (
        <span className="mt-1 block text-xs font-medium text-slate-500">
          {help}
        </span>
      ) : null}
    </label>
  );
}

function UserDataCard({
  companyName,
  email,
  error,
  initials,
  message,
  name,
}: {
  companyName: string;
  email: string;
  error?: string;
  initials: string;
  message?: string;
  name: string;
}) {
  return (
    <Card title="Dane profilu" icon="user">
      <form action={updateProfileAction} className="mt-7 grid gap-9 lg:grid-cols-[150px_1fr]">
        <div className="text-center">
          <div className="mx-auto grid size-32 place-items-center rounded-full bg-slate-200 text-[44px] font-extrabold text-blue-700 shadow-inner">
            {initials}
          </div>
          <p className="mt-4 text-sm font-extrabold text-slate-950">{name}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
            {email}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Message error={error} message={message} />
          </div>
          <Field
            autoComplete="name"
            defaultValue={name}
            label="Imię i nazwisko"
            name="full_name"
            required
            wide
          />
          <Field
            autoComplete="email"
            defaultValue={email}
            help="Zmiana adresu e-mail wymaga osobnego potwierdzenia."
            label="Adres e-mail"
            readOnly
            type="email"
            wide
          />
          <Field
            autoComplete="organization"
            defaultValue={companyName}
            label="Nazwa firmy"
            name="company_name"
            wide
          />
          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              className="h-10 rounded-[7px] bg-blue-600 px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700"
              type="submit"
            >
              Zapisz zmiany
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}

function PasswordCard({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return (
    <Card title="Zmiana hasła" icon="lock">
      <form action={changePasswordAction} className="mt-5 grid gap-4">
        <Message error={error} message={message} />
        <Field
          autoComplete="current-password"
          label="Aktualne hasło"
          minLength={6}
          name="current_password"
          required
          type="password"
          wide
        />
        <Field
          autoComplete="new-password"
          label="Nowe hasło"
          minLength={6}
          name="password"
          required
          type="password"
          wide
        />
        <Field
          autoComplete="new-password"
          label="Powtórz nowe hasło"
          minLength={6}
          name="passwordConfirm"
          required
          type="password"
          wide
        />
        <div className="flex justify-end pt-2">
          <button
            className="h-10 rounded-[7px] bg-blue-600 px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)] transition hover:bg-blue-700"
            type="submit"
          >
            Zmień hasło
          </button>
        </div>
      </form>
    </Card>
  );
}

function AccountInfoCard({
  createdAt,
  email,
  emailConfirmed,
}: {
  createdAt: string;
  email: string;
  emailConfirmed: boolean;
}) {
  const rows: Array<[string, string, IconName]> = [
    ["Adres e-mail", email, "mail" as const],
    [
      "Status e-mail",
      emailConfirmed ? "Potwierdzony" : "Niepotwierdzony",
      "shield" as const,
    ],
    ["Konto utworzone", formatDate(createdAt), "building" as const],
  ];

  return (
    <Card title="Konto" icon="shield">
      <div className="mt-5 divide-y divide-slate-100">
        {rows.map(([label, value, icon]) => (
          <div
            className="flex items-center justify-between gap-5 py-4 first:pt-0"
            key={label}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 place-items-center rounded-[8px] bg-slate-50 text-slate-600">
                <Icon name={icon} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-slate-950">
                  {label}
                </span>
                <span className="block max-w-[240px] truncate text-[13px] font-semibold text-slate-500">
                  {value}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const user = await getProfileUser();

  if (!user) {
    redirect("/login");
  }

  const { error: profileLoadError, profile } = await getProfileData(user);
  const email = user.email ?? "uzytkownik@remontraport.pl";
  const fallbackName =
    email.split("@")[0]?.split(".").filter(Boolean).join(" ") || "Użytkownik";
  const name = profile.full_name ?? fallbackName;
  const displayName = name.slice(0, 1).toUpperCase() + name.slice(1);
  const initials = displayName.slice(0, 1).toUpperCase();
  const profileError =
    firstParam(params.profileError) ?? profileLoadError ?? undefined;
  const profileMessage = firstParam(params.profileMessage);
  const passwordError = firstParam(params.passwordError);
  const passwordMessage = firstParam(params.passwordMessage);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <Topbar email={email} initials={initials} name={displayName} />

        <div className="mt-11">
          <h1 className="text-[30px] font-extrabold tracking-[-0.04em] text-slate-950">
            Mój profil
          </h1>
          <p className="mt-2 text-[15px] text-slate-500">
            Zarządzaj danymi konta i hasłem zapisanym w Supabase.
          </p>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_0.72fr]">
          <div className="space-y-5">
            <UserDataCard
              companyName={profile.company_name ?? ""}
              email={email}
              error={profileError}
              initials={initials}
              message={profileMessage}
              name={displayName}
            />
          </div>
          <div className="space-y-5">
            <PasswordCard error={passwordError} message={passwordMessage} />
            <AccountInfoCard
              createdAt={profile.created_at || user.created_at}
              email={email}
              emailConfirmed={Boolean(user.email_confirmed_at)}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
