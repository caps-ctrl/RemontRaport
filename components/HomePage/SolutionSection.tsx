import { toneClasses } from "@/data/HomePageData";
import { Icon } from "./HomePage-Ui";
import type { IconName } from "./HomePage-Ui";
import { LogoMini } from "./HomePage-Ui";
import { RoomThumb } from "./HomePage-Ui";
import { SectionHeading } from "./HomePage-Ui";
const reportBenefits = [
  "Twoje logo i dane firmy",
  "Podsumowanie postępów",
  "Galerie zdjęć z opisami",
  "Lista usterek ze statusami",
  "Profesjonalny PDF gotowy do wysyłki",
];
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

export function SolutionSection() {
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
