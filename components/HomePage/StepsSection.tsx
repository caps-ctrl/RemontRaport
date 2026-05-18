import { SectionHeading } from "./HomePage-Ui";
import { Icon } from "./HomePage-Ui";
const steps = [
  {
    icon: "folder" as const,
    title: "Dodaj projekt",
    body: "Wprowadź podstawowe dane projektu i zaproś zespół.",
  },
  {
    icon: "camera" as const,
    title: "Wrzuć zdjęcia i notatki",
    body: "Dodawaj zdjęcia prosto z telefonu, pisz notatki i opisuj prace.",
  },
  {
    icon: "alert" as const,
    title: "Oznacz usterki",
    body: "Zaznacz usterki na zdjęciach, ustal status i przypisz osobę.",
  },
  {
    icon: "file" as const,
    title: "Wygeneruj raport i wyślij klientowi",
    body: "Raport PDF gotowy w 5 minut. Wyślij mailem jednym kliknięciem.",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  return (
    <>
      <article className="flex min-h-[108px] gap-5 rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
        <div className="relative grid size-14 shrink-0 place-items-center rounded-[12px] bg-blue-50 text-blue-600">
          <Icon name={step.icon} className="size-9" />
          <span className="absolute -left-2 -top-2 grid size-8 place-items-center rounded-full bg-blue-600 text-[16px] font-extrabold text-white">
            {index + 1}
          </span>
        </div>
        <div>
          <h3 className="text-[15px] font-extrabold text-slate-950">
            {index + 1}. {step.title}
          </h3>
          <p className="mt-2 text-[13px] leading-5 text-slate-600">
            {step.body}
          </p>
        </div>
      </article>
      {index < steps.length - 1 && (
        <div
          className="hidden text-3xl font-light text-slate-300 md:block"
          aria-hidden
        >
          →
        </div>
      )}
    </>
  );
}

export function StepsSection() {
  return (
    <section className="bg-white py-6 md:py-8">
      <div className="mx-auto max-w-[1260px] px-5 md:px-8">
        <SectionHeading id="jak-to-dziala">Jak to działa</SectionHeading>
        <div className="mt-5 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
