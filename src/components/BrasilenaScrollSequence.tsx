"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HERO_SEQUENCE } from "@/content/brasilena";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 40;
// Eye-dropped from the frame backgrounds so the canvas letterbox is invisible.
const BG = "#090909";

const frameSrc = (i: number) => `/frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

// Scroll choreography (timeline positions on a 0–1 scrub):
// act 0 visible at start, acts 1/2 cross-fade mid-sequence, act 3 lands as the
// bottle reassembles. Frames map linearly to progress (0 → 39).
const ACTS = [
  { in: null, out: 0.12 }, // visible from the start
  { in: 0.24, out: 0.46 },
  { in: 0.54, out: 0.76 },
  { in: 0.88, out: null }, // stays until the end
] as const;

/**
 * Scrollytelling hero — the bottle "explodes" and reassembles across a
 * 40-frame image sequence drawn on a pinned full-viewport <canvas> (drawing to
 * canvas instead of swapping 40 DOM images keeps scrubbing jank-free). GSAP
 * ScrollTrigger pins the stage and maps scroll progress to the frame index;
 * position:sticky can't be used here because ScrollSmoother transform-offsets
 * the page. Frames preload up front behind a spinner and the scrub only arms
 * once every frame is decoded. prefers-reduced-motion gets a static frame
 * with the opening line — no pin, no scrub.
 */
export function BrasilenaScrollSequence() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const [ready, setReady] = useState(false);

  // Preload + decode every frame before arming the scrub.
  useEffect(() => {
    let cancelled = false;
    const imgs = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new window.Image();
      img.src = frameSrc(i);
      return img;
    });
    imagesRef.current = imgs;
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Draw one frame with "contain" logic, letterboxed on the section colour.
  // The image is fitted below a top padding band so the popping cap never
  // slides under the fixed header.
  const draw = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !img?.naturalWidth) return;
    const { width, height } = canvas;
    const dpr = canvas.clientWidth ? width / canvas.clientWidth : 1;
    const padTop = 136 * dpr;
    const padBottom = 16 * dpr;
    const avail = Math.max(1, height - padTop - padBottom);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);
    const scale = Math.min(width / img.naturalWidth, avail / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (width - dw) / 2, padTop + (avail - dh) / 2, dw, dh);
    frameRef.current = index;
  }, []);

  // Size the canvas backing store to its CSS box (devicePixelRatio-aware,
  // capped at 2× to keep mobile fill-rate sane) and redraw on resize.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(frameRef.current);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [ready, draw]);

  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();

      // Pin + scrub wherever motion is allowed (canvas is cheap enough for
      // mobile, unlike the old 18-DOM-image hero). Reduced-motion never enters
      // this block: static frame + opening line via the SSR markup.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".bs-pin",
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const next = Math.round(self.progress * (FRAME_COUNT - 1));
              if (next !== frameRef.current) draw(next);
            },
          },
        });

        // Span the full scrub so position values below read as 0–1 progress.
        tl.to({}, { duration: 1 }, 0);

        ACTS.forEach((act, i) => {
          const line = `.bs-line-${i}`;
          if (act.in === null) {
            gsap.set(line, { opacity: 1, y: 0 });
          } else {
            tl.fromTo(
              line,
              { opacity: 0, y: 36 },
              { opacity: 1, y: 0, duration: 0.08, ease: "power1.out" },
              act.in,
            );
          }
          if (act.out !== null) {
            tl.to(line, { opacity: 0, y: -36, duration: 0.08, ease: "power1.in" }, act.out);
          }
        });

        // Scroll hint dissolves as soon as the story starts moving.
        tl.to(".bs-hint", { opacity: 0, duration: 0.05 }, 0.04);

        // Late-created pin (gated on image decode) shifts everything below it
        // — recompute all trigger positions.
        ScrollTrigger.refresh();
      });

      return () => mm.revert();
    },
    { dependencies: [ready], scope: root },
  );

  return (
    <section ref={root} className="relative text-white" style={{ backgroundColor: BG }}>
      <div className="bs-pin relative h-screen w-full overflow-hidden">
        {/* Static fallback frame — covered by the canvas once frames decode;
            the only thing reduced-motion users see. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc(0)}
          alt="Bottiglia di Brasilena su fondo scuro"
          className="absolute inset-x-0 bottom-4 top-[136px] mx-auto h-[calc(100%-152px)] object-contain"
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-300",
            ready ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Text overlays — one act per scroll phase */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {HERO_SEQUENCE.lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-x-0 px-[clamp(1.5rem,7vw,7rem)]",
                line.align === "center" && "inset-y-0 grid place-items-center text-center",
                line.align === "left" && "top-1/2 -translate-y-1/2 text-left",
                line.align === "right" && "top-1/2 -translate-y-1/2 text-right",
              )}
            >
              <p
                className={cn(
                  `bs-line bs-line-${i}`,
                  "font-sans font-semibold tracking-tight will-change-transform",
                  // Heavy text-shadow keeps lines readable over the bright
                  // splash/label areas of the frames.
                  "[text-shadow:0_2px_10px_rgba(0,0,0,0.95),0_4px_32px_rgba(0,0,0,0.85)]",
                  // Act 0 visible by default so reduced-motion (no GSAP) still
                  // shows the opening line; the scrub overrides inline.
                  i === 0 ? "opacity-100" : "opacity-0",
                  line.align === "center"
                    ? "max-w-[18ch] text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.05]"
                    : cn(
                        "max-w-[22ch] text-[clamp(1.5rem,3.4vw,2.8rem)] leading-[1.15] text-white/90",
                        line.align === "right" && "ml-auto",
                      ),
                )}
              >
                {line.lead && <span className="text-amber-500">{line.lead}</span>}
                {line.lead && " "}
                <span className={line.align === "center" ? "text-white" : undefined}>
                  {line.text}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="bs-hint absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
          <span className="grid size-9 place-items-center rounded-full border border-white/20">
            <span className="block size-1.5 animate-bounce rounded-full bg-amber-500" />
          </span>
          {HERO_SEQUENCE.scroll}
        </div>

        {/* Loader — covers the stage until every frame is decoded */}
        <div
          className={cn(
            "absolute inset-0 z-20 grid place-items-center transition-opacity duration-500",
            ready && "pointer-events-none opacity-0",
          )}
          style={{ backgroundColor: BG }}
          aria-hidden={ready}
        >
          <div className="flex flex-col items-center gap-4">
            <span className="size-10 animate-spin rounded-full border-2 border-white/15 border-t-amber-500" />
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/40">
              {HERO_SEQUENCE.loading}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
