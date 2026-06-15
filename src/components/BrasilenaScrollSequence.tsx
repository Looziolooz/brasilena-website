"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HERO_SEQUENCE } from "@/content/brasilena";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FRAME_COUNT = 40;
// Eye-dropped from the frame backgrounds (the warm ochre studio sweep) so the
// canvas letterbox is invisible against the section behind it.
const BG = "#c09a22";
const BG_TRANSPARENT = "rgba(192,154,34,0)";

const frameSrc = (i: number) => `/frames/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;

// Scroll choreography (timeline positions on a 0–1 scrub):
// act 0 visible at start, acts 1/2 cross-fade mid-sequence, act 3 lands as the
// cap pops and the coffee bursts out. Frames map linearly to progress (0 → 39).
const ACTS = [
  { in: null, out: 0.12 }, // visible from the start
  { in: 0.24, out: 0.46 },
  { in: 0.54, out: 0.76 },
  { in: 0.88, out: null }, // stays until the end
] as const;

/**
 * Scrollytelling hero — the Brasilena bottle tilts, the cap pops and the coffee
 * bursts out across a 40-frame image sequence drawn on a pinned full-viewport
 * <canvas> (drawing to canvas instead of swapping 40 DOM images keeps scrubbing
 * jank-free). The whole stage sits on the frames' own ochre so there is no
 * visible frame border. Desktop pins via GSAP (position:sticky can't be used —
 * ScrollSmoother transform-offsets the page); mobile pins natively with
 * position:sticky inside a 400svh runway (GSAP pinning was unreliable on real
 * touch browsers). Frames preload behind a spinner; the scrub only arms once
 * every frame is decoded. prefers-reduced-motion gets a static frame + the
 * opening line, no pin, no scrub.
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
    const dx = (width - dw) / 2;
    const dy = padTop + (avail - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    // Feather the image edges into the page colour so the 16:9 frame border
    // (the JPEGs' vignette is never exactly the flat BG) doesn't read as a box.
    const fx = dw * 0.07;
    const fy = dh * 0.09;
    const edges: Array<[number, number, number, number, number, number, number, number]> = [
      [dx, dy, fx, dh, dx, 0, dx + fx, 0], // left
      [dx + dw - fx, dy, fx, dh, dx + dw, 0, dx + dw - fx, 0], // right
      [dx, dy, dw, fy, 0, dy, 0, dy + fy], // top
      [dx, dy + dh - fy, dw, fy, 0, dy + dh, 0, dy + dh - fy], // bottom
    ];
    for (const [rx, ry, rw, rh, gx0, gy0, gx1, gy1] of edges) {
      const g = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
      g.addColorStop(0, BG);
      g.addColorStop(1, BG_TRANSPARENT);
      ctx.fillStyle = g;
      ctx.fillRect(rx, ry, rw, rh);
    }
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

      // Text choreography + scroll hint, shared by both breakpoints. Position
      // values read as 0–1 scrub progress thanks to the duration-1 filler.
      const addActs = (tl: gsap.core.Timeline) => {
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
        tl.to(".bs-hint", { opacity: 0, duration: 0.05 }, 0.04);
      };

      const onUpdate = (self: ScrollTrigger) => {
        const next = Math.round(self.progress * (FRAME_COUNT - 1));
        if (next !== frameRef.current) draw(next);
      };

      // Desktop ≥768px: GSAP pin — position:sticky can't work here because
      // ScrollSmoother transform-offsets the page.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
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
            onUpdate,
          },
        });
        addActs(tl);
        // Late-created pin (gated on image decode) shifts everything below it
        // — recompute all trigger positions.
        ScrollTrigger.refresh();
      });

      // Mobile <768px: no ScrollSmoother, so the stage pins itself with
      // native position:sticky inside the 400svh wrapper. GSAP only scrubs
      // frames + text against the wrapper's scroll span.
      mm.add("(max-width: 767.98px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".bs-wrap",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate,
          },
        });
        addActs(tl);
        ScrollTrigger.refresh();
      });

      return () => mm.revert();
    },
    { dependencies: [ready], scope: root },
  );

  return (
    <section ref={root} className="relative text-brasilena-ink" style={{ backgroundColor: BG }}>
      {/* Mobile gets a 400svh scroll runway and a sticky stage (native pin);
          on desktop the wrapper collapses to the stage height and GSAP pins. */}
      <div className="bs-wrap relative motion-safe:max-md:h-[400svh]">
        <div className="bs-pin relative h-svh w-full overflow-hidden motion-safe:max-md:sticky motion-safe:max-md:top-0">
          {/* Static fallback frame — covered by the canvas once frames decode;
              the only thing reduced-motion users see. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameSrc(0)}
            alt="Bottiglia di Brasilena su fondo giallo ocra"
            className="absolute inset-x-0 bottom-4 top-[136px] mx-auto h-[calc(100%-152px)] object-contain [mask-image:radial-gradient(115%_115%_at_50%_50%,black_62%,transparent_96%)]"
          />
          <canvas
            ref={canvasRef}
            aria-hidden
            className={cn(
              "absolute inset-0 size-full transition-opacity duration-300",
              ready ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Bottom fade into the brand yellow of the section that follows, so
              the ochre hero hands off without a hard demarcation line. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[24svh] bg-gradient-to-b from-transparent to-brasilena-yellow" />

          {/* Text overlays — one act per scroll phase */}
          <div className="pointer-events-none absolute inset-0 z-10">
            {HERO_SEQUENCE.lines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "absolute inset-x-0 px-[clamp(1.5rem,7vw,7rem)]",
                  line.align === "center" && "inset-y-0 grid place-items-center text-center",
                  line.align === "left" && "top-[34%] -translate-y-1/2 text-left",
                  line.align === "right" && "top-[34%] -translate-y-1/2 text-right",
                )}
              >
                <p
                  className={cn(
                    `bs-line bs-line-${i}`,
                    "font-sans font-semibold tracking-tight will-change-transform",
                    // Warm light glow keeps the dark ink lettering readable on
                    // the ochre and separates it from any dark coffee splash.
                    "[text-shadow:0_1px_2px_rgba(255,243,206,0.95),0_2px_22px_rgba(255,243,206,0.6)]",
                    // Act 0 visible by default so reduced-motion (no GSAP) still
                    // shows the opening line; the scrub overrides inline.
                    i === 0 ? "opacity-100" : "opacity-0",
                    line.align === "center"
                      ? "max-w-[18ch] text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.05]"
                      : cn(
                          "max-w-[20ch] text-[clamp(1.5rem,3.4vw,2.8rem)] leading-[1.15]",
                          line.align === "right" && "ml-auto",
                        ),
                  )}
                >
                  {line.lead && <span className="text-brasilena-red">{line.lead}</span>}
                  {line.lead && " "}
                  <span>{line.text}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="bs-hint absolute inset-x-0 bottom-8 z-10 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-ink/70">
            <span className="grid size-9 place-items-center rounded-full border border-brasilena-ink/30">
              <span className="block size-1.5 animate-bounce rounded-full bg-brasilena-red" />
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
              <span className="size-10 animate-spin rounded-full border-2 border-brasilena-ink/20 border-t-brasilena-red" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-brasilena-ink/60">
                {HERO_SEQUENCE.loading}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
