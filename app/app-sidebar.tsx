import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { sidebarItems } from "@/app/data";

type SidebarItemId = (typeof sidebarItems)[number]["id"];
type SidebarIconName =
  | "alert"
  | "chevron"
  | "client"
  | "document"
  | "folder"
  | "home"
  | "settings"
  | "user";

function Icon({
  name,
  className = "",
}: {
  name: SidebarIconName;
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
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2 2 0 1 1-2.82 2.82l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.66V21a2 2 0 1 1-4 0v-.08A1.8 1.8 0 0 0 8.7 19.3a1.8 1.8 0 0 0-2 .36l-.06.06a2 2 0 1 1-2.82-2.82l.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.66-1.1H2.5a2 2 0 1 1 0-4h.08A1.8 1.8 0 0 0 4.2 8.7a1.8 1.8 0 0 0-.36-2l-.06-.06A2 2 0 1 1 6.6 3.8l.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 9.8 2.58V2.5a2 2 0 1 1 4 0v.08a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 2-.36l.06-.06a2 2 0 1 1 2.82 2.82l-.06.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.66 1.1h.08a2 2 0 1 1 0 4h-.08A1.8 1.8 0 0 0 19.4 15Z" />
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

export function AppSidebar({ activeItem }: { activeItem: SidebarItemId }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[270px] border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col">
      <Logo />
      <nav className="mt-11 space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex h-[48px] items-center gap-4 rounded-[8px] px-4 text-[16px] font-semibold transition ${
              item.id === activeItem
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
            }`}
          >
            <Icon name={item.icon} className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-[12px] border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-extrabold text-slate-950">
          Potrzebujesz pomocy?
        </h3>
        <p className="mt-3 text-xs leading-5 text-slate-600">
          Skontaktuj się z nami, chętnie pomożemy.
        </p>
        <button className="mt-4 h-9 w-full rounded-[7px] border border-slate-200 text-sm font-extrabold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50/40">
          Pomoc
        </button>
      </div>
      <form action={logout} className="mt-8">
        <button className="flex items-center gap-3 text-[15px] font-bold text-slate-600 transition hover:text-blue-600">
          <Icon name="chevron" className="size-5 rotate-180" />
          Wyloguj się
        </button>
      </form>
    </aside>
  );
}
