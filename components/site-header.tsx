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
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setMenuOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
    };
  }, [menuOpen]);
  return (
    <>
      <div className="bg-primary">
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 text-[11px] font-medium sm:px-8 sm:text-xs lg:grid-cols-[1fr_auto_1fr]">
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
      <header
        ref={header}
        className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-1 px-3 py-3 sm:px-8 sm:py-5 xl:py-7"
      >
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
          className={`${menuOpen ? "grid" : "hidden"} border-brand-deep/15 bg-secondary order-3 mt-3 w-full grid-cols-2 gap-1 rounded-2xl border p-2 text-sm xl:order-2 xl:mt-0 xl:flex xl:w-auto xl:items-center xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0`}
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
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            className="hover:bg-primary focus-visible:bg-primary flex size-11 items-center justify-center rounded-lg transition-colors xl:hidden"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
    </>
  );
}
