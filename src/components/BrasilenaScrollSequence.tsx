"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { HERO_SEQUENCE } from "@/content/brasilena";
import { PillButton } from "@/components/PillButton";
import { BubbleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const { kicker, headline, lede, ctas, acts, chips, ticker, scroll, alt } = HERO_SEQUENCE;

// 49 frames, motion-interpolated from the 18 shot frames with ffmpeg
// minterpolate (see scripts/build-hero-frames.sh). 18 frames spread over the
// pin worked out to ~170px of scroll each, which read as stepping rather than
// pouring; at 49 it is ~58px and the liquid moves continuously.
const FRAME_COUNT = 49;

// Two renditions of the same sequence. The 960px set is *lighter than the old
// 18-frame one* (760KB vs 896KB) and covers every phone, tablet and non-retina
// desktop; only genuinely high-density stages pay for the 1600px set.
const FRAME_SETS = { lo: 960, hi: 1600 } as const;
const frameSrcIn = (dir: number, i: number) =>
  `/frames-pop/${dir}/f-${String(i + 1).padStart(3, "0")}.webp`;

// The paint-holder under the canvas. Always the light set: it is on screen only
// until the first frame decodes, and picking it at render time instead would
// mean either a hydration mismatch or a cascading re-render.
const FALLBACK_SRC = frameSrcIn(FRAME_SETS.lo, 0);

/** Widest the artwork is ever painted, in device pixels, at this viewport. */
function stageDevicePx() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Mirrors the stage's own CSS box: the column capped at 32rem below `lg`,
  // ~55% of the viewport once the two-column layout kicks in.
  const css = window.innerWidth >= 1024 ? window.innerWidth * 0.55 : Math.min(window.innerWidth * 0.92, 512);
  return css * dpr;
}

// The frames are already flattened on the brand yellow, so the canvas
// letterbox is invisible against the section behind it.
const BG = "#ffcc00";
const STAGE_RATIO = "1600 / 1288";
// Where the bottle neck sits inside the frame — the pop FX are anchored here.
const NECK = { left: "40%", top: "66%" };

/** Scrub progress where the cap leaves the bottle (frame 4 of 18). */
const POP_AT = 0.19;
/** Scrub progress where the opening headline hands over to the acts. */
const HEADLINE_OUT = 0.1;

// How far the hero pins, in viewport heights. Three things must agree on it:
// this constant (GSAP pin), the runway class on `.bs-wrap` (100svh + this),
// and Header.tsx's hero-transparency threshold.
const PIN_VH = 3.4;

// PINNED / TOUCH split the *pinning mechanism*, not the layout. 768px must stay
// byte-identical to SmoothScroll.tsx: above it ScrollSmoother transform-offsets
// the page, so position:sticky cannot pin and GSAP has to. The two-column
// layout switches separately, at `lg` — see the grid below.
const PINNED = "(min-width: 768px)";
const TOUCH = "(max-width: 767.98px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

const CHIP_TONES = {
  red: "bg-brasilena-red text-brasilena-cream",
  ink: "bg-brasilena-ink text-brasilena-yellow",
  sand: "bg-[#e8c6a0] text-brasilena-ink",
} as const;

// Deterministic pseudo-random so the burst droplets render identically on the
// server and the client (same trick as Bubbles).
function rand(seed: number) {
  const x = Math.sin(seed * 99.13) * 10000;
  return x - Math.floor(x);
}

/** Droplets thrown clear of the neck on the pop beat — up and to the right. */
const BURST = Array.from({ length: 10 }, (_, i) => {
  const angle = -Math.PI * (0.05 + rand(i + 1) * 0.6);
  const reach = 70 + rand(i + 2) * 170;
  return {
    x: Math.cos(angle) * reach,
    y: Math.sin(angle) * reach,
    size: Math.round(4 + rand(i + 3) * 8),
    delay: rand(i + 4) * 0.05,
  };
});

// How far a masked word travels to clear its line box. Teko's glyphs overflow
// the 0.82 line box, and .hero-split-line pads the mask further, so a plain
// 100% is not enough to hide them.
const MASK_TRAVEL = 165;

/** The four copy beats: the opening headline, then one per act. */
const BEAT_STARTS = [0, ...acts.map((a) => a.at)];

/**
 * The hero: a pinned, scroll-scrubbed "stappo" on the brand yellow. Forty-nine
 * frames of the bottle popping are drawn on a <canvas> (one bitmap blit per
 * tick beats stacking that many DOM layers), the copy column swaps beat by
 * beat with SplitText masked-line type, and pill labels pop in around the
 * splash.
 *
 * The motion layers, roughly outside-in:
 *  - a scrubbed master timeline drives the frames, the copy acts, the chips,
 *    the progress rail and the pop flash / shockwave / droplets;
 *  - scroll *velocity* shears the copy column and whips the bottom ticker
 *    along (reversing it on the way up), so fast flicks feel physical;
 *  - the pointer parallaxes the artwork and the chips against each other, and
 *    the CTAs are magnetic.
 *
 * Frames stream in the background: the scrub arms immediately and `draw` falls
 * back to the nearest decoded frame, so nothing blocks paint. Desktop pins via
 * GSAP (position:sticky can't be used — ScrollSmoother transform-offsets the
 * page); mobile pins natively with position:sticky inside the runway.
 * prefers-reduced-motion gets the finished splash, all the copy, no motion.
 */
export function BrasilenaScrollSequence() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const [decoded, setDecoded] = useState(0);
  // Webfonts have to settle before SplitText measures line boxes, or the masks
  // get cut to the fallback face. A slow font must never hold the hero, so the
  // arming races a timeout.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const dir = stageDevicePx() > 1000 ? FRAME_SETS.hi : FRAME_SETS.lo;
    let cancelled = false;
    let done = 0;
    imagesRef.current = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new window.Image();
      img.src = frameSrcIn(dir, i);
      img
        .decode()
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return;
          done += 1;
          setDecoded(done);
        });
      return img;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const arm = () => {
      if (!cancelled) setArmed(true);
    };
    const timer = window.setTimeout(arm, 1200);
    if (document.fonts) document.fonts.ready.then(arm);
    else arm();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  /** Nearest already-decoded frame at or before `i`, else the first one that is. */
  const nearestDecoded = (i: number) => {
    const imgs = imagesRef.current;
    for (let n = i; n >= 0; n--) if (imgs[n]?.naturalWidth) return n;
    for (let n = i + 1; n < imgs.length; n++) if (imgs[n]?.naturalWidth) return n;
    return -1;
  };

  // Draw one frame "contain"-fitted and letterboxed on the brand yellow. The
  // stage box carries the frames' own aspect ratio, so the fit is exact in
  // practice — the letterbox only matters mid-resize.
  const draw = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const img = imagesRef.current[nearestDecoded(index)];
    if (!img?.naturalWidth) return;
    const { width, height } = canvas;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);
    const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    // Record the *requested* frame, not the one that stood in for it, so the
    // scrub's skip check stays honest.
    frameRef.current = index;
  }, []);

  // Repaint as frames land, in case the current one is standing in for a
  // neighbour that has since decoded.
  useEffect(() => {
    if (decoded) draw(frameRef.current);
  }, [decoded, draw]);

  // Size the canvas backing store to its CSS box (devicePixelRatio-aware,
  // capped at 2× to keep mobile fill-rate sane) and redraw on resize.
  useEffect(() => {
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
  }, [draw]);

  useGSAP(
    () => {
      if (!armed) return;
      const mm = gsap.matchMedia();

      mm.add({ isPinned: PINNED, isTouch: TOUCH, reduced: REDUCED }, (ctx) => {
        const { isPinned, reduced } = (ctx.conditions ?? {}) as Record<string, boolean>;
        const q = gsap.utils.selector(root);
        // Everything below runs identically at every width — only the pinning
        // mechanism and the pointer layer differ.
        const finePointer = window.matchMedia("(pointer: fine)").matches;

        // No choreography at all: land on the finished splash with every line
        // of copy already in place.
        if (reduced) {
          gsap.set(q(".hero-veil"), { opacity: 1 });
          draw(FRAME_COUNT - 1);
          return;
        }

        const teardown: Array<() => void> = [];

        // ---- 1. kinetic type -------------------------------------------------
        // Masked lines: every line gets an overflow-hidden wrapper, so words
        // can slide in and out from behind their own edge.
        const splitVars = {
          type: "lines,words",
          mask: "lines",
          linesClass: "hero-split-line",
        } as const;
        const heroSplit = SplitText.create(q(".bs-headline"), splitVars);
        const actSplits = q(".bs-act-title").map((el) => SplitText.create(el, splitVars));

        // Hand the veil over from CSS to GSAP, then park every animated part on
        // its start state. Everything below is a plain .to(), so there is no
        // immediateRender ordering to reason about.
        gsap.set(q(".hero-veil"), { opacity: 1 });
        gsap.set(q(".bs-rule"), { scaleX: 0, transformOrigin: "left center" });
        gsap.set([q(".bs-kicker-text"), q(".bs-lede"), q(".bs-cta-row")], { opacity: 0, y: 26 });
        gsap.set(heroSplit.words, { yPercent: MASK_TRAVEL, rotate: 5 });
        gsap.set(q(".bs-act"), { opacity: 0 });
        actSplits.forEach((s) => gsap.set(s.words, { yPercent: MASK_TRAVEL }));
        gsap.set([q(".bs-act-text"), q(".bs-act-cta")], { opacity: 0, y: 18 });
        gsap.set(q(".bs-chip"), { opacity: 0, scale: 0.25 });
        gsap.set([q(".bs-hud"), q(".bs-hint")], { opacity: 0 });
        gsap.set(q(".bs-ticker"), { opacity: 0, yPercent: 70 });
        gsap.set(q(".bs-flash"), { opacity: 0 });
        gsap.set(q(".bs-ring"), { opacity: 0, scale: 0.1 });
        gsap.set(q(".bs-drop"), { opacity: 0, x: 0, y: 0, scale: 0.2 });

        // ---- 2. the load-in --------------------------------------------------
        gsap
          .timeline({ defaults: { ease: "expo.out" }, delay: 0.12 })
          .to(q(".bs-rule"), { scaleX: 1, duration: 0.9 }, 0)
          .to(q(".bs-kicker-text"), { opacity: 1, y: 0, duration: 0.8 }, 0.05)
          .to(heroSplit.words, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.05 }, 0.1)
          .fromTo(
            q(".bs-stage"),
            { scale: 1.08, yPercent: 3 },
            { scale: 1, yPercent: 0, duration: 1.6, ease: "power3.out" },
            0,
          )
          .to(q(".bs-lede"), { opacity: 1, y: 0, duration: 1 }, 0.5)
          .to(q(".bs-cta-row"), { opacity: 1, y: 0, duration: 1 }, 0.62)
          .to(q(".bs-ticker"), { opacity: 1, yPercent: 0, duration: 1.1 }, 0.7)
          .to([q(".bs-hud"), q(".bs-hint")], { opacity: 1, duration: 0.8 }, 0.85);

        // Chips breathe on their own, independently of the scrub that reveals
        // them — the float lives on an inner span so the two never fight over
        // the same transform.
        q(".bs-chip-inner").forEach((el, i) => {
          gsap.to(el, {
            y: i % 2 ? -13 : 13,
            duration: 2.4 + i * 0.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

        // ---- 3. scroll-velocity reactions ------------------------------------
        // Fast flicks shear the copy column and whip the ticker along; both
        // ease back to rest, so slow scrolling stays completely still.
        const skew = { value: 0 };
        const applySkew = gsap.quickSetter(q(".bs-copy"), "skewY", "deg");
        const clampSkew = gsap.utils.clamp(-7, 7);

        const tickerLoop = gsap.to(q(".bs-ticker-track"), {
          xPercent: -50,
          duration: 28,
          ease: "none",
          repeat: -1,
        });
        let tickerTarget = 1;
        const driveTicker = (velocity: number) => {
          const dir = velocity < 0 ? -1 : 1;
          const target = dir * (1 + gsap.utils.clamp(0, 3, Math.abs(velocity) / 1100));
          if (Math.abs(target - tickerTarget) < 0.25) return;
          tickerTarget = target;
          gsap.to(tickerLoop, { timeScale: target, duration: 0.3, ease: "power2.out", overwrite: true });
        };
        const restTicker = () => {
          tickerTarget = 1;
          gsap.to(tickerLoop, { timeScale: 1, duration: 1.4, ease: "power2.out", overwrite: true });
        };
        ScrollTrigger.addEventListener("scrollEnd", restTicker);
        teardown.push(() => ScrollTrigger.removeEventListener("scrollEnd", restTicker));

        // ---- 4. the scrubbed master timeline ---------------------------------
        const counter = q(".bs-counter-now")[0];
        let shownBeat = -1;

        // The liquid has mass, so it does not land on the new scroll position
        // instantly — it chases it. Driving the frame index through a damped
        // follower (rather than reading progress straight off the scrub) also
        // means the canvas repaints on GSAP's ticker for the whole catch-up,
        // so a flick keeps rendering after the finger has left the screen.
        const liquid = { frame: 0 };
        const chaseLiquid = gsap.quickTo(liquid, "frame", {
          duration: isPinned ? 0.2 : 0.3,
          ease: "power2.out",
          onUpdate: () => {
            const n = Math.round(liquid.frame);
            if (n !== frameRef.current) draw(n);
          },
        });

        const onUpdate = (self: ScrollTrigger) => {
          chaseLiquid(self.progress * (FRAME_COUNT - 1));

          const velocity = self.getVelocity();
          const nextSkew = clampSkew(velocity / -520);
          if (Math.abs(nextSkew) > Math.abs(skew.value)) {
            skew.value = nextSkew;
            gsap.to(skew, {
              value: 0,
              duration: 0.75,
              ease: "power3",
              overwrite: true,
              onUpdate: () => applySkew(skew.value),
            });
          }
          driveTicker(velocity);

          let beat = 0;
          for (let i = BEAT_STARTS.length - 1; i >= 0; i--) {
            if (self.progress >= BEAT_STARTS[i]) {
              beat = i;
              break;
            }
          }
          if (beat !== shownBeat && counter) {
            shownBeat = beat;
            counter.textContent = String(beat + 1).padStart(2, "0");
          }
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: isPinned
            ? {
                trigger: q(".bs-pin")[0],
                start: "top top",
                end: `+=${PIN_VH * 100}%`,
                pin: true,
                scrub: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate,
              }
            : {
                // Touch has no ScrollSmoother, so the stage pins itself with
                // position:sticky and GSAP only scrubs against the runway. The
                // scrub number smooths what ScrollSmoother would have.
                trigger: q(".bs-wrap")[0],
                start: "top top",
                end: "bottom bottom",
                scrub: 0.4,
                invalidateOnRefresh: true,
                onUpdate,
              },
        });

        // Duration-1 filler so every position below reads as 0–1 progress.
        tl.to({}, { duration: 1 }, 0);
        tl.fromTo(q(".bs-rail-fill"), { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
        tl.to(q(".bs-hint"), { opacity: 0, duration: 0.03 }, 0.02);

        // The opening headline clears out of the way for the acts. Its CTAs are
        // only faded, so they stay clickable unless pointer events go too.
        tl.to(
          heroSplit.words,
          { yPercent: -MASK_TRAVEL, rotate: -5, duration: 0.09, stagger: 0.012, ease: "power2.in" },
          HEADLINE_OUT,
        )
          .to(
            [q(".bs-kicker-text"), q(".bs-lede"), q(".bs-cta-row")],
            { opacity: 0, y: -22, duration: 0.07, ease: "power2.in" },
            HEADLINE_OUT,
          )
          .set(q(".bs-intro"), { pointerEvents: "none" }, HEADLINE_OUT + 0.07);

        acts.forEach((act, i) => {
          const words = actSplits[i].words;
          const trailing = q(`.bs-act-${i} .bs-act-text, .bs-act-${i} .bs-act-cta`);
          tl.set(q(`.bs-act-${i}`), { opacity: 1, pointerEvents: "auto" }, act.at)
            .to(words, { yPercent: 0, duration: 0.1, stagger: 0.022, ease: "power3.out" }, act.at)
            .to(
              trailing,
              { opacity: 1, y: 0, duration: 0.08, stagger: 0.02, ease: "power2.out" },
              act.at + 0.035,
            );
          if (act.out !== null) {
            tl.to(
              words,
              { yPercent: -MASK_TRAVEL, duration: 0.08, stagger: 0.016, ease: "power2.in" },
              act.out,
            )
              .to(trailing, { opacity: 0, y: -18, duration: 0.06, ease: "power2.in" }, act.out)
              .set(q(`.bs-act-${i}`), { opacity: 0, pointerEvents: "none" }, act.out + 0.1);
          }
        });

        chips.forEach((chip, i) => {
          tl.fromTo(
            q(`.bs-chip-${i}`),
            { opacity: 0, scale: 0.25, rotate: chip.rot - 20 },
            { opacity: 1, scale: 1, rotate: chip.rot, duration: 0.08, ease: "back.out(2.4)" },
            chip.at,
          );
        });

        // The money beat: the cap lets go. Warm flash, one shockwave ring, a
        // punch on the artwork and droplets thrown clear of the neck.
        tl.to(q(".bs-flash"), { opacity: 0.32, duration: 0.015, ease: "power2.out" }, POP_AT - 0.012)
          .to(q(".bs-flash"), { opacity: 0, duration: 0.05, ease: "power2.in" }, POP_AT + 0.008)
          .fromTo(
            q(".bs-ring"),
            { opacity: 0.7, scale: 0.15 },
            { opacity: 0, scale: 2.2, duration: 0.11, ease: "power2.out" },
            POP_AT,
          )
          .to(
            q(".bs-stage-punch"),
            { scale: 1.035, duration: 0.025, ease: "power2.out", yoyo: true, repeat: 1 },
            POP_AT - 0.012,
          );

        q(".bs-drop").forEach((el, i) => {
          const d = BURST[i];
          tl.to(
            el,
            { opacity: 0.75, x: d.x, y: d.y, scale: 1, duration: 0.17, ease: "power2.out" },
            POP_AT + d.delay,
          ).to(el, { opacity: 0, duration: 0.14, ease: "power1.in" }, POP_AT + d.delay + 0.17);
        });

        // Chrome steps aside just before the pin releases into the page.
        tl.to([q(".bs-hud"), q(".bs-ticker")], { opacity: 0, duration: 0.06 }, 0.94);

        // Touch has no cursor to parallax against, so the scrub itself
        // separates the layers: artwork and chips drift in opposition across
        // the pin, which reads as the same depth the pointer gives a mouse.
        if (!finePointer) {
          tl.fromTo(q(".bs-stage-inner"), { yPercent: -2.5 }, { yPercent: 2.5, duration: 1 }, 0)
            .fromTo(q(".bs-chips"), { yPercent: 4.5 }, { yPercent: -4.5, duration: 1 }, 0);
        }

        // ---- 5. pointer layer (fine pointers only) ---------------------------
        if (finePointer) {
          const stageX = gsap.quickTo(q(".bs-stage-inner"), "xPercent", { duration: 1.1, ease: "power3" });
          const stageY = gsap.quickTo(q(".bs-stage-inner"), "yPercent", { duration: 1.1, ease: "power3" });
          const chipX = gsap.quickTo(q(".bs-chips"), "xPercent", { duration: 1.4, ease: "power3" });
          const chipY = gsap.quickTo(q(".bs-chips"), "yPercent", { duration: 1.4, ease: "power3" });
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            stageX(nx * 2.6);
            stageY(ny * 2.2);
            // The chips drift *against* the artwork — that opposition is what
            // reads as depth, rather than one flat layer sliding.
            chipX(nx * -4.5);
            chipY(ny * -3.5);
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          teardown.push(() => window.removeEventListener("pointermove", onMove));

          q(".bs-magnet").forEach((el) => {
            const mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
            const my = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
            const follow = (e: Event) => {
              const { clientX, clientY } = e as PointerEvent;
              const r = el.getBoundingClientRect();
              mx((clientX - (r.left + r.width / 2)) * 0.35);
              my((clientY - (r.top + r.height / 2)) * 0.55);
            };
            const release = () => {
              mx(0);
              my(0);
            };
            el.addEventListener("pointermove", follow);
            el.addEventListener("pointerleave", release);
            teardown.push(() => {
              el.removeEventListener("pointermove", follow);
              el.removeEventListener("pointerleave", release);
            });
          });
        }

        return () => {
          teardown.forEach((fn) => fn());
          heroSplit.revert();
          actSplits.forEach((s) => s.revert());
        };
      });

      // The pin is created after mount, which shifts everything below it.
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { dependencies: [armed], scope: root },
  );

  return (
    <section ref={root} className="relative bg-brasilena-yellow text-brasilena-ink">
      {/* Mobile gets a scroll runway (100svh + PIN_VH) and a sticky stage —
          native pinning; on desktop the wrapper collapses to the stage height
          and GSAP pins instead. */}
      <div className="bs-wrap relative motion-safe:max-md:h-[440svh]">
        <div className="bs-pin relative flex h-svh w-full flex-col overflow-hidden motion-safe:max-md:sticky motion-safe:max-md:top-0">
          {/* Two columns only from `lg`. At 768–1023 (tablet portrait) that
              split leaves a ~280px copy column, which breaks the headline into
              four lines and strands the artwork in dead space — so those widths
              keep the stacked composition with a full-width stage. */}
          <div className="relative z-10 mx-auto grid w-full max-w-390 flex-1 grid-cols-1 content-center gap-3 px-[clamp(1.25rem,5vw,4.5rem)] pb-18 pt-[clamp(4.5rem,10vh,9rem)] md:gap-6 md:pb-24 md:pt-[clamp(6rem,12vh,9rem)] lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-10">
            {/* ---------- copy column ---------- */}
            <div className="bs-copy relative order-2 will-change-transform lg:order-1">
              {/* The acts stack on top of the opening block, so the column
                  never reflows as the beats swap. */}
              <div className="relative">
                <div className="bs-intro hero-veil">
                  <span className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-brasilena-red md:text-[11px] md:tracking-[0.26em]">
                    {/* The rule costs 40px the kicker needs to stay on one
                        line at 390px wide. */}
                    <span className="bs-rule hidden h-px w-8 shrink-0 bg-brasilena-red md:block" />
                    <span className="bs-kicker-text">{kicker}</span>
                  </span>

                  {/* `.font-display` is unlayered in globals.css, so it beats
                      Tailwind's leading-* utilities — hence the `!`. */}
                  <h1 className="bs-headline hero-split mt-3 font-display uppercase leading-[0.82]! text-[clamp(1.9rem,8vw,5.6rem)] md:mt-5">
                    {headline.map((line) => (
                      <span key={line.text} className={cn("block", line.accent && "text-brasilena-red")}>
                        {line.text}
                      </span>
                    ))}
                  </h1>

                  <p className="bs-lede mt-4 max-w-[46ch] font-sans text-[clamp(0.8rem,1.15vw,1.05rem)] leading-snug text-brasilena-ink/85 md:mt-5 md:leading-relaxed">
                    {lede}
                  </p>

                  <div className="bs-cta-row mt-5 flex flex-wrap items-center gap-3 md:mt-7">
                    {ctas.map((cta) => (
                      <PillButton
                        key={cta.href}
                        href={cta.href}
                        tone={cta.tone}
                        className="bs-magnet px-5 py-3 will-change-transform md:px-7 md:py-3.5"
                      >
                        {cta.label}
                      </PillButton>
                    ))}
                  </div>
                </div>

                {acts.map((act, i) => (
                  <div
                    key={act.title.join(" ")}
                    className={cn(
                      "bs-act",
                      `bs-act-${i}`,
                      // The veil matters most here: without it all three acts
                      // paint on top of each other, and on top of the headline,
                      // for as long as the intro takes to arm.
                      "hero-veil pointer-events-none absolute inset-x-0 top-0",
                      // Reduced motion never scrubs, so the acts would just pile
                      // onto the headline — drop them entirely there.
                      "hidden motion-safe:block",
                    )}
                  >
                    <p className="bs-act-title hero-split font-display uppercase leading-[0.82]! text-[clamp(1.9rem,7.2vw,4.8rem)]">
                      {act.title.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                    <p className="bs-act-text mt-4 max-w-[42ch] font-sans text-[clamp(0.8rem,1.15vw,1.05rem)] leading-snug text-brasilena-ink/85 md:mt-5 md:leading-relaxed">
                      {act.text}
                    </p>
                    {/* The CTA is clickable only while its act is on screen —
                        the scrub flips pointer-events on `.bs-act`, and this
                        inherits it. */}
                    {act.cta && (
                      <div className="bs-act-cta mt-5 md:mt-7">
                        <PillButton
                          href={act.cta.href}
                          tone="ink"
                          className="bs-magnet will-change-transform"
                        >
                          {act.cta.label}
                        </PillButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ---------- artwork stage ---------- */}
            <div
              className="bs-stage relative order-1 mx-auto w-full max-w-104 will-change-transform sm:max-w-lg lg:order-2 lg:max-w-none"
              style={{ aspectRatio: STAGE_RATIO }}
            >
              <div className="bs-stage-inner absolute inset-0 will-change-transform">
                <div className="bs-stage-punch absolute inset-0 will-change-transform">
                  {/* Static first frame — carries the paint until the canvas
                      has something to show, and the fallback if it never does. */}
                  <Image
                    src={FALLBACK_SRC}
                    alt={alt}
                    fill
                    priority
                    sizes="(max-width: 767px) 92vw, 58vw"
                    className="object-contain"
                  />
                  <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
                </div>

                {/* Pop FX — anchored on the bottle neck. */}
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                  <div
                    className="bs-flash hero-fx absolute inset-0"
                    style={{
                      background: `radial-gradient(36% 36% at ${NECK.left} ${NECK.top}, rgba(255,255,255,0.95), transparent 70%)`,
                    }}
                  />
                  <div
                    className="bs-ring hero-fx absolute aspect-square w-[20%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brasilena-cream"
                    style={{ left: NECK.left, top: NECK.top }}
                  />
                  {BURST.map((d, i) => (
                    <span
                      key={i}
                      className="bs-drop hero-fx absolute block rounded-full bg-brasilena-ink/70"
                      style={{ left: NECK.left, top: NECK.top, width: d.size, height: d.size }}
                    />
                  ))}
                </div>

                {/* Kinetic pill labels. */}
                <div className="bs-chips pointer-events-none absolute inset-0" aria-hidden>
                  {chips.map((chip, i) => (
                    <span
                      key={chip.label}
                      className={cn("bs-chip", `bs-chip-${i}`, "hero-veil absolute block will-change-transform")}
                      style={{ left: chip.left, top: chip.top }}
                    >
                      <span
                        className={cn(
                          "bs-chip-inner block rounded-full px-4 py-1.5 font-display uppercase leading-none text-[clamp(1.1rem,3.4vw,3rem)] shadow-[0_14px_30px_-10px_rgba(106,63,64,0.6)] ring-2 ring-brasilena-cream/40 md:px-6 md:py-2.5",
                          CHIP_TONES[chip.tone],
                        )}
                      >
                        {chip.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ---------- HUD: beat counter + progress rail ---------- */}
          <div className="bs-hud hero-veil pointer-events-none absolute bottom-18 right-[clamp(1.25rem,5vw,4.5rem)] z-20 hidden items-center gap-3 motion-safe:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-brasilena-ink/70 md:text-[11px]">
              <span className="bs-counter-now text-brasilena-red">01</span>
              <span className="mx-1 opacity-50">/</span>
              {String(BEAT_STARTS.length).padStart(2, "0")}
            </span>
            <span className="relative block h-16 w-px overflow-hidden bg-brasilena-ink/20 md:h-24">
              <span className="bs-rail-fill absolute inset-0 origin-top bg-brasilena-red" />
            </span>
          </div>

          {/* ---------- scroll hint ---------- */}
          {/* Nothing to scroll through when the scrub is off. */}
          <div className="bs-hint hero-veil pointer-events-none absolute bottom-18 left-[clamp(1.25rem,5vw,4.5rem)] z-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-brasilena-ink/70 motion-reduce:hidden md:text-[11px]">
            <span className="grid size-9 place-items-center rounded-full border border-brasilena-ink/30">
              <span className="block size-1.5 animate-bounce rounded-full bg-brasilena-red" />
            </span>
            {scroll}
          </div>

          {/* ---------- velocity-reactive ticker ---------- */}
          <div className="bs-ticker hero-veil absolute inset-x-0 bottom-0 z-20 overflow-hidden border-t border-brasilena-ink/15 py-1.5">
            <div className="bs-ticker-track flex w-max items-center will-change-transform">
              {[0, 1].map((copy) =>
                ticker.map((phrase) => (
                  <span
                    key={`${copy}-${phrase}`}
                    aria-hidden={copy === 1}
                    // Teko overflows a tight line box and the strip clips it —
                    // 1.4 leaves room for the accents and the descenders.
                    className="flex shrink-0 items-center gap-5 pr-5 font-display uppercase leading-[1.4]! text-[clamp(1.1rem,2.4vw,2rem)] text-brasilena-ink/80"
                  >
                    {phrase}
                    <BubbleIcon className="size-3.5 shrink-0 text-brasilena-red" />
                  </span>
                )),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
