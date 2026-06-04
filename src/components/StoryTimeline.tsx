"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { STORIA } from "@/content/brasilena";
import type { TimelineEntry } from "@/types/content";
import { PillButton } from "@/components/PillButton";
import { WaveDivider } from "@/components/WaveDivider";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

// Keep byte-identical to SmoothScroll.tsx / HeroStory.tsx so motion enables on
// exactly the same breakpoint as ScrollSmoother.
const DESKTOP_MOTION = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/**
 * "La mia storia" — a scroll-driven cronostoria. The brand narrates its own
 * history along a vertical timeline whose central spine fills as you scroll
 * (ScrollTrigger scrub), with parallax on the media and the period numbers and
 * a per-entry dot that lights up on entry. Mobile / reduced-motion get the
 * static final state (full spine, lit dots, no parallax) via the SSR markup —
 * GSAP only enhances on desktop, mirroring HeroStory's progressive-enhancement.
 */
export function StoryTimeline() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MOTION, () => {
        // Spine fills top → bottom across the timeline.
        gsap.set(".st-progress", { scaleY: 0, transformOrigin: "top center" });
        gsap.to(".st-progress", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".st-timeline",
            start: "top 60%",
            end: "bottom 60%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // Parallax drift on every flagged element (media + giant numbers).
        gsap.utils.toArray<HTMLElement>(".st-parallax").forEach((el) => {
          const depth = Number(el.dataset.depth ?? "0.1");
          gsap.fromTo(
            el,
            { yPercent: depth * 100 },
            {
              yPercent: depth * -100,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        // Each dot snaps from muted to brand red as its entry arrives.
        gsap.utils.toArray<HTMLElement>(".st-dot").forEach((dot) => {
          gsap.fromTo(
            dot,
            { scale: 0.35, backgroundColor: "rgba(106,63,64,0.25)" },
            {
              scale: 1,
              backgroundColor: "#fe3e29",
              duration: 0.45,
              ease: "back.out(2)",
              scrollTrigger: { trigger: dot, start: "top 72%", toggleActions: "play none none reverse" },
            },
          );
        });

        return () => {}; // tweens + triggers are reverted by mm.revert()
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const { kicker, title, lede, scroll, timeline, closing } = STORIA;

  return (
    <div ref={root}>
      {/* ===== Intro ===== */}
      <section className="relative flex min-h-[78svh] items-center overflow-hidden bg-brasilena-yellow text-brasilena-ink">
        {/* Giant parallax watermark year */}
        <span
          aria-hidden
          className="st-parallax pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none font-display uppercase leading-none text-brasilena-ink/[0.06] text-[clamp(12rem,40vw,34rem)]"
          data-depth="0.18"
        >
          1930
        </span>

        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-[clamp(1.25rem,6vw,6.25rem)] pt-[clamp(7rem,16vh,11rem)] pb-[clamp(3rem,7vw,6rem)]">
          <span className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-red">
            <span className="h-px w-8 bg-brasilena-red" />
            {kicker}
          </span>

          <h1 className="mt-6 max-w-[16ch] font-display uppercase leading-[0.82] text-[clamp(3rem,9vw,7.5rem)]">
            {title}
          </h1>

          <p className="mt-7 max-w-[48ch] font-sans text-[clamp(1.05rem,1.5vw,1.3rem)] leading-relaxed text-brasilena-ink/80">
            {lede}
          </p>

          <span className="mt-10 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-ink/60">
            <span className="grid size-9 place-items-center rounded-full border border-brasilena-ink/30">
              <span className="block size-1.5 animate-bounce rounded-full bg-brasilena-red" />
            </span>
            {scroll}
          </span>
        </div>
      </section>

      {/* yellow → cream wave */}
      <div className="relative z-2 -mb-px bg-brasilena-cream">
        <WaveDivider color="#ffcc00" />
      </div>

      {/* ===== Cronostoria ===== */}
      <section className="relative bg-brasilena-cream text-brasilena-ink">
        <div className="mx-auto w-full max-w-[1320px] px-[clamp(1.25rem,6vw,6.25rem)] py-[clamp(3rem,8vw,7rem)]">
          <div className="st-timeline relative">
            {/* Central spine + animated progress */}
            <div
              aria-hidden
              className="absolute bottom-0 top-0 left-[28px] w-px -translate-x-1/2 bg-brasilena-ink/15 md:left-1/2"
            >
              <div className="st-progress absolute inset-0 origin-top bg-brasilena-red" />
            </div>

            <div className="space-y-[clamp(4rem,10vw,8.5rem)]">
              {timeline.map((entry, i) => (
                <TimelineRow key={entry.year} entry={entry} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* cream → yellow wave */}
      <div className="relative z-2 -mb-px bg-brasilena-yellow">
        <WaveDivider color="#f4f2ea" />
      </div>

      {/* ===== Closing ===== */}
      <section className="relative overflow-hidden bg-brasilena-yellow text-brasilena-ink">
        <div className="mx-auto w-full max-w-[1100px] px-[clamp(1.25rem,6vw,6.25rem)] py-[clamp(4rem,11vw,9rem)] text-center">
          <p className="reveal font-display uppercase leading-[0.9] text-[clamp(2.5rem,7vw,6rem)] text-brasilena-red">
            {closing.quote}
          </p>
          <p className="reveal mx-auto mt-8 max-w-[58ch] font-sans text-[clamp(1.05rem,1.5vw,1.3rem)] leading-relaxed text-brasilena-ink/80">
            {closing.text}
          </p>
          <div className="reveal mt-10 flex justify-center">
            <PillButton href={closing.ctaHref} tone="ink">
              {closing.cta}
            </PillButton>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---- One timeline entry (alternating sides on desktop) ---- */
function TimelineRow({ entry, index }: { entry: TimelineEntry; index: number }) {
  const mediaLeft = index % 2 === 0;

  return (
    <div className="st-row relative pl-[64px] md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-x-[clamp(2rem,5vw,5rem)] md:pl-0">
      {/* Dot on the spine */}
      <span
        aria-hidden
        className="st-dot absolute left-[28px] top-1.5 size-4 -translate-x-1/2 rounded-full bg-brasilena-red ring-4 ring-brasilena-cream md:static md:col-start-2 md:translate-x-0 md:justify-self-center"
      />

      {/* Media */}
      <div className={cn("st-media", mediaLeft ? "md:col-start-1" : "md:col-start-3")}>
        <TimelineMedia entry={entry} index={index} />
      </div>

      {/* Copy */}
      <div
        className={cn(
          "mt-5 md:mt-0",
          mediaLeft ? "md:col-start-3 md:text-left" : "md:col-start-1 md:text-right",
        )}
      >
        <span
          className="st-parallax block font-display uppercase leading-none text-brasilena-red/85 text-[clamp(2.25rem,4.5vw,3.5rem)]"
          data-depth="0.06"
        >
          {entry.year}
        </span>
        <h2 className="reveal mt-2 font-display uppercase leading-[0.9] text-brasilena-ink text-[clamp(1.6rem,3vw,2.6rem)]">
          {entry.title}
        </h2>
        <p
          className={cn(
            "reveal mt-4 max-w-[46ch] font-sans text-[clamp(0.98rem,1.15vw,1.1rem)] leading-relaxed text-brasilena-ink/80",
            mediaLeft ? "md:ml-0" : "md:ml-auto",
          )}
        >
          {entry.text}
        </p>
      </div>
    </div>
  );
}

/* ---- Media frame: photo, cutout, or on-brand placeholder ---- */
function TimelineMedia({ entry, index }: { entry: TimelineEntry; index: number }) {
  const frame =
    "relative aspect-[4/3] w-full overflow-hidden rounded-[clamp(1.25rem,2.5vw,2rem)] shadow-[0_24px_60px_rgba(106,63,64,0.18)]";

  // Placeholder — alternating brand panels until a real period photo is added.
  if (!entry.image) {
    const tones = [
      "from-brasilena-red to-[#c8301f] text-brasilena-yellow",
      "from-brasilena-ink to-[#4f2e2f] text-brasilena-cream",
    ];
    const tone = tones[index % tones.length];
    return (
      <div className={cn(frame, "bg-gradient-to-br", tone)}>
        <span
          aria-hidden
          className="st-parallax pointer-events-none absolute inset-0 grid place-items-center font-display uppercase leading-none opacity-20 text-[clamp(4rem,12vw,9rem)]"
          data-depth="0.12"
        >
          {entry.year}
        </span>
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <span className="max-w-[24ch] font-sans text-[clamp(0.85rem,1vw,1rem)] leading-snug opacity-90">
            {entry.imageAlt}
          </span>
        </div>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-current/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] opacity-80">
          Foto in arrivo
        </span>
      </div>
    );
  }

  // Cutout PNG — contained over a soft panel, gently parallaxed.
  if (entry.fit === "contain") {
    return (
      <div className={cn(frame, "bg-gradient-to-br from-brasilena-cream to-[#e9e1d4]")}>
        <div className="st-parallax absolute inset-0 p-[clamp(1.5rem,4vw,3rem)]" data-depth="0.05">
          <div className="relative size-full">
            <Image
              src={entry.image}
              alt={entry.imageAlt}
              fill
              sizes="(max-width: 768px) 90vw, 40vw"
              className="object-contain drop-shadow-[0_18px_30px_rgba(106,63,64,0.22)]"
            />
          </div>
        </div>
      </div>
    );
  }

  // Real photo — covers the frame, parallaxed within an over-sized wrapper.
  return (
    <div className={frame}>
      <div className="st-parallax absolute inset-x-0 -top-[12%] h-[124%]" data-depth="0.1">
        <Image
          src={entry.image}
          alt={entry.imageAlt}
          fill
          sizes="(max-width: 768px) 90vw, 40vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
