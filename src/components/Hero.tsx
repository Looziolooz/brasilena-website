import Image from "next/image";
import { HERO, STORY, GALLERY } from "@/content/brasilena";
import { PillButton } from "@/components/PillButton";
import { HeroPour } from "@/components/HeroPour";

/**
 * The yellow opening act, then intro copy, an autoplaying media block, the
 * four-photo gallery and the closing line. Reveals via `.reveal`.
 */
export function Hero() {
  return (
    <section className="relative bg-brasilena-yellow text-brasilena-ink">
      {/* Opening: pinned scroll-scrub of the bottle "stappo" (18 HQ frames) + parallax */}
      <HeroPour />

      {/* Intro copy */}
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-[clamp(1.25rem,6vw,6.25rem)] py-[clamp(4rem,10vw,9rem)] md:grid-cols-2 md:items-end">
        <p className="reveal reveal-left max-w-xl font-display text-[clamp(1.75rem,3.4vw,3rem)] uppercase leading-[0.95]">
          {HERO.intro}
        </p>
        <div className="reveal reveal-right md:justify-self-end">
          <PillButton href="#prodotti" tone="ink">
            {HERO.cta}
          </PillButton>
        </div>
      </div>

      {/* Media block — Vimeo video + caption */}
      <div
        id="la-mia-gente"
        className="mx-auto w-full max-w-[1440px] scroll-mt-28 px-[clamp(1.25rem,6vw,6.25rem)] pb-[clamp(3rem,7vw,6rem)]"
      >
        <div className="reveal reveal-zoom relative aspect-video w-full overflow-hidden rounded-[clamp(1.5rem,3vw,2.5rem)] bg-black/30">
          <video
            src="/videos/videoloop.mp4"
            title={STORY.videoCaption}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <p className="reveal mt-5 text-center font-display text-[clamp(1.5rem,4vw,3rem)] uppercase">
          {STORY.videoCaption}
        </p>
      </div>

      {/* Story copy */}
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-[clamp(1.25rem,6vw,6.25rem)] py-[clamp(3rem,7vw,6rem)] md:grid-cols-2 md:items-end">
        <p className="reveal reveal-left max-w-xl font-display text-[clamp(1.75rem,3.4vw,3rem)] uppercase leading-[0.95]">
          {STORY.paragraph}
        </p>
        <div className="reveal reveal-right md:justify-self-end">
          <PillButton href="#la-mia-gente" tone="ink">
            {STORY.cta}
          </PillButton>
        </div>
      </div>

      {/* Gallery */}
      <div className="mx-auto w-full max-w-[1440px] px-[clamp(1.25rem,6vw,6.25rem)] pb-[clamp(4rem,9vw,8rem)]">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {GALLERY.map((item, i) => (
            <figure key={item.caption} className="reveal" data-reveal-delay={i * 110}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
                {/* Over-sized inner layer parallaxes within the masked frame */}
                <div
                  className="absolute inset-x-0 -top-[8%] h-[116%]"
                  data-parallax={i % 2 === 0 ? "0.06" : "0.09"}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <figcaption className="mt-3 font-display text-xl uppercase leading-none">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* Closing line — parallax wrapper (GSAP transform) around the CSS reveal */}
      <div
        className="px-[clamp(1.25rem,6vw,6.25rem)] pb-[clamp(4rem,10vw,9rem)] text-center"
        data-parallax="0.12"
      >
        <p className="reveal font-display uppercase leading-[0.85] text-[clamp(3rem,12vw,11rem)]">
          {STORY.closing}
        </p>
      </div>
    </section>
  );
}
