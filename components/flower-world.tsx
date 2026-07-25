"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";

type Season = { slug: string; label: string; blurb: string; count: number };

const SAGE = "#848460";
const SAGE_DEEP = "#545430";
const SAGE_PALE = "#a3a385";
const BLUE = "#6090c0";
const BLUE_DEEP = "#3e6fa6";
const POLLEN = "#e8c55a";
const BRASS = "#a89060";

/*
  ══════════════════════════════════════════════════════════════════════
  THE FLOWER WORLD

  Scroll does not move the page past sections. Scroll SCRUBS A TIMELINE:
  a single pinned stage that you travel down through, while a garden grows
  around you in parallax layers.

  Three depths, moving at different rates, so it reads as space rather than
  a page: pale foliage far behind, the stem and its blooms in the middle
  (where the content lives), and big leaves sweeping past in front.

  Every season of life is one bloom on the stem. It opens as you reach it
  and closes behind you. The label beside it is real DOM text — legible,
  selectable, crawlable — never baked into the artwork.

  Everything is transform and opacity only, so the whole world is GPU work
  and holds frame rate on a phone.
  ══════════════════════════════════════════════════════════════════════
*/

const ROW = 62; /* vh of travel per season */

export function FlowerWorld({ seasons }: { seasons: Season[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const n = seasons.length;

  const { scrollYProgress } = useScroll({ target: ref });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 34, mass: 0.35 });

  /* ── the journey: the world slides up beneath a fixed viewport ── */
  const travel = useTransform(p, [0.14, 0.93], [18, -(n - 1) * ROW - 6]);
  const worldY = useTransform(travel, (v) => `${v}vh`);

  /* parallax: far layer barely moves, near layer races */
  const farY = useTransform(p, [0, 1], ["6vh", "-34vh"]);
  const nearY = useTransform(p, [0, 1], ["24vh", "-150vh"]);
  const nearRot = useTransform(p, [0, 1], [-4, 9]);

  /* ── act one: the mark, holding the screen, then receding ── */
  const markScale = useTransform(p, [0, 0.13], [1, 0.62]);
  const markY = useTransform(p, [0, 0.13], ["0vh", "-26vh"]);
  const markOpacity = useTransform(p, [0, 0.09, 0.13], [1, 1, 0]);
  const titleOpacity = useTransform(p, [0, 0.06, 0.11], [1, 1, 0]);
  const titleY = useTransform(p, [0, 0.11], ["0vh", "-9vh"]);
  const hintOpacity = useTransform(p, [0, 0.035], [1, 0]);

  /* ── act three: the closing line, as the garden thins out ── */
  const outroOpacity = useTransform(p, [0.9, 0.96], [0, 1]);
  const outroY = useTransform(p, [0.9, 1], ["6vh", "0vh"]);

  /* Reduced motion: no travel, no pinning — a plain readable list. */
  if (reduce) {
    return <StaticSeasons seasons={seasons} />;
  }

  return (
    <div ref={ref} style={{ height: `${n * ROW + 190}vh` }} className="relative">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* ─── light on paper ─── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 85% at 62% 18%, #faf9f1 0%, #f2f1e6 46%, #e8e7d7 100%)",
          }}
        />

        {/* ─── depth 1: far foliage, almost still ─── */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ y: farY }}>
          <FarFoliage />
        </motion.div>

        {/*
          ─── depth 2: the stem and its blooms — the content layer ───
          The stem and every bloom share one column (RAIL wide) inside the same
          centred container, so the blooms genuinely sit ON the vine instead of
          floating beside it.
        */}
        <motion.div className="absolute inset-x-0 top-0" style={{ y: worldY }}>
          <div className="relative mx-auto max-w-[1180px] px-6 sm:px-10">
            <Stem count={n} rowVh={ROW} p={p} />
            {seasons.map((s, i) => (
              <BloomStation key={s.slug} season={s} index={i} total={n} p={p} />
            ))}
          </div>
        </motion.div>

        {/* ─── depth 3: near leaves sweeping past the camera ─── */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ y: nearY, rotate: nearRot }}
        >
          <NearLeaves />
        </motion.div>

        {/* ─── act one, over the top ─── */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.div style={{ scale: markScale, y: markY, opacity: markOpacity }}>
            <OpeningBloom />
          </motion.div>
          <motion.div
            className="mt-6 text-center"
            style={{ opacity: titleOpacity, y: titleY }}
          >
            <h1 className="display text-[clamp(2.2rem,5.6vw,4.6rem)] leading-[1.02]">
              Every season of life
              <br />
              deserves a <span className="text-bell-deep">village</span>
            </h1>
            <p className="prose-warm mx-auto mt-5 max-w-[42ch] text-[15px]">
              Thirty-nine local businesses across Hampton Roads, gathered by a woman who
              knows exactly who to call.
            </p>
          </motion.div>

          <motion.p
            className="eyebrow absolute bottom-10 left-1/2 -translate-x-1/2"
            style={{ opacity: hintOpacity }}
          >
            Scroll to walk the village
          </motion.p>
        </div>

        {/* ─── the last thing you see in the world ─── */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
          style={{ opacity: outroOpacity, y: outroY }}
        >
          <div className="pointer-events-auto text-center">
            <p className="hand text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.15]">
              No one should have to
              <br />
              navigate a season alone.
            </p>
            <Link
              href="/village"
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[13px] tracking-[0.06em] text-paper transition-colors duration-500 hover:bg-bell-deep"
            >
              Meet all 39 &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* width of the shared vine column — the stem and every bloom live here */
const RAIL = 128;

/* ── the stem: one continuous vine down the whole world, drawing as you go ── */
function Stem({ count, rowVh, p }: { count: number; rowVh: number; p: MotionValue<number> }) {
  const seg = 1000; /* svg units per station */
  const H = count * seg;
  const mid = RAIL / 2;
  const amp = RAIL * 0.3; /* gentle wobble, small enough that blooms stay on it */

  const d =
    `M${mid} 0 ` +
    Array.from({ length: count }, (_, i) => {
      const y = i * seg;
      const bend = i % 2 === 0 ? amp : -amp;
      return `C ${mid + bend} ${y + seg * 0.3}, ${mid - bend} ${y + seg * 0.7}, ${mid} ${y + seg}`;
    }).join(" ");

  const draw = useTransform(p, [0.12, 0.9], [0, 1]);

  return (
    <svg
      viewBox={`0 0 ${RAIL} ${H}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-0 left-6 overflow-visible sm:left-10"
      style={{ width: RAIL, height: `${count * rowVh}vh` }}
      aria-hidden="true"
    >
      <motion.path
        d={d}
        fill="none"
        stroke={SAGE}
        strokeWidth="22"
        strokeOpacity="0.14"
        strokeLinecap="round"
        style={{ pathLength: draw }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={SAGE_DEEP}
        strokeWidth="6"
        strokeLinecap="round"
        style={{ pathLength: draw }}
      />
    </svg>
  );
}

/* ── one season: a bloom that opens as you arrive, with legible text beside it ── */
function BloomStation({
  season,
  index,
  total,
  p,
}: {
  season: Season;
  index: number;
  total: number;
  p: MotionValue<number>;
}) {
  /* where on the timeline this station sits */
  const at = 0.14 + ((index + 0.5) / total) * 0.76;
  const w = 0.42 / total;

  const open = useTransform(p, [at - w * 2.4, at - w * 0.2, at + w * 1.6, at + w * 3], [0, 1, 1, 0]);
  const petal = useTransform(p, [at - w * 2.4, at - w * 0.1], [0.1, 1]);
  const spin = useTransform(p, [at - w * 2.4, at + w * 3], [-70, 26]);
  const slide = useTransform(p, [at - w * 2.4, at + w * 3], [42, -42]);

  return (
    <div
      className="absolute inset-x-0 flex items-center"
      style={{ top: `${index * ROW + ROW / 2}vh`, height: `${ROW}vh`, marginTop: `-${ROW / 2}vh` }}
    >
      <div className="flex w-full items-center gap-6 sm:gap-10">
        {/* the bloom sits in the vine column, centred on the stem */}
        <motion.div
          className="flex shrink-0 items-center justify-center"
          style={{ width: RAIL, scale: petal, rotate: spin, opacity: open }}
        >
          <BigBloom />
        </motion.div>

        <motion.div style={{ opacity: open, x: slide }} className="min-w-0 flex-1">
          <Link href={`/seasons/${season.slug}`} className="group block">
            <p className="eyebrow">
              {String(index + 1).padStart(2, "0")} &nbsp;·&nbsp; {season.count} in your village
            </p>
            <h2 className="display mt-3 text-[clamp(2rem,5vw,4rem)] leading-[1.02] transition-colors duration-500 group-hover:text-bell-deep">
              {season.label}
            </h2>
            <p className="prose-warm mt-4 max-w-[34ch] text-[14.5px]">{season.blurb}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-[12.5px] text-bell-deep">
              Who you&rsquo;d call
              <span className="transition-transform duration-500 group-hover:translate-x-1">&rarr;</span>
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/* ── artwork ─────────────────────────────────────────────────────────── */

function Petals({ r = 1, cx = 60, cy = 60 }: { r?: number; cx?: number; cy?: number }) {
  return (
    <>
      {[0, 72, 144, 216, 288].map((deg, j) => (
        <ellipse
          key={deg}
          cx={cx}
          cy={cy - 26 * r}
          rx={18 * r}
          ry={23 * r}
          fill={j % 2 === 0 ? BLUE : BLUE_DEEP}
          fillOpacity={j % 2 === 0 ? 0.96 : 0.82}
          transform={`rotate(${deg} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={9 * r} fill={POLLEN} />
      <circle cx={cx} cy={cy} r={3.6 * r} fill="#fff" fillOpacity="0.55" />
    </>
  );
}

function BigBloom() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-[16vw] max-h-[130px] min-h-[62px] w-[16vw] max-w-[130px] min-w-[62px] overflow-visible"
      aria-hidden="true"
    >
      <Petals />
    </svg>
  );
}

/*
  The arrival. Her real monogram is the hero — it is a genuine piece of illustration
  and not ours to redraw badly. What we author is the motion around it: a brass halo
  drawing open (her wreath never closes) and forget-me-nots blooming at the base.
*/
function OpeningBloom() {
  const reduce = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="relative h-[min(64vw,340px)] w-[min(64vw,340px)]">
      <svg viewBox="0 0 340 340" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <motion.path
          d="M64 258 C 6 200, 12 96, 88 46 C 160 -2, 262 14, 306 84 C 332 126, 332 182, 306 222"
          fill="none"
          stroke={BRASS}
          strokeWidth="1.6"
          strokeOpacity="0.55"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 2.4, delay: reduce ? 0 : 0.25, ease }}
        />
        {[
          { cx: 252, cy: 272, r: 0.9 },
          { cx: 296, cy: 246, r: 0.62 },
          { cx: 226, cy: 306, r: 0.52 },
        ].map((b, i) => (
          <motion.g
            key={i}
            initial={{ scale: reduce ? 1 : 0, opacity: 0, rotate: reduce ? 0 : -60 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: reduce ? 0.2 : 1, delay: reduce ? 0 : 1.6 + i * 0.16, ease }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <Petals r={b.r} cx={b.cx} cy={b.cy} />
          </motion.g>
        ))}
      </svg>

      <motion.img
        src="/tvc-mark-keyed.png"
        alt="The Village Collective — an open olive wreath around the letters T V C, with a brass key and forget-me-nots"
        width={744}
        height={675}
        className="absolute inset-0 m-auto block h-auto w-[86%]"
        initial={{ opacity: 0, scale: reduce ? 1 : 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0.2 : 1.9, delay: reduce ? 0 : 0.4, ease }}
      />
    </div>
  );
}

function FarFoliage() {
  const sprigs = [
    { x: 4, y: 8, s: 1.5, r: -12 },
    { x: 78, y: 4, s: 1.9, r: 14 },
    { x: 62, y: 62, s: 1.3, r: -8 },
    { x: 12, y: 70, s: 1.7, r: 22 },
    { x: 88, y: 40, s: 1.1, r: -20 },
    { x: 34, y: 88, s: 1.4, r: 10 },
  ];
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {sprigs.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y}) rotate(${f.r}) scale(${f.s})`} opacity="0.2">
          <path d="M0 0 C 5 4, 8 10, 7 17" stroke={SAGE_PALE} strokeWidth="0.5" fill="none" />
          {[0, 1, 2, 3].map((k) => (
            <ellipse
              key={k}
              cx={1.6 + k * 1.7}
              cy={2 + k * 4}
              rx="2.6"
              ry="1.3"
              fill={SAGE_PALE}
              transform={`rotate(${k % 2 ? 30 : -30} ${1.6 + k * 1.7} ${2 + k * 4})`}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

/*
  Foreground leaves. Kept deliberately faint and small: this layer exists to give
  the world depth as it slides past, not to compete with the content. It uses
  meet (not none) so the artwork never stretches into blobs.
*/
function NearLeaves() {
  const leaves = [
    { x: 2, y: 14, s: 1.5, r: 24, o: 0.16 },
    { x: 88, y: 30, s: 1.8, r: -34, o: 0.13 },
    { x: 6, y: 78, s: 1.6, r: -12, o: 0.15 },
    { x: 94, y: 86, s: 1.3, r: 40, o: 0.12 },
  ];
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`} opacity={l.o}>
          <path d="M0 0 C 6 -5, 13 -2, 12 5 C 6 9, 1 6, 0 0 Z" fill={i % 2 ? SAGE : SAGE_DEEP} />
          <path d="M0 0 C 5 1, 9 3, 12 5" stroke="#f2f1e6" strokeWidth="0.3" fill="none" opacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

/* ── reduced-motion / no-JS path: the same content, plainly ── */
function StaticSeasons({ seasons }: { seasons: Season[] }) {
  return (
    <section className="px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-[1180px]">
        <h1 className="display text-[clamp(2.2rem,5vw,4rem)] leading-[1.04]">
          Every season of life deserves a <span className="text-bell-deep">village</span>
        </h1>
        <p className="prose-warm mt-6 max-w-[46ch]">
          Thirty-nine local businesses across Hampton Roads, gathered by a woman who knows
          exactly who to call.
        </p>
        <ol className="mt-14 border-t border-brass/20">
          {seasons.map((s, i) => (
            <li key={s.slug} className="border-b border-brass/20">
              <Link href={`/seasons/${s.slug}`} className="group flex items-baseline gap-5 py-6">
                <span className="eyebrow shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="display block text-[clamp(1.5rem,3vw,2.2rem)] transition-colors duration-500 group-hover:text-bell-deep">
                    {s.label}
                  </span>
                  <span className="prose-warm mt-1.5 block text-[14px]">{s.blurb}</span>
                </span>
                <span className="shrink-0 text-[12px] text-ink-faint tabular-nums">{s.count}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
