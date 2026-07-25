import type { Metadata } from "next";
import { MEMBERS, CATEGORIES } from "@/data/members";
import { VillageGrid } from "@/components/village-grid";

export const metadata: Metadata = {
  title: "The Village",
  description:
    "All 39 trusted local businesses in The Village Collective, serving families across Hampton Roads. Free to browse, nothing sponsored, nothing ranked.",
};

export default async function VillagePage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const valid = CATEGORIES.some((x) => x.slug === c) ? c : undefined;

  return (
    <section className="px-6 pt-36 pb-8 sm:px-10 sm:pt-44">
      <div className="mx-auto max-w-[1180px]">
        <header className="max-w-[34ch]">
          <h1 className="t-display t-section">The Village</h1>
          <p className="mt-6 text-[15.5px] leading-[1.7] text-ink-soft">
            {MEMBERS.length} people Jessica trusts, across Hampton Roads. Find yours by what you
            need or where you are.
          </p>
        </header>

        <div className="mt-14">
          <VillageGrid members={MEMBERS} initialCategory={valid} />
        </div>
      </div>
    </section>
  );
}
