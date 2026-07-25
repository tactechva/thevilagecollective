import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { MEMBERS, SEASONS, SERVICE_MODEL_LABEL, inSeason } from "@/data/members";
import { MemberMark } from "@/components/member-mark";
import { Reveal } from "@/components/reveal";

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
          className="group inline-flex items-center gap-2 text-[11.5px] tracking-[0.16em] text-ink-faint uppercase transition-colors duration-500 ease-drift hover:text-ink"
        >
          <ArrowLeftIcon
            size={12}
            weight="light"
            className="transition-transform duration-700 ease-drift group-hover:-translate-x-1"
          />
          All seasons
        </Link>

        <header className="mt-10 max-w-[36ch]">
          <h1 className="t-display text-[clamp(2.3rem,5vw,4.1rem)] leading-[1]">{season.label}</h1>
          <p className="mt-6 text-[16px] leading-[1.65] text-ink-soft">{season.blurb}</p>
          <p className="mt-5 text-[11.5px] tracking-[0.16em] text-ink-faint uppercase">
            {members.length} in your village
          </p>
        </header>

        {/*
          Editorial index rather than a card grid — a season is a reading list of
          people, and this layout family is used nowhere else on the site.
        */}
        <ol className="mt-16 border-t border-brass/20">
          {members.map((m, i) => (
            <li key={m.slug} className="border-b border-brass/20">
              <Reveal delay={Math.min(i * 0.05, 0.4)}>
                <Link
                  href={`/village/${m.slug}`}
                  className="group grid items-center gap-5 py-6 sm:grid-cols-[auto_1fr_auto] sm:gap-8"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden border border-brass/20 bg-paper-raised sm:h-[88px] sm:w-[88px]">
                    <MemberMark member={m} sizes="88px" priority={i < 4} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="t-display text-[clamp(1.35rem,2.3vw,1.85rem)] leading-[1.06] transition-colors duration-500 ease-drift group-hover:text-bluebell-deep">
                      {m.title}
                    </h2>
                    <p className="mt-2 max-w-[52ch] text-[13.5px] leading-[1.55] text-ink-soft">
                      {m.tagline}
                    </p>
                    <p className="mt-2.5 text-[11px] tracking-[0.13em] text-ink-faint uppercase">
                      {SERVICE_MODEL_LABEL[m.serviceModel]} &middot; {m.serviceArea}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-soft transition-all duration-700 ease-drift group-hover:bg-bluebell group-hover:text-paper sm:flex"
                  >
                    <ArrowRightIcon size={13} weight="light" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-brass/20 pt-10">
          <p className="max-w-[40ch] text-[14px] leading-relaxed text-ink-soft">
            In more than one season at once? Most people are.
          </p>
          <Link
            href={`/seasons/${next.slug}`}
            className="group flex items-center gap-3 text-[12px] tracking-[0.14em] text-ink uppercase transition-colors duration-500 ease-drift hover:text-bluebell-deep"
          >
            Next: {next.label}
            <ArrowRightIcon
              size={13}
              weight="light"
              className="transition-transform duration-700 ease-drift group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
