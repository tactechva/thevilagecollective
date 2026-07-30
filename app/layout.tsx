import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Beau_Rivage } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Music } from "@/components/music";
import { OG_BASE, SITE_URL } from "@/lib/site";

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

const TITLE = "The Village Collective · Trusted Local Businesses in Hampton Roads";
const BLURB =
  "A curated collective of trusted local businesses across Hampton Roads, presented by Bless This Mess Cleaning. Every season of life deserves a village.";

/*
  metadataBase used to default to thevillagecollective757.com, which does not
  resolve. Every relative canonical and share URL was therefore pointing at a
  host that does not exist. The live domain is 757village.com.

  openGraph and twitter live here so every page inherits a card; pages that want
  their own override title, description and image (member pages use their own
  logo). Deliberately NO canonical or og:url at this level: metadata is inherited
  in Next, so a canonical of "/" here would tell crawlers that /village and every
  member page are all really the home page. Those are set per route.

  The card itself is app/opengraph-image.png, picked up by file convention.
*/
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · The Village Collective" },
  description: BLURB,
  applicationName: "The Village Collective",
  openGraph: { ...OG_BASE, title: TITLE, description: BLURB },
  twitter: { card: "summary_large_image", title: TITLE, description: BLURB },
  robots: { index: true, follow: true },
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
        {/* in the layout, not the page, so it does not cut off on navigation */}
        <Music />
      </body>
    </html>
  );
}
