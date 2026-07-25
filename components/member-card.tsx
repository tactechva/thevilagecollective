import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { SERVICE_MODEL_LABEL, type Member } from "@/data/members";
import { MemberMark } from "@/components/member-mark";

/*
  No ratings. No badges. No "featured." Nothing that ranks one member above
  another — Jessica's own words are "I love them all," and she left the
  Featured column empty on all 39 rows of her export.

  What differentiates instead is FIT: how they serve you and where. Two spray-tan
  artists are not competitors, one comes to you and one has a studio.
*/
export function MemberCard({
  member,
  priority = false,
}: {
  member: Member;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/village/${member.slug}`}
      className="group block focus-visible:outline-none"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-4/3 w-full overflow-hidden border border-brass/20 bg-paper-raised">
          <MemberMark member={member} priority={priority} />
          <div className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-700 ease-drift group-hover:border-bluebell/45" />
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <h3 className="t-display t-card transition-colors duration-500 ease-drift group-hover:text-bluebell-deep">
            {member.title}
          </h3>

          <p className="mt-2.5 text-[13.5px] leading-[1.55] text-ink-soft">{member.tagline}</p>

          <div className="mt-auto flex items-end justify-between gap-4 pt-5">
            <p className="text-[11px] tracking-[0.13em] text-ink-faint uppercase">
              {SERVICE_MODEL_LABEL[member.serviceModel]}
            </p>
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-soft transition-all duration-700 ease-drift group-hover:bg-bluebell group-hover:text-paper"
            >
              <ArrowUpRightIcon size={12} weight="light" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
