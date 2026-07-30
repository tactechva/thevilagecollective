import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MEMBERS,
  CATEGORIES,
  SEASONS,
  SERVICE_MODEL_LABEL,
  bySlug,
  type Member,
} from "@/data/members";
import { MemberPlate } from "@/components/member-plate";
import { Sprig, ForgetMeNot } from "@/components/floral";
import { OG_BASE } from "@/lib/site";

export function generateStaticParams() {
  return MEMBERS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = bySlug(slug);
  if (!m) return {};
  return {
    title: m.title,
    description: `${m.tagline}. ${m.serviceArea}. In The Village Collective, a curated circle of trusted local businesses across Hampton Roads.`,
    alternates: { canonical: `/village/${m.slug}` },
    openGraph: {
      ...OG_BASE,
      url: `/village/${m.slug}`,
      title: m.title,
      description: m.tagline,
      /* their own mark when they have one, otherwise the site card is inherited */
      images: m.image ? [{ url: m.image }] : undefined,
    },
  };
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = bySlug(slug);
  if (!m) notFound();

  const cats = CATEGORIES.filter((c) => m.categories.includes(c.slug));
  const seasons = SEASONS.filter((s) => m.seasons.includes(s.slug));
  const alongside = MEMBERS.filter(
    (o) => o.slug !== m.slug && o.categories.some((c) => m.categories.includes(c)),
  ).slice(0, 4);

  return (
    <>
      <article className="px-6 pt-32 sm:px-10 sm:pt-40">
        <div className="mx-auto max-w-[1180px]">
          <Link
            href="/village"
            className="group inline-flex items-center gap-2 text-[12.5px] text-ink-faint transition-colors duration-500 hover:text-ink"
          >
            <span className="transition-transform duration-500 group-hover:-translate-x-1">&larr;</span>
            The Village
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <MemberPlate
              member={m}
              sizes="(max-width: 1024px) 92vw, 440px"
              priority
              className="aspect-4/3 w-full lg:sticky lg:top-28"
            />

            <div>
              <h1 className="display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.03]">{m.title}</h1>
              <p className="prose-warm mt-4 max-w-[46ch] text-[16.5px]">{m.tagline}</p>

              {/* Fit, never rank: how they serve you and where. */}
              <dl className="mt-9 grid gap-6 border-y border-brass/20 py-6 sm:grid-cols-2">
                <div>
                  <dt className="eyebrow">How it works</dt>
                  <dd className="mt-2 text-[15.5px]">{SERVICE_MODEL_LABEL[m.serviceModel]}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Where</dt>
                  <dd className="mt-2 text-[15.5px]">{m.serviceArea}</dd>
                </div>
              </dl>

              <Contact member={m} />

              <div className="prose-warm mt-12 space-y-5">
                {m.bio
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para.trim()}</p>
                  ))}
              </div>

              {/* Her voice, visually unmistakable from the editorial bio above. */}
              {m.jessNote && (
                <aside className="relative mt-12 bg-putty/30 px-6 py-8 sm:px-9">
                  <span className="absolute -top-3 left-6 sm:left-9">
                    <ForgetMeNot size={26} />
                  </span>
                  <p className="hand mt-2 text-[clamp(1.7rem,2.8vw,2.2rem)] leading-[1.15]">
                    From Jess
                  </p>
                  <p className="mt-4 text-[15.5px] leading-[1.75] text-ink">{m.jessNote}</p>
                </aside>
              )}

              {(cats.length > 0 || seasons.length > 0) && (
                <div className="mt-12 flex flex-wrap gap-x-5 gap-y-2.5">
                  {cats.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/village?c=${c.slug}`}
                      className="text-[13px] text-ink-soft underline decoration-brass/40 underline-offset-4 transition-colors duration-500 hover:text-bell-deep"
                    >
                      {c.label}
                    </Link>
                  ))}
                  {seasons.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/seasons/${s.slug}`}
                      className="text-[13px] text-bell-deep underline decoration-bell/40 underline-offset-4 transition-colors duration-500 hover:decoration-bell"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}

              {m.areaConfidence === "I" && (
                <p className="mt-10 text-[11.5px] leading-relaxed text-ink-faint">
                  Service details drawn from {m.title}&rsquo;s own description.
                </p>
              )}
            </div>
          </div>
        </div>
      </article>

      {alongside.length > 0 && (
        <section className="px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-[1180px]">
            <Sprig className="h-6 w-[200px]" />
            <h2 className="display mt-10 text-[clamp(1.5rem,2.6vw,2.1rem)]">Also in the village</h2>
            <p className="prose-warm mt-3 max-w-[48ch] text-[14px]">
              Different people, different ways of working. Pick whoever fits your week.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
              {alongside.map((o) => (
                <Link key={o.slug} href={`/village/${o.slug}`} className="group">
                  <MemberPlate member={o} sizes="(max-width: 640px) 45vw, 220px" className="aspect-square" />
                  <h3 className="display mt-3 text-[16px] leading-[1.15] transition-colors duration-500 group-hover:text-bell-deep">
                    {o.title}
                  </h3>
                  <p className="eyebrow mt-1.5">{SERVICE_MODEL_LABEL[o.serviceModel]}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/*
  Contact actions ordered by what actually reaches this person. 9 members have no
  website and 8 have no phone, so the row adapts instead of rendering dead links.
  Every member has at least one working channel.
*/
function Contact({ member: m }: { member: Member }) {
  const tel = m.phone ? `tel:${m.phone.replace(/[^\d+]/g, "")}` : null;
  const actions = [
    m.website && { href: m.website, label: "Visit their site", primary: true },
    tel && { href: tel, label: m.phone as string, primary: !m.website },
    m.instagram && { href: m.instagram, label: "Instagram" },
    m.facebook && { href: m.facebook, label: m.facebookIsGroup ? "Facebook group" : "Facebook" },
    m.email && { href: `mailto:${m.email}`, label: "Email" },
  ].filter(Boolean) as { href: string; label: string; primary?: boolean }[];

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2.5">
      {actions.map(({ href, label, primary }) => {
        const external = href.startsWith("http");
        return (
          <a
            key={href}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`rounded-full px-6 py-3 text-[13px] transition-colors duration-500 ${
              primary
                ? "bg-ink text-paper hover:bg-bell-deep"
                : "text-ink-soft ring-1 ring-brass/40 hover:text-bell-deep hover:ring-bell"
            }`}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
