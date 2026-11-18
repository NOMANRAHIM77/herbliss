import Link from "next/link";
import { ArrowRight, Leaf, Sprout } from "lucide-react";
import { ingredientSection as copy } from "@/content/ingredient-section";

export function IngredientSection() {
  return (
    <section
      id="why-choose-us"
      aria-labelledby="ingredients-story-title"
      className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-24"
    >
      <div className="border-brand-deep/10 overflow-hidden rounded-3xl border">
        <div className="relative overflow-hidden bg-[#123c2a] p-7 text-white sm:p-10 lg:p-11">
          <Leaf
            aria-hidden="true"
            strokeWidth={0.7}
            className="text-primary/10 pointer-events-none absolute -bottom-16 -left-16 size-80 rotate-[-25deg]"
          />
          <div className="relative mx-auto flex max-w-5xl flex-col">
            <div className="border-primary/30 bg-primary/10 text-primary mb-7 flex size-12 items-center justify-center rounded-full border">
              <Sprout size={25} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="text-primary text-[10px] font-semibold tracking-[0.2em] uppercase">
              {copy.eyebrow}
            </p>
            <h2
              id="ingredients-story-title"
              className="mt-4 text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl"
            >
              {copy.title}
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80">
              {copy.introduction}
            </p>
            <ul className="my-8 grid gap-6 md:grid-cols-3">
              {copy.reasons.map((reason, index) => (
                <li key={reason.title} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="border-primary/30 text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px]"
                  >
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {reason.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-6 text-white/70">
                      {reason.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href={copy.actionHref}
              className="group bg-primary text-foreground hover:bg-primary-hover mt-auto inline-flex min-h-12 items-center justify-between gap-3 self-start rounded-full px-5 py-3 text-sm font-semibold transition-colors"
            >
              {copy.action}
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
