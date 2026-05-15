import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Profil - RemontRaport",
  description: "Profil i ustawienia konta RemontRaport.",
};

type IconName =
  | "bell"
  | "building"
  | "camera"
  | "card"
  | "chevron"
  | "client"
  | "document"
  | "folder"
  | "home"
  | "lock"
  | "mail"
  | "settings"
  | "shield"
  | "trash"
  | "upload"
  | "user"
  | "wrench";

const navItems = [
  { label: "Pulpit", icon: "home" as const, href: "/dashboard" },
  { label: "Projekty", icon: "folder" as const, href: "/dashboard" },
  { label: "Usterki", icon: "wrench" as const, href: "/dashboard" },
  { label: "Raporty", icon: "document" as const, href: "/dashboard" },
  { label: "Klienci", icon: "client" as const, href: "/dashboard" },
  { label: "Ustawienia", icon: "settings" as const, href: "/profile" },
  { label: "Profil", icon: "user" as const, href: "/profile", active: true },
];

const team = [
  ["Jan Kowalski", "jan.kowalski@example.com", "Właściciel", "Pełny dostęp", "Dzisiaj, 10:30", "blue"],
  ["Anna Nowak", "anna.nowak@example.com", "Edytor", "Edytowanie projektów", "Wczoraj, 15:45", "violet"],
  ["Piotr Zieliński", "piotr.zielinski@example.com", "Podgląd", "Tylko podgląd", "20.05.2024, 09:15", "green"],
];

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

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
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
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
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
    case "camera":
      return (
        <svg {...common}>
          <path d="M5 8h3l1.5-2h5L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
          <circle cx="12" cy="13.5" r="3.2" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
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
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2 2 0 1 1-2.82 2.82l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.66V21a2 2 0 1 1-4 0v-.08A1.8 1.8 0 0 0 8.7 19.3a1.8 1.8 0 0 0-2 .36l-.06.06a2 2 0 1 1-2.82-2.82l.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.66-1.1H2.5a2 2 0 1 1 0-4h.08A1.8 1.8 0 0 0 4.2 8.7a1.8 1.8 0 0 0-.36-2l-.06-.06A2 2 0 1 1 6.6 3.8l.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 9.8 2.58V2.5a2 2 0 1 1 4 0v.08a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 2-.36l.06-.06a2 2 0 1 1 2.82 2.82l-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.66 1.1h.08a2 2 0 1 1 0 4h-.08A1.8 1.8 0 0 0 19.4 15Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.2 2.7 7.7 7 10 4.3-2.3 7-5.8 7-10V6Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path d="M19 20a7 7 0 0 0-14 0" />
          <circle cx="12" cy="8" r="3.5" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...common}>
          <path d="m14.7 6.3 3-3 3 3-3 3" />
          <path d="M16.5 8.5 7 18a2.1 2.1 0 0 1-3-3l9.5-9.5" />
        </svg>
      );
  }
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="RemontRaport">
      <span className="grid size-8 place-items-center text-blue-600">
        <svg viewBox="0 0 28 28" className="size-7" fill="none" aria-hidden>
          <path d="m5 12 9-8 9 8v11H5Z" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round" />
          <path d="M10 23v-8h4v8M18 23V11" stroke="#0f9f8f" strokeWidth="2.3" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[25px] font-extrabold tracking-[-0.045em] text-slate-950">
        Remont<span className="text-blue-600">Raport</span>
      </span>
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[270px] border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col">
      <Logo />
      <nav className="mt-11 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex h-[48px] items-center gap-4 rounded-[8px] px-4 text-[16px] font-semibold transition ${
              item.active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            <Icon name={item.icon} className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-[12px] border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-extrabold text-slate-950">Potrzebujesz pomocy?</h3>
        <p className="mt-3 text-xs leading-5 text-slate-600">Skontaktuj się z nami, chętnie pomożemy.</p>
        <button className="mt-4 h-9 w-full rounded-[7px] border border-slate-200 text-sm font-extrabold text-blue-600">
          Pomoc
        </button>
      </div>
      <form action={logout} className="mt-8">
        <button className="flex items-center gap-3 text-[15px] font-bold text-slate-600 hover:text-blue-600">
          <Icon name="chevron" className="size-5 rotate-180" />
          Wyloguj się
        </button>
      </form>
    </aside>
  );
}

function Topbar({ email, initials, name }: { email: string; initials: string; name: string }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Logo />
      <div className="flex items-center gap-5">
        <button className="relative rounded-[8px] border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm" aria-label="Powiadomienia">
          <Icon name="bell" className="size-5" />
          <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-blue-600" />
        </button>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700">{initials}</span>
          <div className="hidden md:block">
            <p className="text-[15px] font-extrabold text-slate-950">{name}</p>
            <p className="max-w-[190px] truncate text-sm text-slate-500">{email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Input({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="text-[13px] font-extrabold text-slate-900">{label}</span>
      <input
        className="mt-2 h-10 w-full rounded-[7px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        defaultValue={value}
      />
    </label>
  );
}

function SelectField({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="text-[13px] font-extrabold text-slate-900">{label}</span>
      <select
        className="mt-2 h-10 w-full rounded-[7px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        defaultValue={value}
      >
        <option>{value}</option>
      </select>
    </label>
  );
}

function Card({ children, title, icon }: { children: React.ReactNode; title: string; icon: IconName }) {
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

function Toggle({ enabled = true }: { enabled?: boolean }) {
  return (
    <span className={`flex h-6 w-11 items-center rounded-full p-0.5 ${enabled ? "justify-end bg-blue-600" : "justify-start bg-slate-200"}`}>
      <span className="size-5 rounded-full bg-white shadow" />
    </span>
  );
}

function UserDataCard({ email, name, initials }: { email: string; name: string; initials: string }) {
  return (
    <Card title="Dane użytkownika" icon="user">
      <div className="mt-7 grid gap-9 lg:grid-cols-[190px_1fr]">
        <div className="text-center">
          <div className="relative mx-auto grid size-36 place-items-center rounded-full bg-slate-200 text-[48px] font-extrabold text-blue-700 shadow-inner">
            {initials}
            <button className="absolute bottom-2 right-1 grid size-9 place-items-center rounded-full border-4 border-white bg-blue-600 text-white">
              <Icon name="camera" className="size-4" />
            </button>
          </div>
          <button className="mt-6 h-10 w-full rounded-[7px] border border-slate-200 bg-white text-sm font-extrabold text-blue-600">
            Zmień zdjęcie
          </button>
          <p className="mt-3 text-xs font-medium text-slate-500">JPG, PNG do 5MB</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Imię i nazwisko" value={name} wide />
          <Input label="Adres e-mail" value={email} wide />
          <Input label="Numer telefonu" value="+48 123 456 789" wide />
          <Input label="Nazwa firmy" value="Remonty Kowalski" wide />
          <SelectField label="Rola w firmie" value="Właściciel" />
          <SelectField label="Język aplikacji" value="Polski" />
          <SelectField label="Strefa czasowa" value="(GMT+01:00) Warszawa" wide />
          <div className="md:col-span-2 flex justify-end pt-2">
            <button className="h-10 rounded-[7px] bg-blue-600 px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)]">
              Zapisz zmiany
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AccountSettings() {
  const rows = [
    ["Zmiana hasła", "Zaktualizuj swoje hasło do konta", "button"],
    ["Powiadomienia e-mail", "Otrzymuj powiadomienia o nowych raportach i projektach", "toggle"],
    ["Powiadomienia o nowych usterkach", "Otrzymuj powiadomienia o nowych usterkach w projektach", "toggle"],
    ["Domyślny format raportu", "Wybierz domyślny format generowanego raportu", "select"],
    ["Dane firmy w raportach", "Pokazuj dane firmy w stopce raportów", "toggle"],
  ];

  return (
    <Card title="Ustawienia konta" icon="settings">
      <div className="mt-5 divide-y divide-slate-100">
        {rows.map(([title, body, control]) => (
          <div key={title} className="flex items-center justify-between gap-5 py-5 first:pt-0">
            <div>
              <h3 className="text-sm font-extrabold text-slate-950">{title}</h3>
              <p className="mt-1 text-[13px] text-slate-500">{body}</p>
            </div>
            {control === "button" ? (
              <button className="h-10 whitespace-nowrap rounded-[7px] border border-slate-200 px-5 text-sm font-bold text-slate-700">Zmień hasło</button>
            ) : control === "select" ? (
              <select className="h-10 rounded-[7px] border border-slate-200 px-4 text-sm font-bold text-slate-700" defaultValue="PDF">
                <option>PDF</option>
              </select>
            ) : (
              <Toggle />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function BillingCard() {
  return (
    <Card title="Plan i rozliczenia" icon="card">
      <div className="mt-5 rounded-[10px] bg-slate-50 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-extrabold text-slate-500">Aktualny plan</p>
            <p className="mt-1 text-xl font-extrabold text-slate-950">Pro</p>
            <p className="text-sm font-semibold text-slate-600">49 zł / miesiąc</p>
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-500">Następna płatność</p>
            <p className="mt-2 text-sm font-extrabold text-slate-950">12.06.2024</p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <button className="h-10 rounded-[7px] border border-slate-200 text-sm font-extrabold text-blue-600">Zmień plan</button>
        <button className="h-10 rounded-[7px] bg-blue-600 text-sm font-extrabold text-white">Zarządzaj subskrypcją</button>
      </div>
    </Card>
  );
}

function TeamCard() {
  return (
    <Card title="Zespół" icon="client">
      <div className="mt-1 flex justify-end">
        <button className="h-10 rounded-[7px] bg-blue-600 px-5 text-sm font-extrabold text-white">Dodaj członka</button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-extrabold text-slate-500">
              <th className="pb-3">Użytkownik</th>
              <th className="pb-3">Rola</th>
              <th className="pb-3">Dostęp</th>
              <th className="pb-3">Ostatnia aktywność</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {team.map(([person, mail, role, access, activity, tone]) => (
              <tr key={mail} className="border-b border-slate-100 last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-600">{person.slice(0, 1)}</span>
                    <span>
                      <span className="block text-sm font-extrabold text-slate-950">{person}</span>
                      <span className="text-xs text-slate-500">{mail}</span>
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${tone === "green" ? "bg-emerald-50 text-emerald-700" : tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}`}>
                    {role}
                  </span>
                </td>
                <td className="py-3 text-sm text-slate-600">{access}</td>
                <td className="py-3 text-sm text-slate-600">{activity}</td>
                <td className="py-3 text-right text-xl font-bold text-slate-500">⋮</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SecurityCard() {
  return (
    <Card title="Strefa bezpieczeństwa" icon="shield">
      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-[10px] border border-slate-100 p-4">
          <div className="flex items-center gap-4">
            <Icon name="upload" className="size-6 text-slate-600" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-950">Eksport danych</h3>
              <p className="text-[13px] text-slate-500">Pobierz kopię swoich danych</p>
            </div>
          </div>
          <button className="h-10 rounded-[7px] border border-slate-200 px-5 text-sm font-bold text-slate-700">Eksportuj</button>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-[10px] border border-red-100 bg-red-50 p-4">
          <div className="flex items-center gap-4">
            <Icon name="trash" className="size-6 text-red-600" />
            <div>
              <h3 className="text-sm font-extrabold text-red-700">Usuń konto</h3>
              <p className="text-[13px] text-red-600">Trwale usuń swoje konto i wszystkie dane</p>
            </div>
          </div>
          <button className="h-10 rounded-[7px] bg-red-500 px-5 text-sm font-extrabold text-white">Usuń konto</button>
        </div>
      </div>
    </Card>
  );
}

export default async function ProfilePage() {
  const user = await getProfileUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "jan.kowalski@example.com";
  const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const name = metaName || "Jan Kowalski";
  const initials = name.slice(0, 1).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <Topbar email={email} initials={initials} name={name} />

        <div className="mt-11">
          <h1 className="text-[30px] font-extrabold tracking-[-0.04em] text-slate-950">Mój profil</h1>
          <p className="mt-2 text-[15px] text-slate-500">Zarządzaj swoimi danymi osobowymi i ustawieniami konta.</p>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.06fr_0.9fr]">
          <div className="space-y-5">
            <UserDataCard email={email} initials={initials} name={name} />
            <TeamCard />
          </div>
          <div className="space-y-5">
            <AccountSettings />
            <BillingCard />
            <SecurityCard />
          </div>
        </div>
      </section>
    </main>
  );
}
