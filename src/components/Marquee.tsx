import { Fragment } from "react";
import Image from "next/image";
import { MARQUEE_PHRASES } from "@/content/brasilena";

function MarqueeItem({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-[clamp(2rem,6vw,6rem)] pr-[clamp(2rem,6vw,6rem)]"
      aria-hidden={ariaHidden}
    >
      {MARQUEE_PHRASES.map((phrase, i) => (
        <Fragment key={i}>
          <span className="font-display uppercase leading-none text-brasilena-red text-[clamp(4rem,13vw,12rem)] whitespace-nowrap">
            {phrase}
          </span>
          <Image
            src="/images/brasilena/senorita.svg"
            alt=""
            width={500}
            height={500}
            unoptimized
            className="h-[clamp(8rem,17vw,17rem)] w-auto shrink-0 drop-shadow-[0_10px_22px_rgba(106,63,64,0.3)]"
          />
        </Fragment>
      ))}
    </div>
  );
}

/**
 * Infinite horizontal marquee band. Two phrases — "Anima brasiliana" and
 * "Cuore calabrese" — in solid display red (matching the headings), each
 * followed by the stylised Brasilena señorita. Two duplicated tracks +
 * translateX(-50%) keyframe = seamless loop.
 */
export function Marquee() {
  return (
    <section className="relative flex items-center overflow-hidden bg-brasilena-cream py-[clamp(3rem,8vw,7rem)]">
      <div className="flex w-max animate-marquee items-center">
        <MarqueeItem />
        <MarqueeItem ariaHidden />
      </div>
    </section>
  );
}
