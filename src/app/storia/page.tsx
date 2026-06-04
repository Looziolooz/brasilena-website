import type { Metadata } from "next";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Bubbles } from "@/components/Bubbles";
import { Header } from "@/components/Header";
import { StoryTimeline } from "@/components/StoryTimeline";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "La mia storia | Brasilena",
  description:
    "La cronostoria della Brasilena: dalla gassosa al caffè con la pallina di vetro degli anni '30 di Girifalco, al marchio registrato negli anni '60, fino alla bibita esportata in tutto il mondo.",
  openGraph: {
    title: "La mia storia | Brasilena",
    description:
      "Quasi cent'anni di gassosa al caffè: la storia della Brasilena, da Girifalco al mondo.",
    type: "article",
    locale: "it_IT",
  },
};

export default function StoriaPage() {
  return (
    <>
      <SmoothScroll />

      {/* Fixed chrome — must stay OUTSIDE #smooth-content for ScrollSmoother */}
      <Header />
      <Bubbles className="text-brasilena-ink/25" />
      <CookieBanner />

      {/* Smooth-scrolled content */}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main className="relative">
            <StoryTimeline />
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
