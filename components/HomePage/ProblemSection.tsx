import { SectionHeading, toneClasses } from "./HomePageUi";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";

const problemCards = [
  {
    icon: "alert" as const,
    kicker: "Nieprzewidywalna budowa",
    title: "Na budowie często coś idzie nie tak",
    body: "Opóźnienia, poprawki, uszkodzenia, braki materiałów albo nieporozumienia z ekipą potrafią pojawić się z dnia na dzień. Gdy trzeba wrócić do szczegółów, liczy się każde zdjęcie, data i krótki kontekst.",
    tone: "orange" as const,
    side: "left" as const,
    slideFrom: "right" as const,
    image: "/images/problem1.jpg",
    imageAlt: "Plac budowy z widocznymi pracami remontowymi",
  },
  {
    icon: "message" as const,
    kicker: "Dokumentowanie po godzinach",
    title: "Dokumentacja potrafi być frustrująca",
    body: "Zdjęcia są w galerii, ustalenia na komunikatorach, notatki w głowie, a raport trzeba składać ręcznie po całym dniu pracy. Zamiast porządkować projekt, dokumentacja często zabiera czas i nerwy.",
    tone: "teal" as const,
    side: "right" as const,
    slideFrom: "left" as const,
    image: "/images/problem2.jpg",
    imageAlt: "Prace remontowe wymagające udokumentowania postępu",
  },
];

export function ProblemSection() {
  return (
    <section className="overflow-hidden bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <SectionHeading id="problem">Problem</SectionHeading>

        <div className="mt-8 flex flex-col gap-8 md:mt-10 lg:gap-10">
          {problemCards.map((card) => {
            const isLeft = card.side === "left";

            return (
              <article
                key={card.title}
                className={[
                  "problem-card group relative grid w-[calc(100%+1.5rem)] overflow-hidden rounded-[16px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]",
                  "transition-[border-color,box-shadow] duration-500 hover:border-slate-300 hover:shadow-[0_32px_82px_rgba(15,23,42,0.12)]",
                  "lg:min-h-[380px] lg:w-[92%] lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]",
                  isLeft
                    ? "problem-card--left -ml-5 self-start md:-ml-10 lg:-ml-20"
                    : "problem-card--right -mr-5 self-end md:-mr-10 lg:-mr-20 lg:grid-cols-[minmax(340px,0.88fr)_minmax(0,1.12fr)] lg:text-right",
                  card.slideFrom === "right"
                    ? "problem-card--from-right"
                    : "problem-card--from-left",
                ].join(" ")}
              >
                <div
                  className={[
                    "relative min-h-[310px] overflow-hidden sm:min-h-[380px] lg:min-h-full",
                    isLeft ? "lg:order-1" : "lg:order-2",
                  ].join(" ")}
                >
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition duration-1000 ease-out group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent" />
                </div>

                <div
                  className={[
                    "flex min-h-[300px] flex-col justify-center p-6 sm:p-8 lg:p-10",
                    isLeft ? "lg:order-2" : "lg:order-1 lg:items-end",
                  ].join(" ")}
                >
                  <h3 className="mt-3 max-w-[520px] text-[28px] font-extrabold leading-[1.05] tracking-[-0.04em] text-slate-950 md:text-[36px]">
                    {card.title}
                  </h3>{" "}
                  <p className="mt-6 text-[12px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                    {card.kicker}
                  </p>
                  <p className="mt-5 max-w-[540px] text-[15px] leading-7 text-slate-600 md:text-[17px] md:leading-8">
                    {card.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
