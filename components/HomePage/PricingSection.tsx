import { SectionHeading } from "./HomePageUi";
import { Icon } from "@/components/ui/Icon";

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

export function PricingSection() {
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
