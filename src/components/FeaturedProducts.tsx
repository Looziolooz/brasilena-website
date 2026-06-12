"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PRODUCTS, PRODUCTS_INTRO, PRODUCTS_RAIL_CTA } from "@/content/brasilena";
import { ProductCard } from "@/components/ProductCard";
import { PillButton } from "@/components/PillButton";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Keep byte-identical to SmoothScroll.tsx / HeroPour.tsx so the pin enables on
// exactly the same breakpoint as ScrollSmoother.
const DESKTOP_MOTION = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

// Background tints swept through while the rail scrubs — cream → warm yellow →
// soft red → back to cream, so the section hands off seamlessly to the marquee.
const TINTS = ["#f4f2ea", "#ffe3a0", "#ffd6cc", "#f4f2ea"];

/**
 * "Le mie bibite" — on desktop the section PINS (ScrollTrigger pin: true) and
 * the vertical scroll becomes a horizontal scrub of the format cards, with the
 * background colour synced to the scrub progress and a 3D perspective/rotateY
 * entrance per card. Mobile and prefers-reduced-motion keep the static grid
 * (SSR markup, `.reveal` fade-ups only) — same progressive-enhancement split
 * as HeroPour.
 */
export function FeaturedProducts() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MOTION, () => {
        const pinEl = root.current?.querySelector<HTMLElement>(".pp-pin");
        const stage = root.current?.querySelector<HTMLElement>(".pp-stage");
        const track = root.current?.querySelector<HTMLElement>(".pp-track");
        if (!pinEl || !stage || !track) return;

        const dist = () => Math.max(0, track.scrollWidth - stage.clientWidth);
        const tint = gsap.utils.interpolate(TINTS);

        // Vertical scroll → horizontal rail: the section pins while the track
        // translates sideways, and the background sweeps through the tints.
        const rail = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: pinEl,
            start: "top top",
            end: () => `+=${Math.round(dist() * 1.4) + 200}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(pinEl, { backgroundColor: tint(self.progress) }),
          },
        });

        // 3D entrance: each card swings in (rotateY under the stage's
        // perspective) as it crosses the right edge of the rail.
        gsap.utils.toArray<HTMLElement>(".pp-card").forEach((card) => {
          gsap.fromTo(
            card,
            { rotateY: 28, scale: 0.9, opacity: 0.3 },
            {
              rotateY: 0,
              scale: 1,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                containerAnimation: rail,
                start: "left 95%",
                end: "left 55%",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        return () => {}; // tweens + triggers reverted by mm.revert()
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} id="prodotti" className="scroll-mt-24">
      {/* ===== PINNED HORIZONTAL RAIL — desktop + motion-safe ===== */}
      <section className="pp-pin relative hidden min-h-[100svh] flex-col justify-center overflow-hidden bg-brasilena-cream py-[clamp(2rem,4vh,3rem)] motion-safe:md:flex">
        <header className="reveal reveal-down mx-auto max-w-xl px-6 text-center">
          <h2 className="font-display text-brasilena-red uppercase leading-[0.85] text-[clamp(3rem,7vw,6rem)]">
            {PRODUCTS_INTRO.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-snug text-brasilena-ink/80">
            {PRODUCTS_INTRO.text}
          </p>
        </header>

        {/* Stage masks the over-wide track; perspective gives the cards depth */}
        <div className="pp-stage mt-[clamp(2rem,5vh,3.5rem)] w-full overflow-hidden [perspective:1200px]">
          <div className="pp-track flex w-max items-stretch gap-[clamp(1.5rem,2.5vw,2.5rem)] px-[clamp(2rem,8vw,8rem)] will-change-transform [transform-style:preserve-3d]">
            {PRODUCTS.map((product, i) => (
              <div
                key={product.slug}
                className="pp-card aspect-[389/519] h-[min(54svh,32rem)] w-auto shrink-0 will-change-transform"
              >
                <ProductCard product={product} index={i} reveal={false} />
              </div>
            ))}

            {/* Closing CTA panel at the end of the rail */}
            <div className="pp-card flex aspect-[389/519] h-[min(54svh,32rem)] w-auto shrink-0 flex-col items-center justify-center rounded-[clamp(2.5rem,4vw,5rem)] bg-brasilena-red p-8 text-center text-brasilena-cream will-change-transform">
              <h3 className="font-display uppercase leading-[0.85] text-[clamp(2.5rem,3.5vw,3.5rem)]">
                {PRODUCTS_RAIL_CTA.title}
              </h3>
              <p className="mt-4 max-w-[24ch] text-base leading-snug opacity-90">
                {PRODUCTS_RAIL_CTA.text}
              </p>
              <PillButton href={PRODUCTS_RAIL_CTA.href} tone="cream" className="mt-8">
                {PRODUCTS_RAIL_CTA.cta}
              </PillButton>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FALLBACK — mobile + reduced-motion (static grid) ===== */}
      <section className="relative bg-brasilena-cream motion-safe:md:hidden">
        <div className="mx-auto w-full max-w-[1440px] px-[clamp(1.25rem,6vw,6.25rem)] pt-[clamp(4rem,9vw,8rem)] pb-[clamp(3rem,6vw,6rem)]">
          <header className="reveal mx-auto max-w-xl text-center">
            <h2 className="font-display text-brasilena-red uppercase leading-[0.85] text-[clamp(3.5rem,9vw,6.6rem)]">
              {PRODUCTS_INTRO.title}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-snug text-brasilena-ink/80">
              {PRODUCTS_INTRO.text}
            </p>
          </header>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product, i) => (
              <ProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
