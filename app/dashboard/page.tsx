import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Dashboard - RemontRaport",
  description: "Panel użytkownika RemontRaport.",
};

type IconName =
  | "alert"
  | "bell"
  | "camera"
  | "check"
  | "chevron"
  | "client"
  | "document"
  | "folder"
  | "gift"
  | "home"
  | "note"
  | "plus"
  | "settings"
  | "trend"
  | "user";

const navItems = [
  { label: "Pulpit", icon: "home" as const, active: true, href: "/dashboard" },
  { label: "Projekty", icon: "folder" as const, href: "/dashboard" },
  { label: "Raporty", icon: "document" as const, href: "/dashboard" },
  { label: "Usterki", icon: "alert" as const, href: "/dashboard" },
  { label: "Notatki", icon: "note" as const, href: "/dashboard" },
  { label: "Klienci", icon: "client" as const, href: "/dashboard" },
  { label: "Ustawienia", icon: "settings" as const, href: "/profile" },
  { label: "Profil", icon: "user" as const, href: "/profile" },
];

const stats = [
  {
    icon: "folder" as const,
    label: "Liczba projektów",
    value: "12",
    delta: "2 od ostatniego miesiąca",
    tone: "blue",
    positive: true,
  },
  {
    icon: "trend" as const,
    label: "Liczba aktywnych projektów",
    value: "7",
    delta: "1 od ostatniego miesiąca",
    tone: "teal",
    positive: true,
  },
  {
    icon: "alert" as const,
    label: "Liczba otwartych usterek",
    value: "18",
    delta: "3 od ostatniego miesiąca",
    tone: "orange",
    positive: false,
  },
];

const entries = [
  {
    project: "Mieszkanie - Warszawa, Wola",
    address: "ul. Jana Kazimierza 33",
    type: "Zdjęcia",
    icon: "camera" as const,
    date: "Dzisiaj, 09:15",
    author: "Alicja",
    status: "Zakończone",
    statusTone: "green",
    imageTone: "warm",
  },
  {
    project: "Dom - Konstancin",
    address: "ul. Leśna 8",
    type: "Raport",
    icon: "document" as const,
    date: "Wczoraj, 16:42",
    author: "Piotr",
    status: "W trakcie",
    statusTone: "blue",
    imageTone: "light",
  },
  {
    project: "Biuro - Mokotów",
    address: "ul. Domaniewska 45",
    type: "Usterka",
    icon: "alert" as const,
    date: "21.05.2025, 11:08",
    author: "Alicja",
    status: "Nowa",
    statusTone: "orange",
    imageTone: "default",
  },
  {
    project: "Apartamenty - Żoliborz",
    address: "ul. Rydygiera 20",
    type: "Notatka",
    icon: "note" as const,
    date: "20.05.2025, 14:33",
    author: "Marek",
    status: "Zakończone",
    statusTone: "green",
    imageTone: "light",
  },
  {
    project: "Sklep - Galeria Mokotów",
    address: "ul. Wołoska 12",
    type: "Zdjęcia",
    icon: "camera" as const,
    date: "19.05.2025, 09:27",
    author: "Alicja",
    status: "W trakcie",
    statusTone: "blue",
    imageTone: "warm",
  },
];

const tasks = [
  ["Przygotować raport miesięczny", "Termin: 23.05.2025", "W trakcie", "blue"],
  ["Zweryfikować usterki - Biuro", "Termin: 24.05.2025", "Pilne", "orange"],
  ["Spotkanie z klientem", "Termin: 26.05.2025", "W trakcie", "blue"],
];

async function getDashboardUser() {
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
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "alert":
      return (
        <svg {...common}>
          <path d="m12 3 10 18H2Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
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
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "client":
      return (
        <svg {...common}>
          <path d="M16 19a5 5 0 0 0-10 0" />
          <circle cx="11" cy="8" r="3" />
          <path d="M21 19a4 4 0 0 0-4-4" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7Z" />
          <path d="M14 3v5h5" />
          <path d="M9.5 12h5" />
          <path d="M9.5 16h5" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17Z" />
          <path d="M4 10h16" />
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
    case "home":
      return (
        <svg {...common}>
          <path d="m4 11 8-7 8 7" />
          <path d="M6 10v10h12V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case "note":
      return (
        <svg {...common}>
          <path d="M6 4h12v16H6Z" />
          <path d="M9 8h6" />
          <path d="M9 12h4" />
          <path d="m14 20 4-4" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2 2 0 1 1-2.82 2.82l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.66V21a2 2 0 1 1-4 0v-.08A1.8 1.8 0 0 0 8.7 19.3a1.8 1.8 0 0 0-2 .36l-.06.06a2 2 0 1 1-2.82-2.82l.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.66-1.1H2.5a2 2 0 1 1 0-4h.08A1.8 1.8 0 0 0 4.2 8.7a1.8 1.8 0 0 0-.36-2l-.06-.06A2 2 0 1 1 6.6 3.8l.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 9.8 2.58V2.5a2 2 0 1 1 4 0v.08a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 2-.36l.06-.06a2 2 0 1 1 2.82 2.82l-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.66 1.1h.08a2 2 0 1 1 0 4h-.08A1.8 1.8 0 0 0 19.4 15Z" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="m4 16 5-5 4 4 7-8" />
          <path d="M15 7h5v5" />
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
      href="/"
      className="flex items-center gap-2.5"
      aria-label="RemontRaport"
    >
      <span className="grid size-8 place-items-center text-blue-600">
        <svg viewBox="0 0 28 28" className="size-7" fill="none" aria-hidden>
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
      <span className="text-[25px] font-extrabold tracking-[-0.045em] text-slate-950">
        Remont<span className="text-blue-600">Raport</span>
      </span>
    </Link>
  );
}

function RoomThumb({
  tone = "default",
}: {
  tone?: "default" | "light" | "warm";
}) {
  const styles = {
    default:
      "bg-[linear-gradient(135deg,#d4c4b2_0_40%,#f5efe7_41_70%,#a98f72_71_100%)]",
    light:
      "bg-[linear-gradient(135deg,#eee7dc_0_45%,#c4aa8c_46_62%,#ffffff_63_100%)]",
    warm: "bg-[linear-gradient(135deg,#cbb69d_0_38%,#eee4d8_39_72%,#b09272_73_100%)]",
  };

  return (
    <div
      className={`h-[56px] w-[70px] overflow-hidden rounded-[8px] ${styles[tone]} shadow-sm`}
    >
      <div className="mt-8 ml-2 h-3 w-8 rounded bg-white/60" />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[270px] border-r border-slate-200 bg-white px-6 py-9 lg:flex lg:flex-col">
      <Logo />
      <nav className="mt-12 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex h-[50px] items-center gap-4 rounded-[8px] px-4 text-[17px] font-semibold transition ${
              item.active
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            <Icon name={item.icon} className="size-6" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
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
      <div className="flex items-center gap-5">
        <button
          className="relative hidden text-slate-600 transition hover:text-blue-600 sm:block"
          aria-label="Powiadomienia"
        >
          <Icon name="bell" className="size-7" />
          <span className="absolute -right-1 -top-2 grid size-5 place-items-center rounded-full bg-blue-600 text-[11px] font-extrabold text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700 ring-4 ring-slate-100">
            {initials}
          </span>
          <div className="hidden md:block">
            <p className="text-[15px] font-extrabold text-slate-950">{name}</p>
            <p className="max-w-[190px] truncate text-sm text-slate-500">
              {email}
            </p>
          </div>
        </div>
        <form action={logout}>
          <button className="rounded-[8px] border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600">
            Wyloguj
          </button>
        </form>
      </div>
    </header>
  );
}

function StatCard({ stat }: { stat: (typeof stats)[number] }) {
  const tone = {
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-teal-50 text-teal-600",
    orange: "bg-orange-50 text-orange-500",
  }[stat.tone];

  return (
    <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-6">
        <div
          className={`grid size-14 shrink-0 place-items-center rounded-[12px] ${tone}`}
        >
          <Icon name={stat.icon} className="size-8" />
        </div>
        <div>
          <p className="min-h-10 text-[15px] font-semibold leading-5 text-slate-600">
            {stat.label}
          </p>
          <p className="mt-4 text-[43px] font-extrabold leading-none tracking-[-0.05em] text-slate-950">
            {stat.value}
          </p>
        </div>
      </div>
      <p className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-slate-500">
        <span className={stat.positive ? "text-teal-600" : "text-orange-500"}>
          {stat.positive ? "↑" : "↓"}
        </span>
        <span className={stat.positive ? "text-teal-600" : "text-orange-500"}>
          {stat.delta.split(" ")[0]}
        </span>
        {stat.delta.split(" ").slice(1).join(" ")}
      </p>
    </article>
  );
}

function StatusBadge({ status, tone }: { status: string; tone: string }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
  }[tone];

  return (
    <span
      className={`rounded-[7px] px-3 py-2 text-[12px] font-extrabold ${styles}`}
    >
      {status}
    </span>
  );
}

function EntriesTable() {
  return (
    <section className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-slate-950">
          Ostatnie wpisy
        </h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600"
        >
          Zobacz wszystkie wpisy
          <Icon name="chevron" className="size-4" />
        </Link>
      </div>
      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[13px] font-semibold text-slate-500">
              <th className="pb-4">Projekt</th>
              <th className="pb-4">Typ</th>
              <th className="pb-4">Data</th>
              <th className="pb-4">Status</th>
              <th className="pb-4" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.project}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3.5">
                  <div className="flex items-center gap-4">
                    <RoomThumb
                      tone={entry.imageTone as "default" | "light" | "warm"}
                    />
                    <div>
                      <p className="text-[14px] font-extrabold text-slate-950">
                        {entry.project}
                      </p>
                      <p className="mt-1 text-[13px] text-slate-500">
                        {entry.address}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-[8px] bg-blue-50 text-blue-600">
                      <Icon name={entry.icon} className="size-5" />
                    </span>
                    <span className="text-[13px] font-semibold text-slate-600">
                      {entry.type}
                    </span>
                  </div>
                </td>
                <td className="py-3.5">
                  <p className="text-[13px] font-bold text-slate-950">
                    {entry.date}
                  </p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    przez {entry.author}
                  </p>
                </td>
                <td className="py-3.5">
                  <StatusBadge status={entry.status} tone={entry.statusTone} />
                </td>
                <td className="py-3.5 text-right text-xl font-bold text-slate-500">
                  ⋮
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-7 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600"
        >
          Zobacz wszystkie wpisy
          <Icon name="chevron" className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function ProgressCard() {
  return (
    <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-extrabold text-slate-950">
          Postęp projektów
        </h2>
        <button className="rounded-[7px] border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          Wszystkie
        </button>
      </div>
      <div className="mt-6 flex items-center gap-7">
        <div className="relative grid size-[118px] place-items-center rounded-full bg-[conic-gradient(#0f5df4_0_58%,#e8edf5_58%_100%)]">
          <div className="grid size-[84px] place-items-center rounded-full bg-white text-center">
            <span className="block text-[26px] font-extrabold tracking-[-0.05em] text-slate-950">
              58%
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              średni postęp
            </span>
          </div>
        </div>
        <div className="space-y-3 text-sm font-semibold">
          {[
            ["Zakończone", "3", "bg-teal-500"],
            ["W trakcie", "7", "bg-blue-600"],
            ["Nie rozpoczęte", "2", "bg-slate-300"],
          ].map(([label, value, dot]) => (
            <div key={label} className="flex items-center gap-3 text-slate-700">
              <span className={`size-2.5 rounded-full ${dot}`} />
              <span className="min-w-[110px]">{label}</span>
              <span className="font-extrabold text-slate-950">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600"
        >
          Zobacz raport postępów
          <Icon name="chevron" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

function TasksCard() {
  return (
    <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
      <h2 className="text-[18px] font-extrabold text-slate-950">
        Moje zadania
      </h2>
      <div className="mt-5 divide-y divide-slate-100">
        {tasks.map(([title, term, status, tone]) => (
          <div key={title} className="flex items-center gap-3 py-4 first:pt-0">
            <span className="size-5 rounded border border-slate-300" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold text-slate-800">
                {title}
              </p>
              <p className="mt-1 text-[12px] text-slate-500">{term}</p>
            </div>
            <StatusBadge status={status} tone={tone} />
          </div>
        ))}
      </div>
      <Link
        href="/dashboard"
        className="mt-3 flex items-center justify-center gap-2 text-sm font-extrabold text-blue-600"
      >
        Zobacz wszystkie zadania
        <Icon name="chevron" className="size-4" />
      </Link>
    </article>
  );
}

function QuickActions() {
  const actions: Array<{ label: string; icon: IconName; color: string }> = [
    { label: "Dodaj projekt", icon: "folder", color: "text-blue-600" },
    { label: "Dodaj usterkę", icon: "alert", color: "text-orange-500" },
    { label: "Dodaj notatkę", icon: "note", color: "text-violet-600" },
    { label: "Wygeneruj raport", icon: "document", color: "text-teal-600" },
  ];

  return (
    <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.055)]">
      <h2 className="text-[18px] font-extrabold text-slate-950">
        Szybkie akcje
      </h2>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            className="grid min-h-[72px] place-items-center rounded-[10px] border border-slate-200 bg-white p-3 text-center text-[13px] font-extrabold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/30"
          >
            <Icon
              name={action.icon}
              className={`mb-2 size-7 ${action.color}`}
            />
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  const user = await getDashboardUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "uzytkownik@remontraport.pl";
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name
      ? user.user_metadata.full_name
      : (email.split("@")[0]?.split(".")[0] ?? "Alicja");
  const displayName = fullName.slice(0, 1).toUpperCase() + fullName.slice(1);
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <Topbar email={email} initials={initials} name={displayName} />

        <div className="mt-11 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-[34px] font-extrabold tracking-[-0.045em] text-slate-950">
              Witaj, {displayName}
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-slate-500">
              Oto podsumowanie Twoich projektów i najważniejsze aktualności.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 px-3 text-[15px] font-extrabold text-blue-600"
            >
              Zobacz wszystkie projekty
              <Icon name="chevron" className="size-5" />
            </Link>
            <button className="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] bg-blue-600 px-9 text-[16px] font-extrabold text-white shadow-[0_16px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-700">
              <Icon name="plus" className="size-6" />
              Nowy projekt
            </button>
          </div>
        </div>

        <div className="mt-9 grid gap-6 xl:grid-cols-[1fr_315px]">
          <div className="space-y-7">
            <div className="grid gap-5 md:grid-cols-3">
              {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>
            <EntriesTable />
          </div>
          <aside className="space-y-5">
            <ProgressCard />
            <TasksCard />
            <QuickActions />
          </aside>
        </div>
      </section>
    </main>
  );
}
