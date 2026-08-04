"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { useReveal } from "@/hooks/useReveal";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

// Where anchored sections land below the fixed header (mirrors the hero CTAs).
const HEADER_CLEARANCE = 88;
const ANCHOR_OFFSET = `top ${HEADER_CLEARANCE}px`;

/** Resolve an `<a href>` to an in-page selector ("#x" or "/#x"), else null. */
function anchorSelector(href: string | null): string | null {
  if (!href) return null;
  if (href.startsWith("#")) return href.length > 1 ? href : null;
  if (href.startsWith("/#")) return href.slice(1);
  return null;
}

function scrollToSelector(selector: string, smooth: boolean) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return false;
  // A section can opt into being centred in the viewport (e.g. a form that is
  // vertically centred in a tall section) via `data-scroll-align="center"`;
  // everything else lands its top just below the fixed header.
  //
  // Centring only makes sense while the section still fits under the header —
  // past that, centring pushes its heading up behind the fixed bar, so fall
  // back to top-aligning. And even when it does fit, centre it in the space
  // *below* the header rather than in the raw viewport.
  const centered =
    el.dataset.scrollAlign === "center" &&
    el.getBoundingClientRect().height <= window.innerHeight - HEADER_CLEARANCE;
  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(
      selector,
      smooth,
      centered ? `center center+=${HEADER_CLEARANCE / 2}` : ANCHOR_OFFSET,
    );
  } else {
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: centered ? "center" : "start" });
  }
  return true;
}

/**
 * Global GSAP scroll setup. Inertial ScrollSmoother is enabled ONLY on
 * pointer-precise, ≥768px screens that don't request reduced motion — touch /
 * mobile keeps fast native momentum scrolling. ScrollTrigger still drives
 * pins/scrubs everywhere. Also drives the `.reveal` fade-ups.
 *
 * Anchor links: native hash scrolling is broken under ScrollSmoother (the
 * content is transform-offset), so a single delegated, capture-phase click
 * handler routes every in-page `#id` / `/#id` link through ScrollSmoother
 * (preventDefault keeps Next's <Link> from also navigating; cross-page `/#id`
 * links fall through to normal navigation and are caught by the hash-on-load
 * effect once the target page mounts).
 *
 * Requires the #smooth-wrapper / #smooth-content structure in the page, with all
 * `position: fixed` chrome rendered OUTSIDE the wrapper.
 */
export function SmoothScroll() {
  useGSAP(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
        normalizeScroll: false,
      });

      // Global parallax: any element flagged with `data-parallax="<depth>"`
      // drifts vertically at a different speed than the page (scrub ties it to
      // the scrollbar). Depth ~0.05 = subtle, ~0.2 = pronounced. Transform-only,
      // and desktop/motion-safe only since it lives in this matchMedia block.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const depth = Number(el.dataset.parallax ?? "0.1");
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

      return () => smoother.kill();
    });

    return () => mm.revert();
  });

  // Smooth-scroll every in-page anchor link through ScrollSmoother.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const link = (e.target as HTMLElement | null)?.closest("a");
      if (!link || link.target === "_blank") return;
      const selector = anchorSelector(link.getAttribute("href"));
      if (!selector) return;
      // Only intercept when the target exists on THIS page; otherwise let the
      // link navigate (cross-page "/#id" → handled on load below).
      if (scrollToSelector(selector, true)) {
        e.preventDefault();
        if (history.replaceState) history.replaceState(null, "", selector);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // On fresh load / client-side navigation: honor a target hash, otherwise
  // start at the very top. ScrollSmoother fakes scroll via a transform, so a
  // stale window position carried over from the previous page (e.g. clicking
  // "La mia storia" from the footer) can leave the new page parked at its
  // bottom — an explicit reset is needed since Next's scroll-to-top can't see
  // the smoother's internal position.
  useEffect(() => {
    const hash = window.location.hash;
    const wantsHash = !!hash && hash !== "#";
    let raf = 0;
    let tries = 0;
    const settle = () => {
      const smoother = ScrollSmoother.get();
      if (wantsHash) {
        if (scrollToSelector(hash, false)) return;
      } else {
        window.scrollTo(0, 0);
        if (smoother) {
          smoother.scrollTop(0);
          return;
        }
        // No smoother (touch / reduced-motion): a couple of resets settle it.
        if (tries > 2) return;
      }
      if (tries++ > 40) return;
      raf = requestAnimationFrame(settle);
    };
    raf = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(raf);
  }, []);

  useReveal();
  return null;
}
