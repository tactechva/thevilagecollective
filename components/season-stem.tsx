"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

type Season = { slug: string; label: string; blurb: string; count: number };

/*
  The eight seasons of life, as eight blooms on one stem that draws itself down the
  page as you read. Not a grid of boxes — a plant.

  The stem is a single SVG path whose pathLength is tied to scroll. Each bloom opens
  when the stem reaches it, and its label is plain legible text sitting beside it, so
  the flourish never costs clarity. All eight labels are visible the whole time.
*/
export function SeasonStem({ seasons }: { seasons: Season[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 78%", "end 55%"] });
  const grow = useSpring(scrollYProgress, { stiffness: 80, damping: 28, mass: 0.4 });
  const drawn = useTransform(grow, (v) => (reduce ? 1 : v));

  const n = seasons.length;
  const ROW = 148;
  const H = ROW * n;

  /* one hand-drawn S-curving stem down the full column */
  const stem = Array.from({ length: n }, (_, i) => {
    const y = i * ROW;
    const bend = i % 2 === 0 ? 34 : -34;
    return `C ${34 + bend} ${y + ROW * 0.35}, ${34 - bend} ${y + ROW * 0.7}, 34 ${y + ROW}`;
  }).join(" ");
  const d = `M34 0 ${stem}`;

  return (
    <div ref={ref} className="relative">
      {/* the stem, drawn behind the labels */}
      <svg
        viewBox={`0 0 68 ${H}`}
        width="68"
        height={H}
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <motion.path
          d={d}
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth="5"
          strokeOpacity="0.2"
          strokeLinecap="round"
          style={{ pathLength: drawn }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke="var(--color-sage-deep)"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ pathLength: drawn }}
        />
      </svg>

      <ol className="relative">
        {seasons.map((s, i) => (
          <SeasonRow
            key={s.slug}
            season={s}
            index={i}
            total={n}
            rowHeight={ROW}
            grow={grow}
            reduce={reduce}
          />
        ))}
      </ol>
    </div>
  );
}

function SeasonRow({
  season,
  index,
  total,
  rowHeight,
  grow,
  reduce,
}: {
  season: Season;
  index: number;
  total: number;
  rowHeight: number;
  grow: ReturnType<typeof useSpring>;
  reduce: boolean | null;
}) {
  const at = (index + 0.35) / total;
  const t = useTransform(grow, [at - 0.06, at + 0.04], [0, 1], { clamp: true });
  const open = useTransform(t, (v) => (reduce ? 1 : v));
  const rot = useTransform(t, [0, 1], [-55, 0]);
  const lift = useTransform(t, [0, 1], [14, 0]);

  return (
    <li style={{ height: rowHeight }} className="relative">
      <Link
        href={`/seasons/${season.slug}`}
        className="group flex h-full items-center gap-6 pl-[4.5rem] sm:gap-10 sm:pl-24"
      >
        {/* the bloom, sitting on the stem */}
        <motion.span
          className="absolute left-[34px] flex -translate-x-1/2 items-center justify-center"
          style={{ scale: open, opacity: open, rotate: reduce ? 0 : rot }}
          aria-hidden="true"
        >
          <svg width="46" height="46" viewBox="0 0 46 46" className="overflow-visible">
            <g className="origin-center transition-transform duration-700 ease-out group-hover:scale-115">
              {[0, 72, 144, 216, 288].map((deg, j) => (
                <ellipse
                  key={deg}
                  cx="23"
                  cy="11.5"
                  rx="7.4"
                  ry="9.2"
                  fill={j % 2 === 0 ? "var(--color-bell)" : "var(--color-bell-deep)"}
                  fillOpacity={j % 2 === 0 ? 0.95 : 0.8}
                  transform={`rotate(${deg} 23 23)`}
                />
              ))}
              <circle cx="23" cy="23" r="4.1" fill="var(--color-pollen)" />
              <circle cx="23" cy="23" r="1.7" fill="#fff" fillOpacity="0.5" />
            </g>
          </svg>
        </motion.span>

        <motion.span
          className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-5 gap-y-1"
          style={{ opacity: open, y: reduce ? 0 : lift }}
        >
          <span className="display text-[clamp(1.7rem,3.1vw,2.6rem)] leading-[1.05] transition-colors duration-500 group-hover:text-bell-deep">
            {season.label}
          </span>
          <span className="prose-warm max-w-[38ch] text-[13.5px] leading-[1.5]">
            {season.blurb}
          </span>
        </motion.span>

        <motion.span
          className="shrink-0 text-[11px] tracking-[0.16em] text-ink-faint uppercase tabular-nums"
          style={{ opacity: open }}
        >
          {season.count}
        </motion.span>
      </Link>
    </li>
  );
}
