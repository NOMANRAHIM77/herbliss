"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  House,
  Droplets,
  Bubbles,
  HandHeart,
  Package,
  CircleHelp,
  Sprout,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SocialIcons } from "@/components/social-icons";
import { HeaderActions } from "@/components/header-actions";
import { homeContent as copy, site } from "@/content/site";
const navIcons = [
  House,
  Droplets,
  Bubbles,
  HandHeart,
  Package,
  CircleHelp,
  Sprout,
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = drawer.current;
    if (!dialog) return;
    if (!menuOpen) {
      const timer = setTimeout(() => dialog.close(), 280);
      return () => clearTimeout(timer);
    }
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);
  return (
    <>
      <div className="bg-primary">
        <div className="flex w-full items-center gap-3 px-3 text-[11px] font-medium sm:px-8 sm:text-xs">
          <div className="announcement-rail min-w-0 flex-1 overflow-hidden py-2">
            <p className="sr-only">
              {copy.announcement}. {copy.announcementOffer}.
            </p>
            <div className="announcement-track flex w-max" aria-hidden="true">
              {[0, 1].map((repeat) => (
                <div
                  key={repeat}
                  className="flex min-w-[calc(100vw-5rem)] shrink-0 items-center justify-around gap-10 pr-10"
                >
                  <span className="whitespace-nowrap">{copy.announcement}</span>
                  <span className="whitespace-nowrap">
                    ✦ {copy.announcementOffer}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0">
            <SocialIcons />
          </div>
        </div>
      </div>
      <header className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-1 px-3 py-3 sm:px-8 sm:py-5 xl:py-7">
        <Link
          href="/"
          className="order-1 inline-flex min-h-11 min-w-0 items-center"
          onClick={() => setMenuOpen(false)}
        >
          <BrandMark compact />
        </Link>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className="order-2 hidden items-center gap-1 text-sm xl:flex"
        >
          {site.navigation.map((item, index) => {
            const Icon = navIcons[index] ?? Sprout;
            return (
              <Link
                key={item.href}
                href={item.href.startsWith("#") ? "/" + item.href : item.href}
                onClick={() => setMenuOpen(false)}
                className="hover:bg-primary focus-visible:bg-primary flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs transition-colors duration-200 motion-reduce:transition-none sm:text-sm xl:shrink-0"
              >
                <Icon
                  size={17}
                  className="text-brand-deep shrink-0 xl:hidden"
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="order-2 flex shrink-0 items-center xl:order-3">
          <HeaderActions />
          <button
            ref={menuButton}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            className="hover:bg-primary focus-visible:bg-primary flex size-11 items-center justify-center rounded-lg transition-colors xl:hidden"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      <dialog
        ref={drawer}
        id="mobile-navigation"
        aria-label="Navigation menu"
        data-state={menuOpen ? "open" : "closed"}
        className="mobile-menu text-foreground fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-black/45 p-0 backdrop-blur-sm backdrop:bg-transparent"
        onCancel={(event) => {
          event.preventDefault();
          setMenuOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMenuOpen(false);
        }}
        onClose={() => menuButton.current?.focus()}
      >
        <div className="mobile-menu-panel bg-secondary flex h-full w-[min(85vw,22rem)] flex-col p-5 shadow-2xl">
          <div className="mb-8 flex items-center justify-between gap-2">
            <BrandMark compact />
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMenuOpen(false)}
              className="hover:bg-primary flex size-11 shrink-0 items-center justify-center rounded-full bg-white"
            >
              <X size={22} />
            </button>
          </div>
          <p className="text-brand-deep mb-3 text-xs font-semibold tracking-widest uppercase">
            Explore Herbliss
          </p>
          <nav
            aria-label="Mobile navigation"
            className="min-h-0 overflow-y-auto"
          >
            {site.navigation.map((item, index) => {
              const Icon = navIcons[index] ?? Sprout;
              return (
                <Link
                  key={item.href}
                  href={item.href.startsWith("#") ? "/" + item.href : item.href}
                  onClick={() => setMenuOpen(false)}
                  className="hover:bg-primary focus-visible:bg-primary mb-2 flex min-h-13 items-center gap-4 rounded-xl px-4 text-sm font-medium transition-colors"
                >
                  <Icon
                    size={20}
                    className="text-brand-deep"
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </dialog>
    </>
  );
}
