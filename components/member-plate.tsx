import Image from "next/image";
import type { Member } from "@/data/members";

/*
  Every member mark is matted on a paper plate.

  Measured fact: all 38 logo files are fully opaque rectangles, 28 of them
  photographs and 5 near-black. They cannot float on paper as cut-out marks, so each
  one is matted inside a fixed optical box with a hairline, same box, same size,
  every member, which is also what keeps the page from visually ranking anyone.

  `fit: "contain"` letterboxes wide wordmarks and tall portraits so nothing is ever
  cropped. 12 of the 38 need it.
*/
export function MemberPlate({
  member,
  sizes = "(max-width: 640px) 40vw, 220px",
  priority = false,
  className = "",
}: {
  member: Member;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-paper-lift ring-1 ring-brass/25 ${className}`}
    >
      {member.image ? (
        <Image
          src={member.image}
          alt={`${member.title} logo`}
          fill
          sizes={sizes}
          priority={priority}
          className={
            member.fit === "contain"
              ? "object-contain p-4 transition-transform duration-[1100ms] ease-out group-hover:scale-[1.03]"
              : "object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
          }
        />
      ) : (
        <Initials title={member.title} />
      )}
      <span className="pointer-events-none absolute inset-0 ring-1 ring-transparent transition-[box-shadow] duration-700 group-hover:ring-bell/45" />
    </div>
  );
}

function Initials({ title }: { title: string }) {
  const letters = title
    .replace(/^The\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-paper-deep">
      <span className="display text-[clamp(1.8rem,4vw,2.6rem)] text-sage-deep/70">{letters}</span>
    </span>
  );
}
