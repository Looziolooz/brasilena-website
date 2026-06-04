"use client";

import { useRef, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { HERO_ANIM } from "@/content/brasilena";
import { PillButton } from "@/components/PillButton";
import { HeroSplash } from "@/components/HeroSplash";

gsap.registerPlugin(ScrollSmoother, useGSAP);

/**
 * Opening act: a yellow hero — headline, lede and CTAs beside a static Brasilena
 * bottle. (The former scroll-scrubbed frame-by-frame "stappo" sequence has been
 * removed; the bottle is now a single still product shot, no drink animation.)
 * Left column holds the copy; the CTAs smooth-scroll to in-page targets via
 * ScrollSmoother when present, falling back to native smooth scroll.
 */
export function HeroBottle() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Copy entrance only — the bottle itself no longer animates. Honour
      // reduced-motion by skipping the entrance entirely.
      const reduce =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.from(".hb-rise", { y: 26, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 });
    },
    { scope: root },
  );

  // Smooth-scroll to an in-page target via ScrollSmoother (falls back gracefully).
  const jumpTo = (selector: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(selector, true, "top 88px");
    } else {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={root}>
      <section className="hb-hero relative flex min-h-[100svh] flex-col overflow-hidden bg-brasilena-yellow text-brasilena-ink md:min-h-screen">
        <div className="relative z-10 mx-auto grid w-full max-w-[1320px] flex-1 grid-cols-1 items-center gap-6 px-[clamp(1.25rem,4vw,4rem)] pt-[clamp(6rem,13vh,9rem)] pb-16 md:grid-cols-[0.78fr_1.22fr] md:gap-4 md:pb-12 lg:grid-cols-[0.7fr_1.3fr] xl:max-w-[1560px] 2xl:max-w-[1720px]">
          {/* Copy */}
          <div className="order-2 text-center md:order-1 md:text-left">
            <span className="hb-rise inline-flex items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-red md:justify-start">
              <span className="h-px w-8 bg-brasilena-red" />
              {HERO_ANIM.kicker}
            </span>

            <h1 className="hb-rise mt-5 font-display uppercase leading-[0.82] text-brasilena-ink text-[clamp(2.5rem,5.5vw,5rem)]">
              <span className="block">{HERO_ANIM.headline[0]}</span>
              <span className="block text-brasilena-red">{HERO_ANIM.headline[1]}</span>
              <span className="block">{HERO_ANIM.headline[2]}</span>
            </h1>

            <p className="hb-rise mx-auto mt-6 max-w-[34ch] font-sans text-[clamp(1rem,1.2vw,1.12rem)] leading-relaxed text-brasilena-ink/80 md:mx-0">
              {HERO_ANIM.lede}
            </p>

            <div className="hb-rise mt-9 flex flex-wrap items-center justify-center gap-3.5 md:justify-start">
              <PillButton href="#prodotti" tone="ink" onClick={jumpTo("#prodotti")}>
                {HERO_ANIM.ctaPrimary}
              </PillButton>
              <PillButton href="#la-mia-gente" tone="red" onClick={jumpTo("#la-mia-gente")}>
                {HERO_ANIM.ctaSecondary}
              </PillButton>
            </div>
          </div>

          {/* Stage — animated bottle still (ambient float + mouse parallax) */}
          <div className="order-1 mx-auto w-full max-w-120 md:order-2 md:max-w-none">
            <div className="hb-scene relative aspect-square w-full overflow-visible">
              {/* Warm bloom behind the bottle */}
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -z-10 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                style={{ background: "radial-gradient(circle, rgba(255,247,200,0.7), transparent 65%)" }}
              />

              <HeroSplash />
            </div>
          </div>
        </div>

        {/* Ticker — full-width, oversized, scrolling left → right (reverse) */}
        <div className="relative z-10 w-full overflow-hidden border-y border-brasilena-ink/15 py-[clamp(0.6rem,1.4vw,1.2rem)]">
          <div className="flex w-max animate-[marquee_32s_linear_infinite_reverse] whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, dup) => (
              <span
                key={dup}
                aria-hidden={dup === 1}
                className="flex shrink-0 items-center font-display uppercase leading-none text-brasilena-ink text-[clamp(2.25rem,6.5vw,5.5rem)]"
              >
                {Array.from({ length: 4 })
                  .flatMap(() => HERO_ANIM.ticker)
                  .map((word, i) => (
                    <span key={i} className="flex items-center">
                      <span className="px-5">{word}</span>
                      <span className="text-brasilena-red">✦</span>
                    </span>
                  ))}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
