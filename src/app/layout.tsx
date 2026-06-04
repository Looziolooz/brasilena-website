import type { Metadata, Viewport } from "next";
import { teko, gtAmerica, vulfMono } from "./fonts";
import { SITE } from "@/content/brasilena";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ffcc00",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  metadataBase: new URL("https://brasilena.net"),
  icons: {
    icon: [
      { url: "/seo/favicon.svg", type: "image/svg+xml" },
      { url: "/seo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/seo/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/seo/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/seo/favicon.ico"],
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${teko.variable} ${gtAmerica.variable} ${vulfMono.variable} antialiased`}
    >
      <body className="min-h-screen overflow-x-hidden bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
