import localFont from "next/font/local";

export const robotoCondensed = localFont({
  src: [
    { path: "../fonts/roboto-condensed-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/roboto-condensed-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
});

export const archivoNarrow = localFont({
  src: [
    { path: "../fonts/archivo-narrow-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/archivo-narrow-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
});

export const interTight = localFont({
  src: [
    { path: "../fonts/inter-tight-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter-tight-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter-tight-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-ui",
  display: "swap",
});
