import type { MetadataRoute } from "next";
import { MEMBERS, SEASONS } from "@/data/members";
import { SITE_URL } from "@/lib/site";

/*
  Every page, so a crawler does not have to guess. There was no sitemap at all,
  which for a local directory is the whole point missed: forty business pages and
  eight season pages that nothing links to from outside.

  Priorities say what this site is for. The village index and the individual
  businesses are the product; the letter from Jess is context.
*/
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/village`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/seasons`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...SEASONS.map((s) => ({
      url: `${SITE_URL}/seasons/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...MEMBERS.map((m) => ({
      url: `${SITE_URL}/village/${m.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
