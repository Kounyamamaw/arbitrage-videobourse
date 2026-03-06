import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeInit } from "@/components/layout/ThemeInit";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300","400","500","600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:  "ArbitrAge — Comparez. Choisissez. Économisez.",
    template: "%s | ArbitrAge by VideoBourse",
  },
  description:
    "Le comparateur de référence pour choisir le meilleur courtier, banque ou assurance-vie en France. Frais réels, simulation personnalisée.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${sora.variable} ${dmSans.variable}`}
    >
      <body>
        <ThemeInit />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
