"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import type { Tile } from "@/lib/tiles";

/*
  The seasons are the front door, and all eight are visible at once — no quiz,
  no gate, no wizard. You see every life moment and pick the one you're in.

  Each tile lists the real businesses inside it, like a table of contents. Names
  are legible and informative in a way a 56px logo never is, and it answers the
  only question that matters here: who's actually in this?

  Cinematic behaviour: hovering one tile makes the others recede — depth from
  attention rather than decoration.
*/
export function SeasonTiles({ tiles }: { tiles: Tile[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div
      className="grid gap-px border border-brass/20 bg-brass/20 sm:grid-cols-2 lg:grid-cols-4"
      onMouseLeave={() => setActive(null)}
    >
      {tiles.map((t) => {
        const dimmed = active !== null && active !== t.slug;
        const rest = t.count - t.names.length;

        return (
          <Link
            key={t.slug}
            href={`/seasons/${t.slug}`}
            onMouseEnter={() => setActive(t.slug)}
            onFocus={() => setActive(t.slug)}
            onBlur={() => setActive(null)}
            className="group relative flex flex-col bg-paper p-6 transition-[opacity,filter] duration-[850ms] ease-drift focus-visible:outline-none sm:p-7"
            style={{ filter: dimmed ? "saturate(0.4)" : "none", opacity: dimmed ? 0.52 : 1 }}
          >
            {/* min-h holds two lines so one- and two-line titles stay on a shared baseline */}
            <h3 className="t-display text-[clamp(1.5rem,2vw,1.9rem)] leading-[1.04] transition-colors duration-[850ms] ease-drift group-hover:text-bluebell-deep sm:min-h-[2.08em]">
              {t.label}
            </h3>

            <p className="mt-3 text-[13px] leading-[1.55] text-ink-soft">{t.blurb}</p>

            <div className="rule-brass my-6" />

            <ul className="space-y-1.5">
              {t.names.map((n) => (
                <li key={n} className="truncate text-[12.5px] leading-[1.4] text-ink-soft">
                  {n}
                </li>
              ))}
              {rest > 0 && (
                <li className="text-[12.5px] leading-[1.4] text-ink-faint">
                  and {rest} more
                </li>
              )}
            </ul>

            <div className="mt-auto flex items-center gap-2 pt-7 text-[10.5px] tracking-[0.16em] uppercase">
              <span className="text-ink-faint tabular-nums">{t.count} in your village</span>
              <ArrowRightIcon
                size={12}
                weight="light"
                className="text-bluebell opacity-0 transition-all duration-[850ms] ease-drift group-hover:translate-x-1 group-hover:opacity-100"
              />
            </div>

            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-bluebell transition-transform duration-[850ms] ease-drift group-hover:scale-x-100" />
          </Link>
        );
      })}
    </div>
  );
}
