import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { MEMBERS } from "@/data/members";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Village Collective grew from years of serving families through Bless This Mess Cleaning, and one question that kept coming up: who do you trust?",
};

/* All copy on this page is Jessica's own, from her site. Mechanical typos only. */

export default function AboutPage() {
  const marks = MEMBERS.filter((m) => m.image);

  return (
    <>
      {/* Centered hero — allowed here because the message itself is the design. */}
      <section className="px-6 pt-36 pb-20 sm:px-10 sm:pt-44">
        <div className="mx-auto max-w-[1180px]">
          <h1 className="t-display mx-auto max-w-[20ch] text-center text-[clamp(2.4rem,6vw,5rem)] leading-[0.98]">
            Building More Than a Cleaning Company
          </h1>
        </div>
      </section>

      {/* Our Story — split, with the putty block from Jessica's own layout. */}
      <section className="border-t border-brass/20 px-6 py-24 sm:px-10">
        <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="t-display text-[clamp(1.7rem,3vw,2.4rem)]">Our Story</h2>
            <div className="mt-8 space-y-6 text-[16px] leading-[1.78] text-ink-soft">
              <p className="text-ink">
                The Village Collective exists because life doesn&rsquo;t happen one service at a
                time.
              </p>
              <p>
                A family buying a home may need a realtor, a cleaner, a handyman, a photographer,
                and a moving company. New parents need support. Empty nesters need trusted
                professionals. Families facing loss need compassionate help.
              </p>
              <p>
                The Village Collective brings those trusted businesses together in one place so you
                spend less time wondering who to call and more time focusing on what matters most
                &mdash; and you can explore every recommendation completely free.
              </p>
            </div>
          </Reveal>

          {/* The village itself as the visual: every real member mark. */}
          <Reveal delay={0.1}>
            <div className="bg-putty/45 p-6 sm:p-9">
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {marks.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/village/${m.slug}`}
                    title={m.title}
                    className="group relative aspect-square overflow-hidden border border-ink/8 bg-paper-raised"
                  >
                    <Image
                      src={m.image as string}
                      alt={m.title}
                      fill
                      sizes="88px"
                      className={`${
                        m.fit === "contain" ? "object-contain p-1.5" : "object-cover"
                      } transition-transform duration-[900ms] ease-drift group-hover:scale-105`}
                    />
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-[11.5px] tracking-[0.14em] text-ink-soft uppercase">
                {MEMBERS.length} businesses &middot; Hampton Roads
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it began — full-width, single column. Different layout family. */}
      <section className="border-t border-brass/20 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-[1180px]">
          <Reveal className="mx-auto max-w-[66ch]">
            <p className="text-[11px] tracking-[0.22em] text-ink-faint uppercase">
              Built through real relationships
            </p>
            <h2 className="t-display mt-5 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.06]">
              How the village began
            </h2>
            <div className="mt-9 space-y-6 text-[16px] leading-[1.78] text-ink-soft">
              <p>
                The Village Collective grew from years of serving families through Bless This Mess
                Cleaning. As we worked in homes across Hampton Roads, one question came up again and
                again: <strong className="font-normal text-ink">&ldquo;Who do you trust?&rdquo;</strong>{" "}
                Families weren&rsquo;t just looking for recommendations, they wanted names we would
                confidently give our own friends and family.
              </p>
              <p>
                Over time, those recommendations became more than referrals. They became a village.
              </p>
              <p>
                Today, that same spirit of helping people has grown into The Village Collective, a
                place built on relationships, recommendations, and the belief that no one should
                have to navigate life&rsquo;s seasons alone.
              </p>
              <p className="t-display text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.25] text-ink">
                Because every season of life deserves a village.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/*
        Meet Jess — two voices side by side, exactly the split Jessica invented on
        her own site: her letter in the personal register, the mission in the
        editorial one.
      */}
      <section className="border-t border-brass/20 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <h2 className="t-display text-[clamp(1.9rem,3.6vw,2.9rem)]">Meet Jess</h2>
          </Reveal>

          <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="lg:border-r lg:border-brass/20 lg:pr-16">
                <p className="t-script text-[clamp(2.1rem,3.6vw,3rem)] leading-[1.15]">
                  A letter from Jess
                </p>
                <div className="mt-8 space-y-5 text-[15.5px] leading-[1.75] text-ink-soft">
                  <p>
                    I&rsquo;m a wife, a mom of three boys, and someone who believes the smallest act
                    of kindness often makes the biggest difference.
                  </p>
                  <p>
                    I&rsquo;ve always been drawn to building relationships, creating order out of
                    chaos, and helping people feel supported during life&rsquo;s busiest seasons.
                    Whether that&rsquo;s through a clean home, a thoughtful recommendation, or simply
                    connecting someone with the right person, my goal has always been the same: make
                    life feel lighter.
                  </p>
                  <p>
                    Outside of work, you&rsquo;ll usually find me chasing my boys, dreaming up new
                    ideas, drinking entirely too much coffee, and believing that community can change
                    lives.
                  </p>
                  <p className="text-ink">
                    The Village Collective is simply an extension of who I already am.
                  </p>
                  <p className="text-ink">Welcome. I&rsquo;m so glad you&rsquo;re here.</p>
                </div>
                <p className="t-script mt-8 text-[clamp(1.7rem,2.6vw,2.2rem)] leading-[1.3] text-ink">
                  Love,
                  <br />
                  Jess
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h3 className="t-display text-[clamp(1.4rem,2.4vw,1.9rem)]">What you&rsquo;ll find here</h3>
              <div className="mt-8 space-y-6 text-[15.5px] leading-[1.78] text-ink-soft">
                <p>
                  This isn&rsquo;t a place to scroll through endless listings or wonder who you can
                  trust.
                </p>
                <p className="t-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.2] text-ink">
                  It&rsquo;s a place to start.
                </p>
                <p>
                  Whether you&rsquo;re planning something exciting, facing something unexpected, or
                  simply trying to make life a little easier, my hope is that you&rsquo;ll leave here
                  feeling more confident than when you arrived.
                </p>
                <p>
                  If this community saves you time, brings you peace of mind, or introduces you to
                  someone who makes a difference in your life, then it&rsquo;s done exactly what I
                  hoped it would.
                </p>
              </div>

              <div className="mt-11 flex flex-wrap gap-3">
                <Link
                  href="/seasons"
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
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
