import { ArrowRight, Droplets, Leaf, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { careSection as copy } from "@/content/care-section";

const icons = { leaf: Leaf, droplet: Droplets, package: Package, truck: Truck };

export function CareSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20" aria-labelledby="care-title">
      <dl
        aria-label={copy.highlightsLabel}
        className="grid grid-cols-2 overflow-hidden rounded-2xl bg-brand-deep text-white lg:grid-cols-4"
      >
        {copy.highlights.map((highlight, index) => (
          <div
            key={highlight.label}
            className={`relative p-5 sm:px-8 sm:py-7 ${index % 2 === 0 ? "border-r border-white/20" : ""} ${index < 2 ? "border-b border-white/20 lg:border-b-0" : ""} ${index === 1 ? "lg:border-r lg:border-white/20" : ""}`}
          >
            <span className="mb-4 block h-0.5 w-7 bg-primary" aria-hidden="true" />
            <dt className="sr-only">{highlight.label}</dt>
            <dd className="text-3xl font-medium tracking-[-0.05em] text-white sm:text-4xl xl:text-5xl">
              {highlight.value}
            </dd>
            <p aria-hidden="true" className="mt-3 text-sm font-medium">{highlight.label}</p>
            <p className="mt-1 text-xs leading-5 text-white/80">{highlight.detail}</p>
          </div>
        ))}
      </dl>

      <div className="relative mt-8 overflow-hidden rounded-3xl border border-brand-deep/15 bg-gradient-to-br from-secondary via-white to-primary/20 p-6 sm:p-10 lg:mt-12 lg:p-12">
        <Leaf className="pointer-events-none absolute -top-14 -right-12 size-72 rotate-[-25deg] text-brand-deep/[0.04]" strokeWidth={1} aria-hidden="true" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <p className="mb-5 flex items-center gap-2.5 text-xs font-semibold tracking-[0.16em] text-brand-deep uppercase">
              <span className="size-2 rounded-full bg-brand-deep ring-4 ring-primary/40" aria-hidden="true" />
              {copy.eyebrow}
            </p>
            <h2 id="care-title" className="text-3xl leading-[1.15] font-medium tracking-[-0.05em] sm:text-4xl xl:text-5xl">
              {copy.title}
              <span className="mt-1 block text-brand-deep">{copy.titleAccent}</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">{copy.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild><a href="#hair-oil">{copy.primaryAction}<ArrowRight aria-hidden="true" /></a></Button>
              <Button asChild variant="ghost"><a href="#collection">{copy.secondaryAction}<ArrowRight aria-hidden="true" /></a></Button>
            </div>
            <a href="#bundles" className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-lg text-sm transition-colors hover:text-brand-deep">
              <Package size={20} className="shrink-0 text-brand-deep" aria-hidden="true" />
              <span><span className="block font-semibold">{copy.duoLabel}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{copy.duoDescription}</span></span>
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.cards.map((card) => {
              const Icon = icons[card.icon];
              return (
                <a key={card.title} href={card.href} className="group flex gap-4 rounded-2xl border border-brand-deep/10 bg-white/90 p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-brand-deep/30 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none sm:min-h-44 sm:flex-col">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-brand-deep transition-colors group-hover:bg-primary"><Icon size={21} strokeWidth={1.5} aria-hidden="true" /></span>
                  <span><span className="block text-sm font-semibold leading-5">{card.title}</span><span className="mt-2 block text-xs leading-6 text-muted-foreground">{card.description}</span></span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
