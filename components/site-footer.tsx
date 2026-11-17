import { MapPin, Phone } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SocialIcons } from "@/components/social-icons";
import { WhatsAppIcon, whatsappUrl } from "@/components/whatsapp-icon";
import { footerContent as copy, homeContent, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-secondary">
      <div className="mx-auto max-w-7xl px-5 pt-14 pb-24 sm:px-8 lg:pt-20 lg:pb-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.15fr_1.4fr] lg:gap-x-7">
          <div>
            <a
              href="/#home"
              className="inline-flex min-h-11 items-center"
              aria-label={site.name}
            >
              <BrandMark inverse />
            </a>
            <p className="text-primary mt-5 text-xs tracking-[0.16em] uppercase">
              {copy.tagline}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
              {homeContent.footerText}
            </p>
            <div className="mt-4">
              <SocialIcons inverse />
            </div>
          </div>
          <nav aria-labelledby="footer-links">
            <h2
              id="footer-links"
              className="text-primary mb-4 text-sm font-semibold"
            >
              {copy.quickLinksTitle}
            </h2>
            <ul>
              {copy.quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={"/" + link.href}
                    className="hover:text-primary inline-flex min-h-11 items-center text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-primary mb-4 text-sm font-semibold">
              {copy.careTitle}
            </h2>
            <p className="mb-2 text-xs text-white/55">{copy.pendingLabel}</p>
            <ul className="space-y-3 text-sm leading-6 text-white/65">
              {copy.carePending.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
          <div id="contact" className="scroll-mt-8">
            <h2 className="text-primary mb-4 text-sm font-semibold">
              {copy.contactTitle}
            </h2>
            <a
              href={`tel:+${site.contact.whatsapp}`}
              className="hover:text-primary flex min-h-11 items-center gap-3 text-sm"
            >
              <Phone
                size={18}
                className="text-primary shrink-0"
                aria-hidden="true"
              />
              {site.contact.whatsappDisplay}
            </a>
            <a
              href={whatsappUrl}
              className="hover:text-primary flex min-h-11 items-center gap-3 text-sm"
            >
              <WhatsAppIcon size={18} />
              {homeContent.whatsappLabel}
            </a>
            <div className="mt-3 flex items-start gap-3 text-sm leading-6">
              <MapPin
                size={18}
                className="text-primary mt-1 shrink-0"
                aria-hidden="true"
              />
              <p>
                {copy.delivery}
                <span className="mt-1 block text-xs text-white/65">
                  {copy.deliveryDetails}
                </span>
              </p>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-primary mb-5 text-sm font-semibold">
              {copy.newsletterTitle}
            </h2>
            <p className="max-w-sm text-sm leading-6 text-white/80">
              {copy.newsletterDescription}
            </p>
            <label htmlFor="newsletter-email" className="sr-only">
              {copy.emailLabel}
            </label>
            <input
              id="newsletter-email"
              type="email"
              disabled
              placeholder={copy.emailPlaceholder}
              aria-describedby="newsletter-status"
              className="mt-5 h-12 w-full rounded border border-white/20 bg-white/5 px-4 text-sm placeholder:text-white/45 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              disabled
              aria-describedby="newsletter-status"
              className="bg-primary text-foreground mt-3 min-h-12 w-full rounded px-4 text-xs font-semibold tracking-[0.18em] uppercase disabled:cursor-not-allowed"
            >
              {copy.subscribeLabel}
            </button>
            <p
              id="newsletter-status"
              className="mt-3 text-xs leading-5 text-white/60"
            >
              {copy.newsletterPending}
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-white/20 pt-6 text-xs leading-5 text-white/60 lg:mt-16">
          <p>
            © {new Date().getFullYear()} {site.name}. {copy.rights}
          </p>
          <p className="flex gap-5 lg:pr-16">
            <span title={copy.pendingLabel}>
              {copy.privacy}{" "}
              <span className="sr-only">— {copy.pendingLabel}</span>
            </span>
            <span title={copy.pendingLabel}>
              {copy.terms}{" "}
              <span className="sr-only">— {copy.pendingLabel}</span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
