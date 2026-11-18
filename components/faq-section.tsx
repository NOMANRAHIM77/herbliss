import Link from "next/link";
import { ArrowUpRight, Leaf, Plus, ShoppingCart } from "lucide-react";
import { faqContent as copy } from "@/content/faq";

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="bg-brand-deep relative isolate border-t border-white/15 py-14 text-white sm:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -bottom-24 -left-24 aspect-[7/9] w-[26rem] -rotate-12 bg-[url('/images/faq-botanical-leaf.svg')] bg-contain bg-no-repeat opacity-[0.18] sm:-left-20 sm:w-[38rem]" />
        <div className="absolute -top-36 -right-36 aspect-[7/9] w-[28rem] rotate-[155deg] bg-[url('/images/faq-botanical-leaf.svg')] bg-contain bg-no-repeat opacity-[0.12] sm:w-[34rem]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <h2 id="faq-title" className="sr-only">
          Frequently asked questions
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {copy.groups.map((group, groupIndex) => {
            const Icon = group.id === "products" ? Leaf : ShoppingCart;
            return (
              <div key={group.id}>
                <h3 className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase">
                  <Icon size={16} aria-hidden="true" />
                  {group.title}
                </h3>
                <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/5">
                  {group.questions.map((item, index) => (
                    <details
                      key={item.question}
                      name={"herbliss-faq-" + group.id}
                      open={groupIndex === 0 && index === 0}
                      className="group border-b border-white/15 last:border-b-0 open:bg-white/5"
                    >
                      <summary className="focus-visible:outline-primary flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-sm leading-6 font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-4 sm:px-6 [&::-webkit-details-marker]:hidden">
                        <span>{item.question}</span>
                        <span className="bg-secondary text-brand-deep group-open:bg-primary flex size-7 shrink-0 items-center justify-center rounded-full transition-colors">
                          <Plus
                            size={16}
                            aria-hidden="true"
                            className="transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                          />
                        </span>
                      </summary>
                      <div className="px-5 pb-5 sm:px-6">
                        <p className="max-w-2xl text-sm leading-7 text-white/80">
                          {item.answer}
                        </p>
                        {"link" in item && item.link && (
                          <Link
                            href={item.link.href}
                            className="text-primary mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-semibold underline-offset-4 hover:underline"
                          >
                            {item.link.label}
                            <ArrowUpRight size={15} aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
