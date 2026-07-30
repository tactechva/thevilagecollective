/*
  Where the site actually lives.

  It was written into app/layout.tsx as thevillagecollective757.com, a host that
  does not resolve, so every relative canonical and share URL pointed at nothing.
  The live domain is 757village.com, behind Cloudflare, pointed at Vercel.

  Set NEXT_PUBLIC_SITE_URL in the environment to override, which is what preview
  deployments and any future domain change should do rather than editing this.
*/
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://757village.com";

/*
  The openGraph fields every page should carry.

  Next shallow-merges metadata: a page's `openGraph` REPLACES the parent's whole
  object rather than merging into it. Setting these once in the root layout looked
  right and emitted nothing, because every page then defined its own openGraph for
  the sake of og:url and silently dropped site name, type and locale with it.
  Spread this into each one.
*/
export const OG_BASE = {
  type: "website",
  siteName: "The Village Collective",
  locale: "en_US",
} as const;
