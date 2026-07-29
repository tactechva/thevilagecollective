import type { Metadata } from "next";
import Link from "next/link";
import { MEMBERS } from "@/data/members";
import { MemberPlate } from "@/components/member-plate";
import { Sprig, ForgetMeNot } from "@/components/floral";

export const metadata: Metadata = {
  title: "Jess",
  description:
    "The Village Collective grew from years of serving families through Bless This Mess Cleaning, and one question that kept coming up: who do you trust?",
};

/* Every word on this page is Jessica's own, from her site. Nothing rewritten. */

export default function AboutPage() {
  const marks = MEMBERS.filter((m) => m.image);

  return (
    <>
      <section className="px-6 pt-32 pb-16 sm:px-10 sm:pt-40">
        <div className="mx-auto max-w-[1180px]">
          <Sprig className="h-6 w-[200px]" />
          <h1 className="display mt-10 max-w-[22ch] text-[clamp(2.3rem,5.4vw,4.4rem)] leading-[1.02]">
            Building more than a cleaning company
          </h1>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10">
        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">Our story</p>
            <div className="prose-warm mt-7 space-y-6">
              <p className="text-[18px] text-ink">
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
                spend less time wondering who to call and more time focusing on what matters most,
                and you can explore every recommendation completely free.
              </p>
            </div>
          </div>

          {/* The village itself as the visual: every real member mark. */}
          <div className="bg-putty/35 p-6 sm:p-8">
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
              {marks.map((m) => (
                <Link key={m.slug} href={`/village/${m.slug}`} title={m.title} className="group">
                  <MemberPlate member={m} sizes="90px" className="aspect-square" />
                </Link>
              ))}
            </div>
            <p className="eyebrow mt-6">{MEMBERS.length} businesses &middot; Hampton Roads</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-[70ch]">
          <p className="eyebrow">Built through real relationships</p>
          <h2 className="display mt-5 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.06]">
            How the village began
          </h2>
          <div className="prose-warm mt-8 space-y-6">
            <p>
              The Village Collective grew from years of serving families through Bless This Mess
              Cleaning. As we worked in homes across Hampton Roads, one question came up again and
              again: <strong>&ldquo;Who do you trust?&rdquo;</strong> Families weren&rsquo;t just
              looking for recommendations, they wanted names we would confidently give our own
              friends and family.
            </p>
            <p>Over time, those recommendations became more than referrals. They became a village.</p>
            <p>
              Today, that same spirit of helping people has grown into The Village Collective, a
              place built on relationships, recommendations, and the belief that no one should have
              to navigate life&rsquo;s seasons alone.
            </p>
            <p className="display text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.25] text-ink">
              Because every season of life deserves a village.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <ForgetMeNot size={22} />
                <p className="hand text-[clamp(2rem,3.6vw,2.8rem)] leading-[1.15]">
                  A letter from Jess
                </p>
              </div>
              <div className="prose-warm mt-8 space-y-5">
                <p>
                  I&rsquo;m a wife, a mom of three boys, and someone who believes the smallest act
                  of kindness often makes the biggest difference.
                </p>
                <p>
                  I&rsquo;ve always been drawn to building relationships, creating order out of
                  chaos, and helping people feel supported during life&rsquo;s busiest seasons.
                  Whether thats through a clean home, a thoughtful recommendation, or simply
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
              <p className="hand mt-8 text-[clamp(1.7rem,2.6vw,2.2rem)] leading-[1.3] text-ink">
                Love,
                <br />
                Jess
              </p>
            </div>

            <div className="lg:pt-16">
              <h2 className="display text-[clamp(1.4rem,2.4vw,1.9rem)]">
                What you&rsquo;ll find here
              </h2>
              <div className="prose-warm mt-7 space-y-6">
                <p>
                  This isn&rsquo;t a place to scroll through endless listings or wonder who you can
                  trust.
                </p>
                <p className="display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.2] text-ink">
                  It&rsquo;s a place to start.
                </p>
                <p>
                  Whether you&rsquo;re planning something exciting, facing something unexpected, or
                  simply trying to make life a little easier, my hope is that you&rsquo;ll leave
                  here feeling more confident than when you arrived.
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
                  className="rounded-full bg-ink px-7 py-3.5 text-[13px] text-paper transition-colors duration-500 hover:bg-bell-deep"
                >
                  Find your season
                </Link>
                <Link
                  href="/village"
                  className="rounded-full px-6 py-3.5 text-[13px] text-ink-soft ring-1 ring-brass/40 transition-colors duration-500 hover:text-bell-deep hover:ring-bell"
                >
                  See all {MEMBERS.length}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
