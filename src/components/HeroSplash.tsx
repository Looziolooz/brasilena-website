"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Hero centerpiece: a single high-quality still of the Brasilena bottle mid-pour,
 * brought to life with lightweight ambient motion (no scroll-scrub, no video):
 *   - entrance rise + fade on mount
 *   - gentle infinite float (bob + slight tilt)
 *   - subtle mouse parallax (separate transform layer, so it never fights the float)
 * Honours `prefers-reduced-motion` (renders the still, no motion). The image stays
 * fully static otherwise — only these CSS/GSAP transforms move it.
 */
export function HeroSplash({ src = "/images/brasilena/hero-splash.png" }: { src?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const parallax = useRef<HTMLDivElement>(null);
  const floatLayer = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      // entrance
      gsap.from(floatLayer.current, { autoAlpha: 0, y: 40, scale: 0.94, duration: 1.1, ease: "power3.out" });
      // ambient float (bob + slight tilt), starts once the entrance has settled
      gsap.to(floatLayer.current, {
        y: "+=14",
        rotation: 1.3,
        duration: 3.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.7,
      });

      // subtle mouse parallax on a separate layer (px translate, no conflict w/ float)
      const xTo = gsap.quickTo(parallax.current, "x", { duration: 0.7, ease: "power3" });
      const yTo = gsap.quickTo(parallax.current, "y", { duration: 0.7, ease: "power3" });
      const onMove = (e: MouseEvent) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        xTo(nx * 16);
        yTo(ny * 12);
      };
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className="relative size-full">
      <div ref={parallax} className="relative size-full will-change-transform">
        <div ref={floatLayer} className="relative size-full will-change-transform">
          <Image
            src={src}
            alt="Bottiglia Brasilena che si stappa"
            fill
            priority
            quality={90}
            sizes="(max-width: 768px) 90vw, (max-width: 1280px) 52vw, 720px"
            className="object-contain drop-shadow-[0_30px_45px_rgba(106,63,64,0.28)]"
          />
        </div>
      </div>
    </div>
  );
}
