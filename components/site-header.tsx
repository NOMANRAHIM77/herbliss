import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SocialIcons } from "@/components/social-icons";
import { HeaderActions } from "@/components/header-actions";
import { homeContent as copy, site } from "@/content/site";
export function SiteHeader() {
  return (
    <>
      <div className="bg-primary">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 text-xs font-medium sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 lg:col-start-2 lg:justify-center lg:gap-x-8">
            <span>{copy.announcement}</span>
            <span className="hidden sm:inline" aria-hidden="true">
              /
            </span>
            <span className="hidden sm:inline">{copy.announcementOffer}</span>
          </div>
          <div className="justify-self-end">
            <SocialIcons />
          </div>
        </div>
      </div>
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-2 gap-y-4 px-5 py-5 sm:px-8 lg:py-7">
        <Link href="/" className="inline-flex min-h-11 items-center">
          <BrandMark />
        </Link>
        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm xl:order-none xl:w-auto"
        >
          {site.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href.startsWith("#") ? "/" + item.href : item.href}
              className="hover:bg-primary focus-visible:bg-primary flex min-h-11 shrink-0 items-center rounded-lg px-3 transition-colors duration-200 motion-reduce:transition-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <HeaderActions />
      </header>
    </>
  );
}
