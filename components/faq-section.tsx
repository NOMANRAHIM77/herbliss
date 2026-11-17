import Link from "next/link";
import { ArrowUpRight, Leaf, Plus, ShoppingBag } from "lucide-react";
import { faqContent as copy } from "@/content/faq";
import { WhatsAppIcon, whatsappUrl } from "@/components/whatsapp-icon";

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative isolate border-t border-white/15 bg-brand-deep py-14 text-white sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-24 -left-24 aspect-[7/9] w-[26rem] -rotate-12 bg-[url('/images/faq-botanical-leaf.svg')] bg-contain bg-no-repeat opacity-[0.18] sm:-left-20 sm:w-[38rem]" />
        <div className="absolute -top-36 -right-36 aspect-[7/9] w-[28rem] rotate-[155deg] bg-[url('/images/faq-botanical-leaf.svg')] bg-contain bg-no-repeat opacity-[0.12] sm:w-[34rem]" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-8">
          <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-primary"><Leaf size={25} strokeWidth={1.5} aria-hidden="true" /></span>
          <p className="text-[10px] font-semibold tracking-[0.17em] text-primary uppercase">{copy.eyebrow}</p>
          <h2 id="faq-title" className="mt-4 max-w-sm text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl">{copy.title}</h2>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">{copy.introduction}</p>
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-6">
            <span aria-hidden="true" className="absolute -top-8 -right-8 size-24 rounded-full bg-primary/15" />
            <h3 className="relative text-base font-semibold">{copy.contactTitle}</h3>
            <p className="relative mt-2 text-xs leading-6 text-white/80">{copy.contactDescription}</p>
            <a href={whatsappUrl} className="relative mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary px-4 text-sm font-semibold text-foreground transition-colors hover:bg-primary">
              <WhatsAppIcon size={22} />{copy.contactAction}<ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <Link href="/#ingredient-library" className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary underline-offset-4 hover:underline">{copy.ingredientLink}<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>

        <div className="space-y-8">
          {copy.groups.map((group, groupIndex) => {
            const Icon = group.id === "products" ? Leaf : ShoppingBag;
            return (
              <div key={group.id}>
                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-primary uppercase"><Icon size={16} aria-hidden="true" />{group.title}</h3>
                <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/5">
                  {group.questions.map((item, index) => (
                    <details key={item.question} name="herbliss-faq" open={groupIndex === 0 && index === 0} className="group border-b border-white/15 last:border-b-0 open:bg-white/5">
                      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-sm leading-6 font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary sm:px-6 [&::-webkit-details-marker]:hidden">
                        <span>{item.question}</span>
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-brand-deep transition-colors group-open:bg-primary"><Plus size={16} aria-hidden="true" className="transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" /></span>
                      </summary>
                      <div className="px-5 pb-5 sm:px-6">
                        <p className="max-w-2xl text-sm leading-7 text-white/80">{item.answer}</p>
                        {"link" in item && item.link && <Link href={item.link.href} className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary underline-offset-4 hover:underline">{item.link.label}<ArrowUpRight size={15} aria-hidden="true" /></Link>}
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
