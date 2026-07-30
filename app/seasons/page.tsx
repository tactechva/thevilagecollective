import type { Metadata } from "next";
import Link from "next/link";
import { MEMBERS, SEASONS } from "@/data/members";
import { Sprig, ForgetMeNot } from "@/components/floral";
import { OG_BASE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Seasons",
  description:
    "Life doesn't happen one service at a time. Find the people you need for the season you're actually in.",
  alternates: { canonical: "/seasons" },
  openGraph: { ...OG_BASE, url: "/seasons", title: "Seasons" },
};

export default function SeasonsPage() {
  return (
    <section className="px-6 pt-32 pb-8 sm:px-10 sm:pt-40">
      <div className="mx-auto max-w-[1180px]">
        <Sprig className="h-6 w-[200px]" />
        <h1 className="display mt-10 text-[clamp(2.2rem,5vw,4rem)]">Seasons</h1>
        <p className="prose-warm mt-5 max-w-[52ch]">
          A family buying a home needs a realtor, a cleaner, and a roofer. New parents need
          something else entirely. Start where you actually are.
        </p>

        <ol className="mt-16 border-t border-brass/20">
          {SEASONS.map((s, i) => {
            const n = MEMBERS.filter((m) => m.seasons.includes(s.slug)).length;
            return (
              <li key={s.slug} className="border-b border-brass/20">
                <Link href={`/seasons/${s.slug}`} className="group flex items-center gap-5 py-7 sm:gap-8">
                  <span className="shrink-0 opacity-40 transition-opacity duration-500 group-hover:opacity-100">
                    <ForgetMeNot size={26} delay={i * 0.04} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block text-[clamp(1.6rem,3.2vw,2.5rem)] leading-[1.05] transition-colors duration-500 group-hover:text-bell-deep">
                      {s.label}
                    </span>
                    <span className="prose-warm mt-1.5 block max-w-[46ch] text-[14px]">{s.blurb}</span>
                  </span>
                  <span className="eyebrow shrink-0 tabular-nums">{n}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
