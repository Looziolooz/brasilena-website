import { SmoothScroll } from "@/components/SmoothScroll";
import { Bubbles } from "@/components/Bubbles";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WaveDivider } from "@/components/WaveDivider";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Marquee } from "@/components/Marquee";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";

export default function Home() {
  return (
    <>
      <SmoothScroll />

      {/* Fixed chrome — must stay OUTSIDE #smooth-content for ScrollSmoother */}
      <Header pinnedHero />
      <Bubbles className="text-brasilena-ink/25" />
      <CookieBanner />

      {/* Smooth-scrolled content */}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main className="relative">
            <Hero />

            {/* Yellow → cream wave transition into the products section */}
            <div className="relative z-2 -mb-px bg-brasilena-cream">
              <WaveDivider color="#ffcc00" />
            </div>

            <div className="relative z-2">
              <FeaturedProducts />
              <Marquee />
              <ContactForm />
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
