import type { Metadata } from "next";
import { Playfair_Display, Beau_Rivage } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/*
  Display serif is justified, not reached for: the client's own monogram sets
  "TVC" in a high-contrast transitional serif, and the existing brand is a serif
  brand. Playfair is the closest match in the approved rotation. (Fraunces and
  Instrument Serif are banned as LLM defaults — deliberately avoided.)
*/
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

/* Used only for Jessica's signature and her letter heading. Never for UI. */
const script = Beau_Rivage({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-script",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://thevillagecollective757.com",
  ),
  title: {
    default: "The Village Collective — Trusted Local Businesses in Hampton Roads",
    template: "%s · The Village Collective",
  },
  description:
    "A curated collective of trusted local businesses across Hampton Roads, presented by Bless This Mess Cleaning. Every season of life deserves a village.",
  openGraph: {
    title: "The Village Collective",
    description:
      "Trusted local businesses across Hampton Roads. Every season of life deserves a village.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${script.variable} ${GeistSans.variable}`}>
      <body>
        <div className="grain" aria-hidden="true" />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
