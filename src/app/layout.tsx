import type { Metadata, Viewport } from "next";
import { interTight } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Writter — simulador de frases",
  description: "Escreva sua frase, escolha a cor e poste nos stories ou no feed.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111111",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${interTight.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
