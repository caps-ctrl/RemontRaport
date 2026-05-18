import { SectionHeading } from "./HomePage-Ui";
import { Icon } from "./HomePage-Ui";
import { toneClasses } from "../../data/HomePageData";
const problemCards = [
  {
    icon: "image" as const,
    title: "Bałagan w zdjęciach",
    body: "Zdjęcia z placu budowy są wszędzie: w telefonach, galeriach i na dyskach. Trudno cokolwiek szybko znaleźć.",
    tone: "teal",
  },
  {
    icon: "message" as const,
    title: "Raporty rozproszone po WhatsAppie",
    body: "Notatki i ustalenia giną w wiadomościach. Trudno odtworzyć przebieg prac i udowodnić postępy.",
    tone: "orange",
  },
  {
    icon: "users" as const,
    title: "Trudna komunikacja postępów",
    body: "Klienci pytają o status, a przygotowanie raportu zajmuje zbyt dużo czasu i wybija z pracy.",
    tone: "blue",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-white py-7 md:py-9">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <SectionHeading id="problem">Problem</SectionHeading>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {problemCards.map((card) => (
            <article
              key={card.title}
              className="flex gap-5 rounded-[10px] border border-slate-100 bg-slate-50/70 p-6 shadow-[0_14px_32px_rgba(15,23,42,0.03)]"
            >
              <div
                className={`grid size-16 shrink-0 place-items-center rounded-[15px] ring-1 ${toneClasses[card.tone as keyof typeof toneClasses]}`}
              >
                <Icon name={card.icon} className="size-9" />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-3 text-[14px] leading-6 text-slate-600">
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
