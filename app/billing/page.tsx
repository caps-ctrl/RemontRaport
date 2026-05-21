import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AppSidebar } from "@/app/app-sidebar";
import {
  openBillingPortalAction,
  startCheckoutAction,
} from "@/app/billing/actions";
import {
  BillingError,
  getBillingOverviewForUser,
  type BillingOverview,
} from "@/lib/billing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Płatności - RemontRaport",
  description: "Płatności i subskrypcja RemontRaport.",
};

type BillingPageProps = {
  searchParams: Promise<{
    billingError?: string | string[];
    billingMessage?: string | string[];
    checkout?: string | string[];
  }>;
};

type IconName = "arrow" | "card" | "check" | "shield" | "warning";

const fallbackOverview: BillingOverview = {
  canManageSubscription: false,
  canStartCheckout: false,
  customerId: null,
  isProActive: false,
  missingConfiguration: [],
  planName: "Starter",
  statusLabel: "Brak danych",
  stripeSecretConfigured: false,
  subscription: null,
  syncError: null,
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
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
    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
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
    case "warning":
      return (
        <svg {...common}>
          <path d="m12 3 10 18H2Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}

function initialsFromName(value: string) {
  return value.trim().slice(0, 1).toUpperCase() || "U";
}

function getDisplayName(user: User) {
  const email = user.email ?? "uzytkownik@remontraport.pl";
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : email.split("@")[0]?.split(".")[0] ?? "Użytkownik";

  return fullName.slice(0, 1).toUpperCase() + fullName.slice(1);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Brak daty";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Brak daty";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
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
      className={`mt-7 rounded-[10px] border px-4 py-3 text-sm font-extrabold ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ?? message}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-[8px] px-3 py-2 text-xs font-extrabold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Pro aktywny" : "Starter"}
    </span>
  );
}

function PaymentButton({
  children,
  disabled,
  secondary = false,
}: {
  children: string;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        secondary
          ? "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-600"
          : "bg-blue-600 text-white shadow-[0_12px_26px_rgba(37,99,235,0.22)] hover:bg-blue-700"
      }`}
      disabled={disabled}
    >
      {children}
      <Icon name="arrow" className="size-4" />
    </button>
  );
}

async function getBillingUser() {
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

async function getBillingData(user: User): Promise<{
  error: string | null;
  overview: BillingOverview;
}> {
  try {
    const supabase = await getSupabaseServerClient();

    return {
      error: null,
      overview: await getBillingOverviewForUser({ supabase, user }),
    };
  } catch (error) {
    return {
      error:
        error instanceof BillingError
          ? error.message
          : "Nie udało się pobrać danych płatności.",
      overview: fallbackOverview,
    };
  }
}

function checkoutMessage(checkout?: string) {
  if (checkout === "success") {
    return "Płatność zakończona. Status subskrypcji zostanie odświeżony ze Stripe.";
  }

  if (checkout === "cancel") {
    return "Płatność została przerwana.";
  }

  return undefined;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams;
  const user = await getBillingUser();

  if (!user) {
    redirect("/login");
  }

  const { error: loadError, overview } = await getBillingData(user);
  const email = user.email ?? "uzytkownik@remontraport.pl";
  const displayName = getDisplayName(user);
  const message =
    firstParam(params.billingMessage) ??
    checkoutMessage(firstParam(params.checkout));
  const error =
    firstParam(params.billingError) ?? loadError ?? overview.syncError ?? undefined;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppSidebar activeItem="billing" />
      <section className="min-h-screen px-5 py-6 lg:ml-[270px] lg:px-10 xl:px-12">
        <header className="flex items-center justify-between gap-4">
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
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-blue-100 text-sm font-extrabold text-blue-700">
              {initialsFromName(displayName)}
            </span>
            <div className="hidden md:block">
              <p className="text-[15px] font-extrabold text-slate-950">
                {displayName}
              </p>
              <p className="max-w-[190px] truncate text-sm text-slate-500">
                {email}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-11 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
              <Icon name="card" className="size-5" />
              Płatności
            </p>
            <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.045em] text-slate-950">
              Plan i subskrypcja
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">
              Opłać plan Pro, sprawdź status subskrypcji i przejdź do panelu
              Stripe, żeby zarządzać fakturami oraz metodą płatności.
            </p>
          </div>
          <StatusBadge active={overview.isProActive} />
        </div>

        <Message error={error} message={message} />

        <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="grid size-14 place-items-center rounded-[12px] bg-blue-50 text-blue-600">
                  <Icon name="card" className="size-8" />
                </div>
                <h2 className="mt-5 text-[26px] font-extrabold tracking-[-0.04em] text-slate-950">
                  RemontRaport Pro
                </h2>
                <p className="mt-2 max-w-xl text-[15px] leading-6 text-slate-500">
                  Nielimitowane projekty, zdjęcia, usterki oraz raporty dla
                  bieżących realizacji.
                </p>
              </div>
              <div className="rounded-[10px] bg-slate-50 px-5 py-4 text-right">
                <p className="text-[40px] font-extrabold leading-none tracking-[-0.05em] text-slate-950">
                  59 zł
                </p>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  miesięcznie
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "Nielimitowane projekty",
                "Wiele zdjęć do usterek",
                "Raporty z danych projektu",
                "Panel klienta Stripe",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[9px] bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
                >
                  <Icon name="check" className="size-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>

            {overview.missingConfiguration.length > 0 ? (
              <div className="mt-7 rounded-[10px] border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold leading-6 text-orange-700">
                Brakuje konfiguracji Stripe:{" "}
                {overview.missingConfiguration.join(", ")}.
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <form action={startCheckoutAction}>
                <PaymentButton disabled={!overview.canStartCheckout}>
                  {overview.isProActive ? "Odśwież płatność" : "Aktywuj Pro"}
                </PaymentButton>
              </form>
              <form action={openBillingPortalAction}>
                <PaymentButton
                  disabled={!overview.canManageSubscription}
                  secondary
                >
                  Zarządzaj subskrypcją
                </PaymentButton>
              </form>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-teal-50 text-teal-600">
                  <Icon name="shield" className="size-7" />
                </div>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-teal-600">
                    Status
                  </p>
                  <h2 className="mt-2 text-[25px] font-extrabold tracking-[-0.04em] text-slate-950">
                    {overview.statusLabel}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Aktualny plan:{" "}
                    <span className="font-extrabold text-slate-700">
                      {overview.planName}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 rounded-[10px] bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-500">
                    Koniec okresu
                  </span>
                  <span className="text-right text-sm font-extrabold text-slate-800">
                    {formatDate(overview.subscription?.current_period_end)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-slate-500">
                    Identyfikator klienta
                  </span>
                  <span className="max-w-[180px] truncate text-right text-sm font-extrabold text-slate-800">
                    {overview.customerId ?? "Brak"}
                  </span>
                </div>
              </div>
            </article>

            <article className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-orange-50 text-orange-500">
                  <Icon name="warning" className="size-7" />
                </div>
                <div>
                  <h2 className="text-[21px] font-extrabold tracking-[-0.03em] text-slate-950">
                    Bezpieczne płatności
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Dane kart i faktury obsługuje Stripe. W aplikacji zapisujemy
                    tylko identyfikatory klienta oraz status subskrypcji.
                  </p>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
