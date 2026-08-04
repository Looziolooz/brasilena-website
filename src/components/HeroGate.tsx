"use client";

import { useEffect, useState } from "react";
import { HERO_GATE } from "@/content/brasilena";

/** Fired once, when the visitor opens the hero. BrasilenaScrollSequence listens. */
export const HERO_OPEN_EVENT = "brasilena:hero-open";

/**
 * The screen the homepage opens on: brand yellow and a single invitation. The
 * hero stays parked until it is clicked, then the bottle drops in.
 *
 * MUST be rendered outside #smooth-content. ScrollSmoother transforms that
 * element, and `position: fixed` inside a transformed ancestor anchors to the
 * ancestor rather than the viewport — from in there this panel stretches over
 * the whole document and centres its button thousands of pixels down the page.
 *
 * A real <button>, so Enter and Space open it too, and it fills the screen so a
 * click anywhere counts. Reduced motion skips it: there is no entrance to stage
 * for those visitors, and gating the content behind a click would be pure toll.
 */
export function HeroGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  if (open) return null;

  return (
    <>
      {/* With JS off nothing can ever open this, and nothing reveals the hero
          copy either — so neutralise both rather than serve a dead screen. */}
      <noscript>
        <style>{`.hero-gate{display:none!important}.hero-veil{opacity:1!important}`}</style>
      </noscript>

      <button
        type="button"
        onClick={() => {
          window.dispatchEvent(new Event(HERO_OPEN_EVENT));
          setOpen(true);
        }}
        className="hero-gate fixed inset-0 z-100 grid place-items-center bg-brasilena-yellow motion-reduce:hidden"
      >
        <span className="flex flex-col items-center gap-6">
          <span className="hero-gate-pill inline-flex items-center justify-center rounded-full bg-brasilena-red px-[clamp(2rem,6vw,3.5rem)] py-[clamp(0.75rem,2vw,1.25rem)] font-display uppercase leading-none text-[clamp(2.5rem,9vw,5rem)]! text-brasilena-cream shadow-[0_18px_40px_-14px_rgba(106,63,64,0.6)]">
            {HERO_GATE.action}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brasilena-ink/60 md:text-[11px]">
            {HERO_GATE.hint}
          </span>
        </span>
      </button>
    </>
  );
}
