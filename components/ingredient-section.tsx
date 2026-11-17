import Link from "next/link";
import { ArrowRight, Droplets, Flower2, Leaf, Sprout } from "lucide-react";
import { ingredientSection as copy } from "@/content/ingredient-section";

const icons = { leaf: Leaf, droplet: Droplets, flower: Flower2, sprout: Sprout };
const tones = {
  cream: "border-[#e5ddc8] bg-[#faf5e9] text-[#584622]",
  mint: "border-[#cde5d7] bg-[#eff9f2] text-[#245b3a]",
  rose: "border-[#ecd5d5] bg-[#fff2f0] text-[#86464c]",
  sage: "border-[#d5dfcd] bg-[#f1f5ec] text-[#4b613d]",
};

export function IngredientSection() {
  return (
    <section id="why-choose-us" aria-labelledby="ingredients-story-title" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24">
      <div className="grid overflow-hidden rounded-3xl border border-brand-deep/10 bg-[#fcfdf9] lg:grid-cols-[0.9fr_1.4fr]">
        <div className="relative overflow-hidden bg-[#123c2a] p-7 text-white sm:p-10 lg:p-11">
          <Leaf aria-hidden="true" strokeWidth={0.7} className="pointer-events-none absolute -bottom-16 -left-16 size-80 rotate-[-25deg] text-primary/10" />
          <div className="relative flex h-full flex-col">
            <div className="mb-7 flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Sprout size={25} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">{copy.eyebrow}</p>
            <h2 id="ingredients-story-title" className="mt-4 text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl">{copy.title}</h2>
            <p className="mt-5 text-sm leading-7 text-white/80">{copy.introduction}</p>
            <ul className="my-8 space-y-6">
              {copy.reasons.map((reason, index) => (
                <li key={reason.title} className="flex gap-3.5">
                  <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/30 text-[10px] text-primary">0{index + 1}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{reason.title}</h3>
                    <p className="mt-1.5 text-xs leading-6 text-white/70">{reason.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href={copy.actionHref} className="group mt-auto inline-flex min-h-12 items-center justify-between gap-3 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary-hover">
              {copy.action}<ArrowRight size={18} aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
            </Link>
          </div>
        </div>

        <div className="p-5 sm:p-8 lg:p-10">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-brand-deep uppercase">{copy.ingredientsEyebrow}</p>
          <h3 className="mt-3 max-w-lg text-2xl leading-snug font-medium tracking-tight sm:text-3xl">{copy.ingredientsTitle}</h3>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {copy.cards.map((card) => {
              const Icon = icons[card.icon];
              return (
                <article key={card.title} className={`flex flex-col rounded-2xl border p-5 ${tones[card.tone]}`}>
                  <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-white/70"><Icon size={24} strokeWidth={1.4} aria-hidden="true" /></div>
                  <p className="text-[9px] font-semibold tracking-[0.12em] uppercase">{card.category}</p>
                  <h4 className="mt-2 text-lg font-semibold tracking-tight">{card.title}</h4>
                  <p className="mt-3 text-xs leading-6">{card.description}</p>
                  <Link href={card.href} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-xs font-semibold underline-offset-4 hover:underline">
                    {card.linkLabel}<ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
