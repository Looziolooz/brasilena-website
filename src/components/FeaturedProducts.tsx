import { PRODUCTS, PRODUCTS_INTRO } from "@/content/brasilena";
import { ProductCard } from "@/components/ProductCard";

/** "Le mie bibite" — title, intro line and the drink format cards. */
export function FeaturedProducts() {
  return (
    <section id="prodotti" className="relative scroll-mt-24 bg-brasilena-cream">
      <div className="mx-auto w-full max-w-[1440px] px-[clamp(1.25rem,6vw,6.25rem)] pt-[clamp(4rem,9vw,8rem)] pb-[clamp(3rem,6vw,6rem)]">
        <header className="reveal mx-auto max-w-xl text-center">
          <h2 className="font-display text-brasilena-red uppercase leading-[0.85] text-[clamp(3.5rem,9vw,6.6rem)]">
            {PRODUCTS_INTRO.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-snug text-brasilena-ink/80">
            {PRODUCTS_INTRO.text}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
