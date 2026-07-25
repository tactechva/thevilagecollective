import type { Member } from "@/data/members";

export type Tile = {
  slug: string;
  label: string;
  blurb: string;
  count: number;
  /** Real member names, as a table of contents. Legible where a 56px logo isn't. */
  names: string[];
};

export function buildTiles(
  seasons: readonly { slug: string; label: string; blurb: string }[],
  members: Member[],
): Tile[] {
  return seasons.map((s) => {
    const inSeason = members.filter((m) => m.seasons.includes(s.slug));
    return {
      slug: s.slug,
      label: s.label,
      blurb: s.blurb,
      count: inSeason.length,
      names: inSeason.slice(0, 4).map((m) => m.title),
    };
  });
}
