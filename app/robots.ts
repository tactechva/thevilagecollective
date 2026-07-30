import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* Nothing here is private: the whole site is meant to be found. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
