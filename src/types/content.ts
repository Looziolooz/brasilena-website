export interface NavLink {
  label: string;
  href: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
}

export interface Product {
  name: string;
  slug: string;
  /** Capacity label, e.g. "18 cl". */
  size: string;
  /** Packaging type, e.g. "Bottiglia di vetro". */
  format: string;
  titleColor: string;
  /** Decorative coloured backdrop (SVG). */
  background: string;
  /** Real product photo, blended over the backdrop. */
  bottle: string;
  bottleAlt: string;
}

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

/**
 * A kinetic pill label that pops in over the hero splash (Stappa / Versa /
 * Brinda), positioned inside the artwork stage box.
 */
export interface HeroChip {
  label: string;
  /** Scrub progress (0–1) at which it pops in. */
  at: number;
  /** Position inside the stage box, as CSS percentages. */
  left: string;
  top: string;
  /** Resting tilt, in degrees. */
  rot: number;
  tone: "red" | "ink" | "sand";
}

/** One scroll-driven copy beat that takes over the hero headline slot. */
export interface HeroAct {
  /** One entry per display line — the break is typographic, not automatic. */
  title: string[];
  text: string;
  /** Scrub progress (0–1) at which it enters. */
  at: number;
  /** Scrub progress at which it leaves — null keeps it to the end. */
  out: number | null;
  /** Optional CTA, for the beat that closes the hero. */
  cta?: NavLink;
}

export interface TimelineEntry {
  /** Period label shown large, e.g. "Anni '30" or "1982". */
  year: string;
  title: string;
  text: string;
  /** Real photo path, or null to render an on-brand placeholder panel. */
  image: string | null;
  imageAlt: string;
  /** How the photo fills its frame. Cutout PNGs → "contain"; photos → "cover". */
  fit?: "cover" | "contain";
}
