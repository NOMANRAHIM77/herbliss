import { careSection as copy } from "@/content/care-section";

export function CareSection() {
  return (
    <section
      className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20"
      aria-label={copy.highlightsLabel}
    >
      <dl
        aria-label={copy.highlightsLabel}
        className="bg-brand-deep grid grid-cols-2 overflow-hidden rounded-2xl text-white lg:grid-cols-4"
      >
        {copy.highlights.map((highlight, index) => (
          <div
            key={highlight.label}
            className={`relative p-5 sm:px-8 sm:py-7 ${index % 2 === 0 ? "border-r border-white/20" : ""} ${index < 2 ? "border-b border-white/20 lg:border-b-0" : ""} ${index === 1 ? "lg:border-r lg:border-white/20" : ""}`}
          >
            <span
              className="bg-primary mb-4 block h-0.5 w-7"
              aria-hidden="true"
            />
            <dt className="sr-only">{highlight.label}</dt>
            <dd className="text-3xl font-medium tracking-[-0.05em] text-white sm:text-4xl xl:text-5xl">
              {highlight.value}
            </dd>
            <p aria-hidden="true" className="mt-3 text-sm font-medium">
              {highlight.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-white/80">
              {highlight.detail}
            </p>
          </div>
        ))}
      </dl>
    </section>
  );
}
