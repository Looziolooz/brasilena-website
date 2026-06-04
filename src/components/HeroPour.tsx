"use client";

import { useRef, type MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { HERO_ANIM } from "@/content/brasilena";
import { PillButton } from "@/components/PillButton";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

// matchMedia query MUST stay byte-identical to SmoothScroll.tsx (pin + smoothing
// enable on the same breakpoint).
const DESKTOP_MOTION = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

const FRAME_COUNT = 18;
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => `/images/brasilena/pop-${i + 1}.webp`);

// Pop-up labels (Stappa / Versa / Brinda) — scattered at DIFFERENT spots around
// the bottle inside the frame stage. `at` = scroll progress (0–1) when each pops
// in; `rot` = resting tilt. Tune left/top (relative to the stage box) freely.
const POPS = [
  { left: "41%", top: "17%", rot: -7, at: 0.08, tone: "bg-brasilena-red text-brasilena-cream" },
  { left: "-2%", top: "44%", rot: 5, at: 0.46, tone: "bg-brasilena-ink text-brasilena-yellow" },
  { left: "62%", top: "45%", rot: -4, at: 0.74, tone: "bg-[#c8a77c] text-brasilena-ink" },
];

/**
 * Opening act — the bottle "stappo" plays frame-by-frame as you scroll.
 * 18 high-quality frames (flattened on the hero yellow, so no white contour) are
 * stacked and the visible one is driven by scroll progress through a PINNED GSAP
 * ScrollTrigger (the animated-bottle-scroll technique). The copy column gets a
 * parallax drift over the same scrub. Desktop + motion-safe only; mobile and
 * prefers-reduced-motion get a static, non-pinned hero showing the full splash.
 */
export function HeroPour() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MOTION, () => {
        const frames = gsap.utils.toArray<HTMLElement>(".hp-frame");
        gsap.set(frames, { opacity: 0 });
        gsap.set(frames[0], { opacity: 1 });
        let cur = 0;
        const show = (i: number) => {
          const n = Math.max(0, Math.min(FRAME_COUNT - 1, i));
          if (n === cur) return;
          gsap.set(frames[cur], { opacity: 0 });
          gsap.set(frames[n], { opacity: 1 });
          cur = n;
        };

        // pop-up labels start hidden — each pops in at its own scroll point
        gsap.set(".hp-pop", { opacity: 0, scale: 0.2 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".hp-pin",
            start: "top top",
            end: "+=2600",
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => show(Math.round(self.progress * (FRAME_COUNT - 1))),
          },
        });
        // headline rise + copy/stage parallax across the full scrub
        tl.from(".hp-hl-word", { yPercent: 110, opacity: 0, stagger: 0.06, duration: 0.12, ease: "power2.out" }, 0)
          .fromTo(".hp-copy", { y: 24 }, { y: -48, ease: "none", duration: 1 }, 0)
          .fromTo(".hp-stage", { y: -16 }, { y: 16, ease: "none", duration: 1 }, 0);
        // Stappa / Versa / Brinda pop in (scale + spin) at different scroll points, scattered near the bottle
        POPS.forEach((p, i) => {
          tl.fromTo(
            `.hp-pop-${i}`,
            { opacity: 0, scale: 0.2, rotation: p.rot - 16 },
            { opacity: 1, scale: 1, rotation: p.rot, duration: 0.09, ease: "back.out(2.2)" },
            p.at,
          );
        });

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
      {/* ===== PINNED SCRUB SCENE — desktop + motion-safe ===== */}
      <section className="hp-pin relative hidden min-h-[100svh] w-full overflow-hidden bg-brasilena-yellow text-brasilena-ink motion-safe:md:block">
        <div className="relative z-10 mx-auto grid h-[100svh] w-full max-w-[1320px] grid-cols-[0.82fr_1.18fr] items-center gap-6 px-[clamp(1.25rem,4vw,4rem)] lg:grid-cols-[0.75fr_1.25fr] xl:max-w-[1560px] 2xl:max-w-[1720px]">
          {/* copy */}
          <div className="hp-copy relative text-left will-change-transform">
            <span className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-red">
              <span className="h-px w-8 bg-brasilena-red" />
              {HERO_ANIM.kicker}
            </span>

            <h1 className="mt-5 font-display uppercase leading-[0.82] text-[clamp(2.5rem,5.5vw,5rem)]">
              <span className="block overflow-hidden">
                <span className="hp-hl-word block">{w1}</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hp-hl-word block text-brasilena-red">{w2}</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hp-hl-word block">{w3}</span>
              </span>
            </h1>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <PillButton href="#prodotti" tone="ink" onClick={jumpTo("#prodotti")}>
                {HERO_ANIM.ctaPrimary}
              </PillButton>
              <PillButton href="#la-mia-gente" tone="red" onClick={jumpTo("#la-mia-gente")}>
                {HERO_ANIM.ctaSecondary}
              </PillButton>
            </div>
          </div>

          {/* frame stage — 18 stacked frames, one shown per scroll step */}
          <div className="hp-stage relative aspect-[1600/1288] w-full will-change-transform">
            {FRAMES.map((src, i) => (
              <div key={src} className="hp-frame absolute inset-0 will-change-[opacity]" style={{ opacity: i === 0 ? 1 : 0 }}>
                <Image
                  src={src}
                  alt={i === 0 ? "Bottiglia Brasilena che si stappa" : ""}
                  aria-hidden={i !== 0}
                  fill
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  quality={90}
                  sizes="(max-width: 1280px) 58vw, 800px"
                  className="object-contain"
                />
              </div>
            ))}

            {/* scroll-synced pop-up labels, scattered at different spots near the bottle */}
            <div role="img" aria-label={HERO_ANIM.ticker.join(", ")} className="pointer-events-none absolute inset-0 z-10">
              {POPS.map((p, i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{ left: p.left, top: p.top, opacity: 0 }}
                  className={`hp-pop hp-pop-${i} absolute font-display uppercase leading-none text-[clamp(2.25rem,4.4vw,3.75rem)] ${p.tone} px-6 py-2.5 rounded-full shadow-[0_14px_30px_-8px_rgba(106,63,64,0.55)] ring-2 ring-brasilena-cream/40 will-change-transform`}
                >
                  {HERO_ANIM.ticker[i]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FALLBACK — mobile + reduced-motion (no pin, full splash) ===== */}
      <section className="relative block min-h-[100svh] w-full overflow-hidden bg-brasilena-yellow text-brasilena-ink motion-safe:md:hidden">
        <div className="mx-auto grid min-h-[100svh] w-full max-w-[1320px] grid-cols-1 items-center gap-4 px-[clamp(1.25rem,5vw,4rem)] pt-[clamp(5.5rem,12vh,8rem)] pb-12 text-center">
          <div>
            <span className="inline-flex items-center justify-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-red">
              <span className="h-px w-8 bg-brasilena-red" />
              {HERO_ANIM.kicker}
            </span>

            <h1 className="mt-4 font-display uppercase leading-[0.82] text-[clamp(2.5rem,9vw,4.5rem)]">
              <span className="block">{w1}</span>
              <span className="block text-brasilena-red">{w2}</span>
              <span className="block">{w3}</span>
            </h1>

            <div className="relative mx-auto mt-5 aspect-[1600/1288] w-full max-w-[30rem]">
              <Image
                src={`/images/brasilena/pop-${FRAME_COUNT}.webp`}
                alt="Bottiglia Brasilena che si stappa, con il caffè che esplode"
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 92vw, 480px"
                className="object-contain"
              />
            </div>

            <p className="mt-6 font-display uppercase leading-none text-brasilena-red text-[clamp(1.75rem,8vw,2.75rem)]">
              {HERO_ANIM.ticker.join(" · ")}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
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
