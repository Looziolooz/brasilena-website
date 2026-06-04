import type { SVGProps } from "react";

/** Instagram glyph — extracted from brasilena.net header button. */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="currentColor"
        d="M12 7.3a4.57 4.57 0 1 0 0 9.14 4.57 4.57 0 0 0 0-9.14Zm0 1.6a2.96 2.96 0 1 1 0 5.93 2.96 2.96 0 0 1 0-5.93Zm4.75-1.78a1.07 1.07 0 1 0 0 2.13 1.07 1.07 0 0 0 0-2.13ZM12 4.2c2.4 0 2.68 0 3.62.05.87.04 1.35.19 1.66.31.42.16.72.36 1.03.67.31.31.5.61.66 1.03.12.31.27.79.31 1.66.05.94.05 1.22.05 3.62s0 2.68-.05 3.62c-.04.87-.19 1.35-.31 1.66-.16.42-.35.72-.66 1.03-.31.31-.61.5-1.03.66-.31.12-.79.27-1.66.31-.94.05-1.22.05-3.62.05s-2.68 0-3.62-.05c-.87-.04-1.35-.19-1.66-.31a2.78 2.78 0 0 1-1.03-.66 2.78 2.78 0 0 1-.66-1.03c-.12-.31-.27-.79-.31-1.66C4.2 14.68 4.2 14.4 4.2 12s0-2.68.05-3.62c.04-.87.19-1.35.31-1.66.16-.42.35-.72.66-1.03.31-.31.61-.5 1.03-.66.31-.12.79-.27 1.66-.31C9.32 4.2 9.6 4.2 12 4.2Z"
      />
    </svg>
  );
}

/** Diagonal arrow used on CTA buttons. */
export function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5 12h14m-6-7 7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

/**
 * Soap-bubble glyph, matching the live site's `#burbuja-template` symbol:
 * a thin-stroked circle ("pompa") plus an offset elliptical highlight ("reflejo").
 */
export function BubbleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="33" cy="33" r="32" stroke="currentColor" strokeWidth="2" fill="transparent" />
      <ellipse
        cx="21.22"
        cy="14.55"
        rx="14.18"
        ry="6.35"
        fill="currentColor"
        transform="translate(-4.5 13.8) rotate(-32.78)"
      />
    </svg>
  );
}
