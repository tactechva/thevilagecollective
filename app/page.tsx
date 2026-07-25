import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { MEMBERS, SEASONS, CATEGORIES } from "@/data/members";
import { SeasonTiles } from "@/components/season-tiles";
import { buildTiles } from "@/lib/tiles";
import { Reveal } from "@/components/reveal";
import { MemberCard } from "@/components/member-card";

export default function HomePage() {
  const tiles = buildTiles(SEASONS, MEMBERS);
  const strip = MEMBERS.filter((m) => m.image);
  /*
    Three of Jessica's shortest, punchiest personal notes. Chosen deliberately:
    her dad, her attorney, her dog walker — proof the vouching is real and spans
    everything from the sentimental to the mundane.
  */
  const NOTE_SLUGS = [
    "amir-electric-inc",
    "babcock-moore-lambert-plc",
    "the-dogfather-s-dog-walking-llc",
  ];
  const notes = NOTE_SLUGS.map((s) => MEMBERS.find((m) => m.slug === s)).filter(
    (m): m is NonNullable<typeof m> => Boolean(m?.jessNote),
  );

  return (
    <>
      {/* ── Hero. Editorial split: type left, the mark right. 3 text elements. ── */}
      <section className="relative flex min-h-[100dvh] items-center px-6 pt-24 pb-16 sm:px-10">
        <div className="mx-auto grid w-full max-w-[1180px] items-center gap-14 lg:grid-cols-[1.32fr_1fr]">
          <div>
            {/*
              Two spans rather than a hard <br>: they wrap naturally on a phone
              and split to exactly two lines from sm up. A forced break orphaned
              the word "Life" on its own line at 375px.
            */}
            <h1 className="t-display t-hero">
              <span className="sm:block">Every Season of Life</span>{" "}
              <span className="sm:block">Deserves a Village</span>
            </h1>

            <p className="mt-8 max-w-[46ch] text-[15.5px] leading-[1.7] text-ink-soft sm:text-[16.5px]">
              A curated circle of trusted local businesses across Hampton Roads, gathered by the
              people who actually use them.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="#seasons"
                className="group flex items-center gap-3 rounded-full bg-ink py-2.5 pr-2.5 pl-6 text-[12.5px] tracking-[0.12em] text-paper uppercase transition-all duration-700 ease-drift hover:bg-bluebell-deep active:scale-[0.985]"
              >
                Find Your Season
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/15 transition-all duration-700 ease-drift group-hover:translate-x-0.5 group-hover:scale-105">
                  <ArrowRightIcon size={13} weight="light" />
                </span>
              </Link>

              <Link
                href="/village"
                className="rounded-full border border-brass/40 px-6 py-3 text-[12.5px] tracking-[0.12em] text-ink uppercase transition-all duration-700 ease-drift hover:border-bluebell hover:text-bluebell-deep active:scale-[0.985]"
              >
                Browse All {MEMBERS.length}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-[24rem] lg:max-w-none">
            <Image
              src="/tvc-mark-keyed.png"
              alt="The Village Collective monogram — an open olive wreath around the letters T V C, with a brass key and forget-me-nots"
              width={744}
              height={675}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* ── The real village, moving. One marquee per page, and this is it. ── */}
      <section aria-label="Members of The Village Collective" className="border-y border-brass/20 py-8">
        <div className="marquee relative overflow-hidden">
          <div className="marquee-track flex w-max gap-3">
            {[...strip, ...strip].map((m, i) => (
              <Link
                key={`${m.slug}-${i}`}
                href={`/village/${m.slug}`}
                aria-hidden={i >= strip.length}
                tabIndex={i >= strip.length ? -1 : 0}
                className="group relative block h-[74px] w-[74px] shrink-0 overflow-hidden border border-brass/20 bg-paper-raised sm:h-[86px] sm:w-[86px]"
                title={m.title}
              >
                <Image
                  src={m.image as string}
                  alt={i < strip.length ? m.title : ""}
                  fill
                  sizes="86px"
                  className={`${
                    m.fit === "contain" ? "object-contain p-2" : "object-cover"
                  } opacity-90 transition-all duration-700 ease-drift group-hover:scale-105 group-hover:opacity-100`}
                />
              </Link>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-paper to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-paper to-transparent" />
        </div>
      </section>

      {/* ── Seasons. The front door. All eight visible at once. ── */}
      <section id="seasons" className="scroll-mt-24 px-6 py-28 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <p className="text-[11px] tracking-[0.22em] text-ink-faint uppercase">Start here</p>
            <h2 className="t-display t-section mt-5 max-w-[24ch]">
              Tell us where you are. We&rsquo;ll tell you who to call.
            </h2>
            <p className="mt-6 max-w-[54ch] text-[15px] leading-[1.7] text-ink-soft">
              Life doesn&rsquo;t happen one service at a time. Pick the season you&rsquo;re in and
              the village gathers around it.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-14">
            <SeasonTiles tiles={tiles} />
          </Reveal>
        </div>
      </section>

      {/* ──
        Why any of this is trustworthy: Jessica vouches personally, with receipts.
        Three short notes in her own voice — the thing no review site can copy.
        Set in the script face so her voice is unmistakably separate from the
        neutral editorial bios.

        Note: her dedication to Paige Stone lives on the Covenant Daycare page,
        where she put it. That one is hers to relocate, not ours.
      ── */}
      {notes.length > 0 && (
        <section className="px-6 pb-28 sm:px-10 sm:pb-36">
          <div className="mx-auto max-w-[1180px]">
            <div className="rule-brass" />
            <Reveal className="pt-16">
              <p className="t-script text-center text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.2]">
                Why I&rsquo;d send you to them
              </p>
            </Reveal>

            <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
              {notes.map((m, i) => (
                <Reveal key={m.slug} delay={i * 0.08}>
                  <figure className="flex h-full flex-col">
                    <blockquote className="text-[15.5px] leading-[1.72] text-ink">
                      {m.jessNote}
                    </blockquote>
                    <figcaption className="mt-auto pt-6">
                      <Link
                        href={`/village/${m.slug}`}
                        className="group inline-flex items-baseline gap-2"
                      >
                        <span className="t-display text-[17px] transition-colors duration-500 ease-drift group-hover:text-bluebell-deep">
                          {m.title}
                        </span>
                        <ArrowUpRightIcon
                          size={11}
                          weight="light"
                          className="shrink-0 text-ink-faint transition-all duration-700 ease-drift group-hover:-translate-y-px group-hover:text-bluebell"
                        />
                      </Link>
                      <p className="mt-1 text-[12px] text-ink-faint">{m.tagline}</p>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by category. Different layout family: index list, not cards. ── */}
      <section className="border-t border-brass/20 px-6 py-28 sm:px-10 sm:py-36">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <h2 className="t-display t-section max-w-[16ch]">Or just tell us what you need.</h2>
            <p className="mt-6 max-w-[42ch] text-[15px] leading-[1.7] text-ink-soft">
              Nine kinds of help, {MEMBERS.length} people who do it well. Everything here is free
              to browse.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="border-t border-brass/20">
              {CATEGORIES.map((c) => {
                const n = MEMBERS.filter((m) => m.categories.includes(c.slug)).length;
                return (
                  <li key={c.slug} className="border-b border-brass/20">
                    <Link
                      href={`/village?c=${c.slug}`}
                      className="group flex items-baseline justify-between gap-6 py-5 transition-colors duration-500 ease-drift"
                    >
                      <span className="t-display text-[clamp(1.3rem,2.1vw,1.75rem)] transition-all duration-700 ease-drift group-hover:translate-x-1.5 group-hover:text-bluebell-deep">
                        {c.label}
                      </span>
                      <span className="shrink-0 text-[11.5px] tracking-[0.14em] text-ink-faint tabular-nums">
                        {String(n).padStart(2, "0")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── A few of them, as real cards. Bless This Mess leads, per Jessica. ── */}
      <section className="px-6 pb-28 sm:px-10 sm:pb-36">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="t-display t-section max-w-[20ch]">Some of the village.</h2>
            <Link
              href="/village"
              className="group flex items-center gap-2 text-[11.5px] tracking-[0.16em] text-ink uppercase transition-colors duration-500 ease-drift hover:text-bluebell-deep"
            >
              See everyone
              <ArrowRightIcon
                size={13}
                weight="light"
                className="transition-transform duration-700 ease-drift group-hover:translate-x-1"
              />
            </Link>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {MEMBERS.slice(0, 4).map((m, i) => (
              <Reveal key={m.slug} delay={i * 0.07}>
                <MemberCard member={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
