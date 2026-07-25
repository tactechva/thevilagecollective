import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  InstagramLogoIcon,
  FacebookLogoIcon,
  GlobeSimpleIcon,
  MapPinIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  MEMBERS,
  CATEGORIES,
  SEASONS,
  SERVICE_MODEL_LABEL,
  bySlug,
  type Member,
} from "@/data/members";
import { MemberMark } from "@/components/member-mark";
import { MemberCard } from "@/components/member-card";
import { Reveal } from "@/components/reveal";

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
    description: `${m.tagline} — ${m.serviceArea}. In The Village Collective, a curated circle of trusted local businesses across Hampton Roads.`,
    openGraph: {
      title: m.title,
      description: m.tagline,
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
  ).slice(0, 3);

  return (
    <>
      <article className="px-6 pt-32 sm:px-10 sm:pt-40">
        <div className="mx-auto max-w-[1180px]">
          <Link
            href="/village"
            className="group inline-flex items-center gap-2 text-[11.5px] tracking-[0.16em] text-ink-faint uppercase transition-colors duration-500 ease-drift hover:text-ink"
          >
            <ArrowLeftIcon
              size={12}
              weight="light"
              className="transition-transform duration-700 ease-drift group-hover:-translate-x-1"
            />
            The Village
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
            {/* The mark, on its own plate. Never cropped. */}
            <div className="relative aspect-4/3 w-full overflow-hidden border border-brass/25 bg-paper-raised lg:sticky lg:top-28 lg:self-start">
              <MemberMark member={m} sizes="(max-width: 1024px) 92vw, 460px" priority />
            </div>

            <div>
              <h1 className="t-display text-[clamp(2.1rem,4.4vw,3.5rem)] leading-[1.02]">
                {m.title}
              </h1>
              <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.6] text-ink-soft">
                {m.tagline}
              </p>

              {/* Fit, not rank: how they serve you and where. */}
              <dl className="mt-9 grid gap-px border border-brass/20 bg-brass/20 sm:grid-cols-2">
                <div className="bg-paper p-5">
                  <dt className="flex items-center gap-2 text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
                    <UsersThreeIcon size={13} weight="light" />
                    How it works
                  </dt>
                  <dd className="mt-2.5 text-[15px] text-ink">
                    {SERVICE_MODEL_LABEL[m.serviceModel]}
                  </dd>
                </div>
                <div className="bg-paper p-5">
                  <dt className="flex items-center gap-2 text-[10.5px] tracking-[0.18em] text-ink-faint uppercase">
                    <MapPinIcon size={13} weight="light" />
                    Where
                  </dt>
                  <dd className="mt-2.5 text-[15px] text-ink">{m.serviceArea}</dd>
                </div>
              </dl>

              <ContactRow member={m} />

              {/* The bio Jessica wrote that her current site never shows. */}
              <div className="mt-12">
                <div className="rule-brass" />
                <div className="mt-8 space-y-5 text-[15.5px] leading-[1.78] text-ink-soft">
                  {m.bio
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                </div>
              </div>

              {/* Her voice, visually unmistakable from the editorial bio above. */}
              {m.jessNote && (
                <aside className="mt-12 border-l-2 border-bluebell/45 bg-putty/25 py-7 pr-6 pl-6 sm:pl-8">
                  <p className="t-script text-[clamp(1.6rem,2.6vw,2.1rem)] leading-[1.2] text-ink">
                    From Jess
                  </p>
                  <p className="mt-4 text-[15.5px] leading-[1.75] text-ink">{m.jessNote}</p>
                </aside>
              )}

              {(cats.length > 0 || seasons.length > 0) && (
                <div className="mt-12 flex flex-wrap gap-2">
                  {cats.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/village?c=${c.slug}`}
                      className="rounded-full border border-brass/30 px-4 py-2 text-[11.5px] text-ink-soft transition-all duration-700 ease-drift hover:border-bluebell hover:text-bluebell-deep"
                    >
                      {c.label}
                    </Link>
                  ))}
                  {seasons.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/seasons/${s.slug}`}
                      className="rounded-full border border-bluebell/35 px-4 py-2 text-[11.5px] text-bluebell-deep transition-all duration-700 ease-drift hover:border-bluebell hover:bg-bluebell/8"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}

              {m.areaConfidence === "I" && (
                <p className="mt-10 text-[11.5px] leading-relaxed text-ink-faint">
                  Service details drawn from {m.title}&rsquo;s own description. Something changed?{" "}
                  <Link
                    href="/about"
                    className="underline decoration-brass/40 underline-offset-2 transition-colors duration-500 ease-drift hover:text-bluebell"
                  >
                    Let us know
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </article>

      {alongside.length > 0 && (
        <section className="mt-28 border-t border-brass/20 px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-[1180px]">
            <Reveal>
              <h2 className="t-display text-[clamp(1.5rem,2.6vw,2.1rem)]">
                Also in the village
              </h2>
              <p className="mt-3 max-w-[48ch] text-[14px] leading-relaxed text-ink-soft">
                Different people, different ways of working. Pick whoever fits your week.
              </p>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {alongside.map((o, i) => (
                <Reveal key={o.slug} delay={i * 0.07}>
                  <MemberCard member={o} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/*
  Contact actions, ordered by what actually reaches this person. 9 members have no
  website and 8 have no phone, so the row adapts rather than rendering dead links.
  Every one of the 39 has at least one working channel.
*/
function ContactRow({ member: m }: { member: Member }) {
  const tel = m.phone ? `tel:${m.phone.replace(/[^\d+]/g, "")}` : null;

  const actions = [
    m.website && { href: m.website, label: "Visit site", Icon: GlobeSimpleIcon, primary: true },
    tel && { href: tel, label: m.phone as string, Icon: PhoneIcon, primary: !m.website },
    m.instagram && { href: m.instagram, label: "Instagram", Icon: InstagramLogoIcon },
    m.facebook && {
      href: m.facebook,
      label: m.facebookIsGroup ? "Facebook group" : "Facebook",
      Icon: FacebookLogoIcon,
    },
    m.email && { href: `mailto:${m.email}`, label: "Email", Icon: EnvelopeSimpleIcon },
  ].filter(Boolean) as {
    href: string;
    label: string;
    Icon: typeof PhoneIcon;
    primary?: boolean;
  }[];

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2.5">
      {actions.map(({ href, label, Icon, primary }) => {
        const external = href.startsWith("http");
        return (
          <a
            key={href}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`group flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[12.5px] tracking-[0.06em] transition-all duration-700 ease-drift active:scale-[0.985] ${
              primary
                ? "bg-ink text-paper hover:bg-bluebell-deep"
                : "border border-brass/35 text-ink-soft hover:border-bluebell hover:text-bluebell-deep"
            }`}
          >
            <Icon size={14} weight="light" />
            {label}
            {external && (
              <ArrowUpRightIcon
                size={10}
                weight="light"
                className="transition-transform duration-700 ease-drift group-hover:-translate-y-px group-hover:translate-x-px"
              />
            )}
          </a>
        );
      })}
    </div>
  );
}
