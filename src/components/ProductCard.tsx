import Image from "next/image";
import type { Product } from "@/types/content";

/**
 * A single format card (Bottiglia 18/25 cl / Bottiglione 92 cl / Lattina 25 cl).
 * A coloured bubble backdrop (CSS background SVG) with the transparent cutout of
 * the real Brasilena product floating on top. The format and capacity sit in the
 * lower-left corner. Bottle lifts on hover.
 */
export function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <article
      className="reveal group relative isolate aspect-[389/519] w-full overflow-hidden rounded-[clamp(2.5rem,4vw,5rem)] bg-cover bg-center"
      style={{ backgroundImage: `url(${product.background})` }}
      data-reveal-delay={index * 120}
    >
      {/* Transparent cutout of the real product, floating on the colour */}
      <Image
        src={product.bottle}
        alt={product.bottleAlt}
        fill
        sizes="(max-width: 768px) 90vw, 25vw"
        className="object-contain p-[clamp(1.25rem,3.5vw,2.5rem)] drop-shadow-[0_18px_30px_rgba(0,0,0,0.28)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.04]"
      />

      <div className="absolute bottom-6 left-7 z-10" style={{ color: product.titleColor }}>
        <span className="block font-mono text-xs uppercase tracking-wide opacity-80">
          {product.format}
        </span>
        <h3 className="font-display text-3xl uppercase leading-none">
          {product.name} <span className="opacity-90">{product.size}</span>
        </h3>
      </div>
    </article>
  );
}
