import { SectionHeading } from "./HomePage-Ui";
import { Icon } from "./HomePage-Ui";
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

export function AudienceSection() {
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
