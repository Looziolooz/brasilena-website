"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAV, SITE } from "@/content/brasilena";
import { InstagramIcon, MenuIcon, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Fixed top bar. Text is dark ink over the light hero, then switches to red on
 * a cream bar once scrolled. The circular Brasilena logo sits on the left; nav
 * links sit on the right with the Instagram icon pinned after them. Hamburger
 * opens a full-screen overlay menu on mobile. `pinnedHero` keeps the bar
 * transparent for the whole homepage scroll-scrub so it never covers the
 * popping cap.
 */
export function Header({ pinnedHero = false }: { pinnedHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Over the homepage's pinned canvas hero the bar must stay transparent
    // until the whole scrub is done (the pin spans PIN_VH viewports — keep in
    // sync with BrasilenaScrollSequence), otherwise the cream bar would cover
    // the popping cap. Reduced-motion has no pin, so it keeps the standard
    // ~0.85vh switch.
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    const factor = pinnedHero && motionOk ? 3.42 : 0.85;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * factor);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pinnedHero]);

  const tone = scrolled ? "text-brasilena-red" : "text-brasilena-ink";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled && "bg-brasilena-cream/95 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md",
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-[clamp(1.25rem,5vw,4rem)] pb-5 pt-[clamp(2rem,4vw,3rem)] transition-colors duration-300",
            tone,
          )}
        >
          {/* Circular brand logo — left */}
          <Link href="/" aria-label="Brasilena" className="shrink-0">
            <Image
              src="/images/logo-brasilena.png"
              alt="Brasilena"
              width={384}
              height={384}
              priority
              className="size-16 object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-transform hover:scale-105 md:size-24"
            />
          </Link>

          {/* Nav, then Instagram pinned to the far right, then mobile menu */}
          <div className="flex items-center gap-[clamp(1.25rem,2.5vw,2.25rem)]">
            <nav className="hidden items-center gap-9 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="font-sans text-sm font-medium uppercase tracking-wide transition-opacity hover:opacity-60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid size-11 place-items-center rounded-full border border-current/40 transition-colors hover:bg-current/10"
            >
              <InstagramIcon className="size-5" />
            </a>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Apri menu"
              className="grid size-11 place-items-center rounded-full border border-current/40 transition-colors hover:bg-current/10 md:hidden"
            >
              <MenuIcon className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay menu */}
      <div
        className={cn(
          "fixed inset-0 z-[70] flex flex-col bg-brasilena-yellow text-brasilena-ink transition-[clip-path,opacity] duration-500",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ clipPath: menuOpen ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
      >
        <div className="flex items-center justify-between px-[clamp(1.25rem,5vw,4rem)] py-5">
          <Image
            src="/images/logo-brasilena.png"
            alt="Brasilena"
            width={384}
            height={384}
            className="size-16 object-contain"
          />
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Chiudi menu"
            className="grid size-11 place-items-center rounded-full border border-current/40 transition-colors hover:bg-current/10"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col items-center justify-center gap-4">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-display text-6xl uppercase leading-none transition-opacity hover:opacity-60"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
