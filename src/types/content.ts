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
