import Link from "next/link";
import { FOOTER_COLUMNS, FOOTER_META } from "@/content/brasilena";

/**
 * Final footer with link columns and the giant "Brasilena" wordmark
 * cropped by the bottom edge. Mirrors b-footer.
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brasilena-yellow text-brasilena-ink">
      <div className="mx-auto w-full max-w-[1440px] px-[clamp(1.25rem,6vw,6.25rem)] pt-[clamp(3rem,7vw,7rem)] pb-[clamp(8rem,22vw,18rem)]">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono text-xs uppercase tracking-wide opacity-70">{col.heading}</h3>
              <ul className="mt-5 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-display text-2xl uppercase leading-tight transition-opacity hover:opacity-60"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-mono text-xs uppercase tracking-wide opacity-70">
              {FOOTER_META.contactHeading}
            </h3>
            <a
              href={`mailto:${FOOTER_META.email}`}
              className="mt-5 block font-display text-2xl uppercase leading-tight transition-opacity hover:opacity-60"
            >
              {FOOTER_META.email}
            </a>
          </div>
        </div>

        <div className="mt-16 max-w-md space-y-1 text-sm leading-snug opacity-80">
          <p>{FOOTER_META.copyright}</p>
          <p>{FOOTER_META.design}</p>
        </div>
      </div>

      {/* Diagonal BRASILENA sash — runs bottom-left to top-right like the red
          band on the can. Spans the full footer (clipped only by the footer
          edges) so the right end rises to the top instead of being cut. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-[4%] left-[58%] w-[185%] -translate-x-1/2 -rotate-[20deg] bg-brasilena-red py-[clamp(0.45rem,1.6vw,1.3rem)] shadow-[0_12px_36px_rgba(106,63,64,0.28)]">
          <span className="block select-none whitespace-nowrap pl-[8%] text-center font-display uppercase italic leading-[0.8] text-white text-[clamp(2.75rem,10vw,8rem)]">
            Brasilena
          </span>
        </div>
      </div>
    </footer>
  );
}
