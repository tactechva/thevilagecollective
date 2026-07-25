import type { Metadata } from "next";
import { MEMBERS, CATEGORIES } from "@/data/members";
import { VillageIndex } from "@/components/village-index";
import { Sprig } from "@/components/floral";

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
    <section className="px-6 pt-32 pb-8 sm:px-10 sm:pt-40">
      <div className="mx-auto max-w-[1180px]">
        <Sprig className="h-6 w-[200px]" />
        <h1 className="display mt-10 text-[clamp(2.2rem,5vw,4rem)]">The Village</h1>
        <p className="prose-warm mt-5 max-w-[46ch]">
          {MEMBERS.length} people Jessica trusts, across Hampton Roads. Find yours by what you
          need or where you are.
        </p>
        <div className="mt-14">
          <VillageIndex members={MEMBERS} initialCategory={valid} />
        </div>
      </div>
    </section>
  );
}
