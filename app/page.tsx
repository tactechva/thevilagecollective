import Link from "next/link";
import { MEMBERS, SEASONS, CATEGORIES } from "@/data/members";
import { FlowerWorld } from "@/components/flower-world";
import { Sprig, ForgetMeNot } from "@/components/floral";
import { MemberPlate } from "@/components/member-plate";

export default function Home() {
  const seasons = SEASONS.map((s) => ({
    slug: s.slug,
    label: s.label,
    blurb: s.blurb,
    count: MEMBERS.filter((m) => m.seasons.includes(s.slug)).length,
  }));

  /* Jessica's own notes, verbatim, her dad, her attorney, her dog walker. */
  const voices = ["amir-electric-inc", "babcock-moore-lambert-plc", "the-dogfather-s-dog-walking-llc"]
    .map((s) => MEMBERS.find((m) => m.slug === s))
    .filter((m): m is NonNullable<typeof m> => Boolean(m?.jessNote));

  const strip = MEMBERS.filter((m) => m.image).slice(0, 12);

  return (
    <>
      {/* You travel down through the garden; the seasons bloom as you reach them. */}
      <FlowerWorld seasons={seasons} />

      {/* ─────────── Out of the world, onto the page ─────────── */}
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-[1280px]">
          <Sprig className="h-6 w-[220px]" />
          <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <p className="display text-[clamp(1.8rem,3.4vw,2.9rem)] leading-[1.12]">
              Her clients kept asking the same question.
            </p>
            <div className="prose-warm max-w-[58ch] space-y-5">
              <p>
                Jessica cleans houses. Routine, deep, move-out. Which means she is inside them,
                on the good weeks and the hard ones.
              </p>
              <p>
                <strong>&ldquo;Who do you trust?&rdquo;</strong> Families weren&rsquo;t looking for
                a search result. They wanted the names she&rsquo;d give her own family.
              </p>
              <p>
                Those answers became a list. The list became thirty-nine businesses across
                Hampton Roads: an electrician, a doula, a lawyer, a bakery, a dog walker, a
                glass shop. Free to browse, none of them ranked, every one of them hers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Her voice, verbatim ─────────── */}
      {voices.length > 0 && (
        <section className="px-6 py-20 sm:px-10 sm:py-28">
          <div className="mx-auto max-w-[1280px]">
            <p className="hand text-center text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.15]">
              Why I&rsquo;d send you to them
            </p>
            <div className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-3">
              {voices.map((m) => (
                <figure key={m.slug} className="flex flex-col">
                  <ForgetMeNot size={22} />
                  <blockquote className="mt-5 text-[15.5px] leading-[1.7] text-ink">
                    {m.jessNote}
                  </blockquote>
                  <figcaption className="mt-auto pt-6">
                    <Link
                      href={`/village/${m.slug}`}
                      className="display text-[19px] transition-colors duration-500 hover:text-bell-deep"
                    >
                      {m.title}
                    </Link>
                    <p className="mt-1 text-[12.5px] text-ink-faint">{m.tagline}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── What you need ─────────── */}
      <section className="px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">Or just tell us what you need</p>
            <h2 className="display mt-5 text-[clamp(1.9rem,3.6vw,3rem)]">Nine kinds of help.</h2>
            <p className="prose-warm mt-6 max-w-[34ch] text-[15px]">
              Everything here is free to browse, and nothing is ranked or sponsored.
            </p>
          </div>

          <ul>
            {CATEGORIES.map((c) => {
              const n = MEMBERS.filter((m) => m.categories.includes(c.slug)).length;
              return (
                <li key={c.slug} className="border-b border-brass/20 first:border-t">
                  <Link
                    href={`/village?c=${c.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-5"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <ForgetMeNot size={12} />
                      </span>
                      <span className="display text-[clamp(1.3rem,2.2vw,1.85rem)] transition-all duration-500 group-hover:translate-x-1 group-hover:text-bell-deep">
                        {c.label}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] text-ink-faint tabular-nums">{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─────────── A look at the village ─────────── */}
      <section className="px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="display text-[clamp(1.9rem,3.6vw,3rem)]">The village, so far.</h2>
            <Link
              href="/village"
              className="group inline-flex items-center gap-2 text-[13px] text-ink-soft transition-colors duration-500 hover:text-bell-deep"
            >
              All {MEMBERS.length}
              <span className="transition-transform duration-500 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
            {strip.map((m) => (
              <Link key={m.slug} href={`/village/${m.slug}`} className="group" title={m.title}>
                <MemberPlate
                  member={m}
                  sizes="(max-width: 640px) 30vw, 180px"
                  className="aspect-square"
                />
                <p className="mt-2.5 truncate text-[11.5px] text-ink-soft transition-colors duration-500 group-hover:text-bell-deep">
                  {m.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
