import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Beau_Rivage } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

/* Only ever used for words Jessica actually wrote. Never for UI. */
const hand = Beau_Rivage({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hand",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://thevillagecollective757.com"),
  title: {
    default: "The Village Collective · Trusted Local Businesses in Hampton Roads",
    template: "%s · The Village Collective",
  },
  description:
    "A curated collective of trusted local businesses across Hampton Roads, presented by Bless This Mess Cleaning. Every season of life deserves a village.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${hand.variable}`}
    >
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
