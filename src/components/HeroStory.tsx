"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { HERO_ANIM } from "@/content/brasilena";
import { PillButton } from "@/components/PillButton";
import { HeroSplash } from "@/components/HeroSplash";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

// matchMedia query MUST stay byte-identical to SmoothScroll.tsx so the pin and
// ScrollSmoother enable/disable on exactly the same breakpoint.
const DESKTOP_MOTION = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

// Decorative droplets near the neck/pour zone — the only freely-animatable bits
// (the splash PNG is flattened). Pure transform-only spans, animated by the timeline.
const DROPS = [
  { l: "47%", t: "30%", s: 9 },
  { l: "55%", t: "26%", s: 6 },
  { l: "51%", t: "44%", s: 13 },
  { l: "61%", t: "38%", s: 7 },
  { l: "43%", t: "50%", s: 8 },
  { l: "58%", t: "54%", s: 7 },
  { l: "49%", t: "20%", s: 5 },
  { l: "64%", t: "47%", s: 10 },
];

const slug = (w: string) => w.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");

/**
 * Opening act — scroll-storytelling hero. On desktop (motion-safe) the section
 * pins and a scrubbed GSAP timeline runs three beats — STAPPA → VERSA → BRINDA —
 * transforming the high-quality splash still, drifting decorative droplets, and
 * revealing copy + CTAs. The splash is a single flattened PNG, so motion is
 * whole-image transforms + DOM droplets + a pulsing bloom, not per-part movement.
 * Mobile and prefers-reduced-motion get a static, non-pinned stacked hero that
 * reuses <HeroSplash/>. Mirrors the pixelgridui/animated-bottle-scroll technique
 * (ScrollTrigger pin + scrub) on our React/GSAP stack.
 */
export function HeroStory() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MOTION, () => {
        // initial states (overwrite the SSR markup)
        gsap.set(".hs-bottle", { scale: 0.92, y: 30, rotation: -3, transformOrigin: "50% 60%" });
        gsap.set(".hs-bloom", { scale: 0.6, opacity: 0.35 });
        gsap.set(".hs-beat", { opacity: 0, y: 24 });
        gsap.set(".hs-cta", { opacity: 0, y: 20, pointerEvents: "none" });
        gsap.set(".hs-kicker", { opacity: 0, y: -12 });
        gsap.set(".hs-hl-word", { opacity: 0, yPercent: 110 });
        gsap.set(".hs-drop", { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".hs-pin",
            start: "top top",
            end: "+=2800",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Intro
        tl.to(".hs-kicker", { opacity: 1, y: 0, duration: 0.4 }, 0.0)
          .to(".hs-hl-word", { opacity: 1, yPercent: 0, duration: 0.5, stagger: 0.08 }, 0.05)
          .to(".hs-bottle", { scale: 1, y: 0, rotation: 0, duration: 0.6, ease: "power2.out" }, 0.0)
          .to(".hs-bloom", { scale: 0.9, opacity: 0.55, duration: 0.6 }, 0.0);

        // Beat 1 — STAPPA (the pop)
        tl.to(".hs-beat-stappa", { opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.6)" }, 0.6)
          .to(".hs-bottle", { scale: 1.08, rotation: 2, y: -10, duration: 0.45, ease: "power3.out" }, 0.55)
          .to(".hs-bloom", { scale: 1.15, opacity: 0.7, duration: 0.45 }, 0.55)
          .to(
            ".hs-drop",
            { opacity: 1, y: "-=120", x: (i: number) => (i % 2 ? 30 : -30), duration: 0.6, stagger: 0.03, ease: "power2.out" },
            0.6,
          )
          .to(".hs-beat-stappa", { opacity: 0, y: -24, duration: 0.3 }, 1.25);

        // Beat 2 — VERSA (the pour)
        tl.to(".hs-beat-versa", { opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" }, 1.35)
          .to(".hs-bottle", { rotation: -10, x: -40, scale: 1.04, y: 14, duration: 0.7, ease: "sine.inOut" }, 1.3)
          .to(".hs-bloom", { x: 30, scale: 1.1, opacity: 0.6, duration: 0.7 }, 1.3)
          .to(".hs-drop", { y: "+=200", x: 40, opacity: 0.9, duration: 0.7, stagger: 0.02, ease: "power1.in" }, 1.3)
          .to(".hs-beat-versa", { opacity: 0, y: -24, duration: 0.3 }, 2.1);

        // Beat 3 — BRINDA (the toast) + CTAs
        tl.to(".hs-beat-brinda", { opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" }, 2.2)
          .to(".hs-bottle", { rotation: 0, x: 0, y: -6, scale: 1.06, duration: 0.7, ease: "power2.out" }, 2.15)
          .to(".hs-bloom", { x: 0, scale: 1.35, opacity: 0.8, duration: 0.7 }, 2.15)
          .to(".hs-drop", { y: "-=60", opacity: 0.7, duration: 0.8, stagger: 0.02, ease: "sine.inOut" }, 2.15)
          .to(".hs-cta", { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.45, ease: "power2.out" }, 2.45);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  // Smooth-scroll to in-page targets via ScrollSmoother (graceful fallback).
  const jumpTo = (selector: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(selector, true, "top 88px");
    } else {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const [w1, w2, w3] = HERO_ANIM.headline;

  return (
    <div ref={root}>
      {/* ===== PINNED SCENE — desktop + motion-safe ===== */}
      <section className="hs-pin relative hidden min-h-[100svh] w-full overflow-hidden bg-brasilena-yellow text-brasilena-ink motion-safe:md:block">
        {/* warm bloom */}
        <div
          aria-hidden
          className="hs-bloom pointer-events-none absolute left-1/2 top-1/2 z-0 size-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl will-change-transform"
          style={{ background: "radial-gradient(circle, rgba(255,247,200,0.85), transparent 65%)" }}
        />

        {/* droplets */}
        <div aria-hidden className="hs-drops pointer-events-none absolute inset-0 z-10">
          {DROPS.map((d, i) => (
            <span
              key={i}
              className="hs-drop absolute rounded-full bg-brasilena-ink/70 opacity-0 will-change-transform"
              style={{ left: d.l, top: d.t, width: d.s, height: d.s }}
            />
          ))}
        </div>

        {/* content */}
        <div className="relative z-20 mx-auto grid h-[100svh] w-full max-w-[1320px] grid-cols-1 items-center gap-6 px-[clamp(1.25rem,4vw,4rem)] md:grid-cols-[0.82fr_1.18fr] lg:grid-cols-[0.75fr_1.25fr] xl:max-w-[1560px] 2xl:max-w-[1720px]">
          {/* copy */}
          <div className="relative text-left">
            <span className="hs-kicker inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-red">
              <span className="h-px w-8 bg-brasilena-red" />
              {HERO_ANIM.kicker}
            </span>

            <h1 className="hs-headline mt-5 font-display uppercase leading-[0.82] text-[clamp(2.5rem,5.5vw,5rem)]">
              <span className="block overflow-hidden">
                <span className="hs-hl-word block">{w1}</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hs-hl-word block text-brasilena-red">{w2}</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hs-hl-word block">{w3}</span>
              </span>
            </h1>

            {/* crossfading beat words */}
            <div
              role="img"
              aria-label={HERO_ANIM.ticker.join(", ")}
              className="relative mt-7 h-[clamp(3rem,7vw,5.5rem)]"
            >
              {HERO_ANIM.ticker.map((word) => (
                <span
                  key={word}
                  aria-hidden
                  className={`hs-beat hs-beat-${slug(word)} absolute inset-x-0 top-0 font-display uppercase leading-none text-brasilena-red text-[clamp(2.5rem,7vw,5.5rem)]`}
                >
                  {word}
                </span>
              ))}
            </div>

            <div className="hs-cta mt-9 flex flex-wrap items-center gap-3.5">
              <PillButton href="#prodotti" tone="ink" onClick={jumpTo("#prodotti")}>
                {HERO_ANIM.ctaPrimary}
              </PillButton>
              <PillButton href="#la-mia-gente" tone="red" onClick={jumpTo("#la-mia-gente")}>
                {HERO_ANIM.ctaSecondary}
              </PillButton>
            </div>
          </div>

          {/* bottle */}
          <div className="relative mx-auto aspect-square w-full max-w-[42rem]">
            <div className="hs-bottle relative size-full will-change-transform">
              <Image
                src="/images/brasilena/hero-splash.png"
                alt="Bottiglia Brasilena che si stappa, con il tappo che salta e il caffè che esplode"
                fill
                priority
                quality={90}
                sizes="(max-width: 1280px) 52vw, 720px"
                className="object-contain drop-shadow-[0_30px_45px_rgba(106,63,64,0.28)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FALLBACK — mobile + reduced-motion (no pin) ===== */}
      <section className="relative block min-h-[100svh] w-full overflow-hidden bg-brasilena-yellow text-brasilena-ink motion-safe:md:hidden">
        <div className="mx-auto grid min-h-[100svh] w-full max-w-[1320px] grid-cols-1 items-center gap-6 px-[clamp(1.25rem,5vw,4rem)] pt-[clamp(6rem,13vh,9rem)] pb-16 text-center">
          <div>
            <span className="inline-flex items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-red">
              <span className="h-px w-8 bg-brasilena-red" />
              {HERO_ANIM.kicker}
            </span>

            <h1 className="mt-5 font-display uppercase leading-[0.82] text-[clamp(2.5rem,9vw,4.5rem)]">
              <span className="block">{w1}</span>
              <span className="block text-brasilena-red">{w2}</span>
              <span className="block">{w3}</span>
            </h1>

            <div className="relative mx-auto mt-6 aspect-square w-full max-w-[26rem]">
              <HeroSplash />
            </div>

            <p className="mx-auto mt-6 max-w-[34ch] font-sans text-[clamp(1rem,1.2vw,1.12rem)] leading-relaxed text-brasilena-ink/80">
              {HERO_ANIM.lede}
            </p>

            <p className="mt-6 font-display text-[clamp(1.5rem,7vw,2.5rem)] uppercase leading-none text-brasilena-red">
              {HERO_ANIM.ticker.join(" · ")}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <PillButton href="#prodotti" tone="ink" onClick={jumpTo("#prodotti")}>
                {HERO_ANIM.ctaPrimary}
              </PillButton>
              <PillButton href="#la-mia-gente" tone="red" onClick={jumpTo("#la-mia-gente")}>
                {HERO_ANIM.ctaSecondary}
              </PillButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
