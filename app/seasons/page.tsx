import type { Metadata } from "next";
import { MEMBERS, SEASONS } from "@/data/members";
import { SeasonTiles } from "@/components/season-tiles";
import { buildTiles } from "@/lib/tiles";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Seasons",
  description:
    "Life doesn't happen one service at a time. Find the people you need for the season you're actually in — buying a home, welcoming a baby, or when life gets hard.",
};

export default function SeasonsPage() {
  const tiles = buildTiles(SEASONS, MEMBERS);

  return (
    <section className="px-6 pt-36 pb-8 sm:px-10 sm:pt-44">
      <div className="mx-auto max-w-[1180px]">
        <header className="max-w-[38ch]">
          <h1 className="t-display t-section">Seasons</h1>
          <p className="mt-6 text-[15.5px] leading-[1.7] text-ink-soft">
            A family buying a home needs a realtor, a cleaner, and a roofer. New parents need
            something else entirely. Start where you actually are.
          </p>
        </header>

        <Reveal className="mt-14">
          <SeasonTiles tiles={tiles} />
        </Reveal>
      </div>
    </section>
  );
}
