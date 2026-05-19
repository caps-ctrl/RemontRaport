import { LogoMini, RoomThumb, toneClasses } from "./HomePageUi";
import { Icon } from "@/components/ui/Icon";

const trustItems = [
  { label: "Oszczędzaj czas", icon: "check" as const, tone: "emerald" },
  { label: "Profesjonalny wizerunek", icon: "shield" as const, tone: "blue" },
  { label: "Bezpieczne dane", icon: "lock" as const, tone: "orange" },
];

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

export function Hero() {
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
