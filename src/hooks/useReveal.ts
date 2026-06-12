"use client";

import { useEffect } from "react";

/**
 * Adds the `is-inview` class to every `.reveal` element when it scrolls into
 * the viewport, driving the CSS reveal transition (see globals.css — direction
 * via the `reveal-left/right/down/zoom` modifiers). One-shot.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.revealDelay;
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-inview");
            io.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
