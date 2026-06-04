import localFont from "next/font/local";

// Teko — variable display face (100–900). Used for large UPPERCASE headings.
export const teko = localFont({
  src: "../../public/fonts/Teko-Variable.ttf",
  weight: "100 900",
  display: "swap",
  variable: "--font-teko",
});

// GT America Extended — UI / body / buttons / nav.
export const gtAmerica = localFont({
  src: [
    {
      path: "../../public/fonts/GT-America-Extended-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GT-America-Extended-Regular.otf",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-gt-america",
});

// Vulf Mono Bold — mono caption / label accents.
export const vulfMono = localFont({
  src: [
    {
      path: "../../public/fonts/Vulf_Mono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vulf_Mono-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-vulf-mono",
});
