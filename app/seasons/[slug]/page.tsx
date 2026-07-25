import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SEASONS, SERVICE_MODEL_LABEL, inSeason } from "@/data/members";
import { MemberPlate } from "@/components/member-plate";
import { ForgetMeNot } from "@/components/floral";

export function generateStaticParams() {
  return SEASONS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = SEASONS.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: s.label,
    description: `${s.blurb} ${inSeason(s.slug).length} trusted local businesses in Hampton Roads for this season of life.`,
  };
}

export default async function SeasonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const season = SEASONS.find((s) => s.slug === slug);
  if (!season) notFound();

  const members = inSeason(season.slug);
  const idx = SEASONS.findIndex((s) => s.slug === slug);
  const next = SEASONS[(idx + 1) % SEASONS.length];

  return (
    <section className="px-6 pt-32 pb-8 sm:px-10 sm:pt-40">
      <div className="mx-auto max-w-[1180px]">
        <Link
          href="/seasons"
          className="group inline-flex items-center gap-2 text-[12.5px] text-ink-faint transition-colors duration-500 hover:text-ink"
        >
          <span className="transition-transform duration-500 group-hover:-translate-x-1">&larr;</span>
          All seasons
        </Link>

        <header className="mt-10 flex items-start gap-5">
          <span className="mt-2 shrink-0">
            <ForgetMeNot size={36} />
          </span>
          <div>
            <h1 className="display text-[clamp(2.2rem,5vw,4rem)] leading-[1.01]">{season.label}</h1>
            <p className="prose-warm mt-4 max-w-[42ch] text-[16px]">{season.blurb}</p>
            <p className="eyebrow mt-4">{members.length} in your village</p>
          </div>
        </header>

        <ol className="mt-16 border-t border-brass/20">
          {members.map((m, i) => (
            <li key={m.slug} className="border-b border-brass/20">
              <Link
                href={`/village/${m.slug}`}
                className="group grid grid-cols-[64px_1fr_auto] items-center gap-5 py-5 sm:grid-cols-[88px_1fr_auto] sm:gap-8"
              >
                <MemberPlate member={m} sizes="88px" priority={i < 5} className="aspect-square w-full" />
                <div className="min-w-0">
                  <h2 className="display text-[clamp(1.25rem,2.2vw,1.8rem)] leading-[1.08] transition-colors duration-500 group-hover:text-bell-deep">
                    {m.title}
                  </h2>
                  <p className="prose-warm mt-1 text-[13.5px]">{m.tagline}</p>
                  <p className="eyebrow mt-2">
                    {SERVICE_MODEL_LABEL[m.serviceModel]} · {m.serviceArea}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="text-ink-faint transition-all duration-500 group-hover:translate-x-1 group-hover:text-bell"
                >
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-brass/20 pt-10">
          <p className="prose-warm max-w-[40ch] text-[14px]">
            In more than one season at once? Most people are.
          </p>
          <Link
            href={`/seasons/${next.slug}`}
            className="group inline-flex items-center gap-3 text-[13px] text-ink transition-colors duration-500 hover:text-bell-deep"
          >
            Next: {next.label}
            <span className="transition-transform duration-500 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
