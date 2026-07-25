import Image from "next/image";
import type { Member } from "@/data/members";

/*
  Every member mark renders inside a paper plate.

  `fit: "contain"` letterboxes wide wordmarks and tall portraits so they are
  never cropped — this is the single biggest visual defect on the current site
  (12 of 38 logos get chopped there, including Bless This Mess itself).

  One member has no image at all, so we set their initials in the display serif
  rather than leaving a hole.
*/
export function MemberMark({
  member,
  sizes = "(max-width: 768px) 45vw, 300px",
  priority = false,
}: {
  member: Member;
  sizes?: string;
  priority?: boolean;
}) {
  if (!member.image) {
    const initials = member.title
      .replace(/^The\s+/i, "")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    return (
      <div className="flex h-full w-full items-center justify-center bg-paper-deep">
        <span className="t-display text-[clamp(1.9rem,4vw,2.9rem)] text-sage-deep/70">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={member.image}
      alt={`${member.title} logo`}
      fill
      sizes={sizes}
      priority={priority}
      className={
        member.fit === "contain"
          ? "object-contain p-5 transition-transform duration-[900ms] ease-drift group-hover:scale-[1.035]"
          : "object-cover transition-transform duration-[900ms] ease-drift group-hover:scale-[1.045]"
      }
    />
  );
}
