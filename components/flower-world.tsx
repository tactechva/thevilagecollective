"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
const SAGE_PALE = "#a9a98d";
const BLUE = "#6090c0";
const BLUE_DEEP = "#3e6fa6";
const POLLEN = "#e8c55a";
const BRASS = "#a89060";

/*
  ══════════════════════════════════════════════════════════════════════════
  THE FLOWER WORLD

  Not sections stacked in a column, and not a vertical elevator. This is ONE
  continuous garden laid out across a wide 2D field, and scroll drives a CAMERA
  that flies through it — panning sideways and diagonally, pushing in and pulling
  back out, banking a few degrees as it turns.

  Every station sits at its own coordinate in that field, connected by a single
  vine that winds through all of them. Because the vine is continuous and the
  camera moves through space, beats DISSOLVE into one another — the next bloom is
  already visible, out of focus and off to the side, while you are still reading
  the current one. Nothing ever cuts.

  Camera model: outer element owns scale + rotate, inner element owns translate.
  A station at world (x, y) lands dead centre when the camera translates to
  (-x, -y). All motion is transform and opacity, so the whole world is GPU work.
  ══════════════════════════════════════════════════════════════════════════
*/

/* Where each station sits in the field. A wandering path, never a column. */
const STATIONS: { x: number; y: number; rot: number }[] = [
  { x: 0, y: 0, rot: 0 },
  { x: 1520, y: 560, rot: -2.5 },
  { x: 360, y: 1240, rot: 2 },
  { x: 1880, y: 1860, rot: -1.5 },
  { x: 620, y: 2600, rot: 2.8 },
  { x: 2180, y: 3120, rot: -2 },
  { x: 480, y: 3820, rot: 1.6 },
  { x: 1760, y: 4460, rot: -2.2 },
];

/* smooth cubic path through the field, so the vine reads as one plant */
function vinePath(pts: { x: number; y: number }[]) {
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lat = i % 2 === 0 ? 0.34 : -0.34; /* alternate the bow so it snakes */
    const c1x = a.x + dx * 0.18 - dy * lat * 0.34;
    const c1y = a.y + dy * 0.42 + dx * lat * 0.18;
    const c2x = b.x - dx * 0.18 + dy * lat * 0.34;
    const c2y = b.y - dy * 0.42 - dx * lat * 0.18;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
  }
  return d;
}

const FIELD_W = 2900;
const FIELD_H = 4900;
const VINE = vinePath(STATIONS);

export function FlowerWorld({ seasons }: { seasons: Season[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const n = Math.min(seasons.length, STATIONS.length);

  /* the field is wider than a phone, so fit the camera to the viewport */
  const [fit, setFit] = useState(0.72);
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      setFit(Math.max(0.4, Math.min(1.15, w / 1500)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.4 });

  /*
    The camera keyframes. Between stations the camera pulls BACK (so you see the
    field and the vine ahead) and at each station it pushes IN. That in-and-out is
    what makes it feel like flying rather than sliding.
  */
  const intro = 0.1;
  const outro = 0.94;
  const stops = Array.from({ length: n }, (_, i) => intro + ((i + 0.5) / n) * (outro - intro));
  const mids = Array.from({ length: n - 1 }, (_, i) => (stops[i] + stops[i + 1]) / 2);

  /* interleave station stops and the mid-points between them */
  const keys: number[] = [0];
  const xs: number[] = [-STATIONS[0].x];
  const ys: number[] = [-STATIONS[0].y];
  const zs: number[] = [1.42];
  const rs: number[] = [0];

  for (let i = 0; i < n; i++) {
    keys.push(stops[i]);
    xs.push(-STATIONS[i].x);
    ys.push(-STATIONS[i].y);
    zs.push(1.28); /* push in close at each station */
    rs.push(STATIONS[i].rot);

    if (i < n - 1) {
      const a = STATIONS[i];
      const b = STATIONS[i + 1];
      keys.push(mids[i]);
      /* drift off the straight line so the turn arcs */
      xs.push(-((a.x + b.x) / 2 + (i % 2 === 0 ? 190 : -190)));
      ys.push(-((a.y + b.y) / 2));
      zs.push(0.6); /* pull way back between stations — you see the field */
      rs.push((a.rot + b.rot) / 2 + (i % 2 === 0 ? -3.5 : 3.5));
    }
  }
  keys.push(1);
  xs.push(-STATIONS[n - 1].x - 240);
  ys.push(-STATIONS[n - 1].y - 380);
  zs.push(1.72);
  rs.push(rs[rs.length - 1] + 2);

  const camX = useTransform(p, keys, xs);
  const camY = useTransform(p, keys, ys);
  const camZraw = useTransform(p, keys, zs);
  const camZ = useTransform(camZraw, (z) => z * fit);
  const camR = useTransform(p, keys, rs);

  /* the vine draws itself just ahead of the camera */
  const draw = useTransform(p, [intro * 0.5, outro], [0.06, 1]);

  /* act one, over the top of the world */
  const titleOpacity = useTransform(p, [0, 0.045, 0.085], [1, 1, 0]);
  const titleY = useTransform(p, [0, 0.085], ["0vh", "-7vh"]);
  const hint = useTransform(p, [0, 0.03], [1, 0]);
  const outroOpacity = useTransform(p, [0.955, 0.99], [0, 1]);

  if (reduce) return <StaticSeasons seasons={seasons} />;

  return (
    <div ref={ref} style={{ height: `${n * 118 + 150}vh` }} className="relative">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* light on paper, drifting very slightly with the camera */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 80% at 58% 26%, #fbfaf2 0%, #f2f1e6 44%, #e6e5d5 100%)",
          }}
        />

        {/* ── the camera ────────────────────────────────────────────── */}
        <motion.div
          className="absolute top-1/2 left-1/2"
          style={{ scale: camZ, rotate: camR, transformOrigin: "50% 50%" }}
        >
          <motion.div className="relative" style={{ x: camX, y: camY }}>
            {/* the one continuous vine through the whole field */}
            <svg
              width={FIELD_W}
              height={FIELD_H}
              viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
              className="pointer-events-none absolute overflow-visible"
              style={{ left: -20, top: -20 }}
              aria-hidden="true"
            >
              <motion.path
                d={VINE}
                fill="none"
                stroke={SAGE}
                strokeWidth="34"
                strokeOpacity="0.13"
                strokeLinecap="round"
                style={{ pathLength: draw }}
              />
              <motion.path
                d={VINE}
                fill="none"
                stroke={SAGE_DEEP}
                strokeWidth="8"
                strokeLinecap="round"
                style={{ pathLength: draw }}
              />
              <FieldFoliage />
            </svg>

            {seasons.slice(0, n).map((s, i) => (
              <Station
                key={s.slug}
                season={s}
                at={stops[i]}
                index={i}
                pos={STATIONS[i]}
                p={p}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* ── arrival, over the world ── */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6">
          <motion.div className="text-center" style={{ opacity: titleOpacity, y: titleY }}>
            <Opening />
            <h1 className="display mt-6 text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.02]">
              Every season of life
              <br />
              deserves a <span className="text-bell-deep">village</span>
            </h1>
            <p className="prose-warm mx-auto mt-5 max-w-[40ch] text-[15px]">
              Thirty-nine local businesses across Hampton Roads, gathered by a woman who
              knows exactly who to call.
            </p>
          </motion.div>

          <motion.p
            className="eyebrow absolute bottom-9 left-1/2 -translate-x-1/2"
            style={{ opacity: hint }}
          >
            Scroll to fly through the village
          </motion.p>
        </div>

        {/* ── the last thing you see ── */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
          style={{ opacity: outroOpacity }}
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

        {/* drifting petals, so the world is alive even when you stop */}
        <Drift />
      </div>
    </div>
  );
}

/*
  One season, at its own coordinate in the field.

  It fades and scales through a WIDE window either side of its stop, so the
  previous and next stations are still on screen — softly, off-centre, slightly
  smaller — while you read this one. That overlap is what dissolves the beats
  into each other instead of stacking them.
*/
function Station({
  season,
  at,
  index,
  pos,
  p,
}: {
  season: Season;
  at: number;
  index: number;
  pos: { x: number; y: number; rot: number };
  p: MotionValue<number>;
}) {
  const w = 0.1;
  const opacity = useTransform(
    p,
    [at - w * 1.9, at - w * 0.45, at + w * 0.45, at + w * 1.9],
    [0, 1, 1, 0.06],
  );
  const scale = useTransform(p, [at - w * 1.9, at, at + w * 1.9], [0.86, 1, 1.1]);
  const bloomSpin = useTransform(p, [at - w * 2, at + w * 2], [-90, 40]);
  const bloomScale = useTransform(p, [at - w * 1.6, at - w * 0.2], [0.15, 1]);
  const textX = useTransform(p, [at - w * 1.6, at + w * 1.6], [70, -70]);

  const flip = index % 2 === 1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: pos.x,
        top: pos.y,
        translateX: "-50%",
        translateY: "-50%",
        opacity,
        scale,
        rotate: -pos.rot, /* counter the camera bank so text stays level */
      }}
    >
      <div
        className={`flex w-[min(88vw,1000px)] items-center gap-10 ${
          flip ? "flex-row-reverse text-right" : ""
        }`}
      >
        <motion.div
          className="shrink-0"
          style={{ rotate: bloomSpin, scale: bloomScale, transformOrigin: "50% 50%" }}
        >
          <Bloom />
        </motion.div>

        <motion.div className="min-w-0 flex-1" style={{ x: textX }}>
          <Link href={`/seasons/${season.slug}`} className="group block">
            <p className="eyebrow">
              {String(index + 1).padStart(2, "0")} &nbsp;·&nbsp; {season.count} in your village
            </p>
            <h2 className="display mt-3 text-[clamp(2.1rem,5.4vw,4.2rem)] leading-[1.01] transition-colors duration-500 group-hover:text-bell-deep">
              {season.label}
            </h2>
            <p
              className={`prose-warm mt-4 max-w-[34ch] text-[15px] ${flip ? "ml-auto" : ""}`}
            >
              {season.blurb}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-[13px] text-bell-deep">
              Who you&rsquo;d call
              <span className="transition-transform duration-500 group-hover:translate-x-1">
                &rarr;
              </span>
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
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
      <circle cx={cx} cy={cy} r={3.6 * r} fill="#fff" fillOpacity="0.5" />
    </>
  );
}

function Bloom() {
  return (
    <svg viewBox="0 0 120 120" className="h-[124px] w-[124px] overflow-visible sm:h-[168px] sm:w-[168px]" aria-hidden="true">
      <Petals />
    </svg>
  );
}

function Opening() {
  const reduce = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;
  return (
    <div className="relative mx-auto h-[min(56vw,290px)] w-[min(56vw,290px)]">
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <motion.path
          d="M56 228 C 4 176, 10 84, 78 40 C 142 -4, 232 12, 272 74 C 296 112, 296 162, 272 200"
          fill="none"
          stroke={BRASS}
          strokeWidth="1.5"
          strokeOpacity="0.55"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 2.3, delay: reduce ? 0 : 0.25, ease }}
        />
        {[
          { cx: 224, cy: 242, r: 0.82 },
          { cx: 262, cy: 218, r: 0.56 },
          { cx: 200, cy: 272, r: 0.46 },
        ].map((b, i) => (
          <motion.g
            key={i}
            initial={{ scale: reduce ? 1 : 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0.2 : 0.95, delay: reduce ? 0 : 1.5 + i * 0.15, ease }}
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
        className="absolute inset-0 m-auto block h-auto w-[84%]"
        initial={{ opacity: 0, scale: reduce ? 1 : 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0.2 : 1.8, delay: reduce ? 0 : 0.35, ease }}
      />
    </div>
  );
}

/* leaves and buds scattered along the vine, inside the field's own SVG */
function FieldFoliage() {
  const items = STATIONS.flatMap((s, i) =>
    Array.from({ length: 5 }, (_, k) => {
      const t = (k + 1) / 6;
      const nx = STATIONS[Math.min(i + 1, STATIONS.length - 1)].x;
      const ny = STATIONS[Math.min(i + 1, STATIONS.length - 1)].y;
      return {
        x: s.x + (nx - s.x) * t + (k % 2 ? 120 : -140),
        y: s.y + (ny - s.y) * t + (k % 2 ? -70 : 90),
        r: (i * 47 + k * 71) % 360,
        sc: 1 + ((i + k) % 3) * 0.35,
        dark: (i + k) % 2 === 0,
      };
    }),
  );

  return (
    <g aria-hidden="true">
      {items.map((f, i) => (
        <g
          key={i}
          transform={`translate(${f.x} ${f.y}) rotate(${f.r}) scale(${f.sc})`}
          opacity={f.dark ? 0.5 : 0.32}
        >
          <path d="M0 0 C 22 -18, 48 -8, 46 18 C 22 32, 3 22, 0 0 Z" fill={f.dark ? SAGE : SAGE_PALE} />
          <path d="M0 0 C 18 4, 34 10, 46 18" stroke="#f2f1e6" strokeWidth="1.4" fill="none" opacity="0.45" />
        </g>
      ))}
    </g>
  );
}

/* ambient petals drifting across the frame — pure CSS, never scroll-bound */
function Drift() {
  const petals = [
    { l: "8%", d: 0, dur: 26, s: 0.5 },
    { l: "27%", d: 6, dur: 33, s: 0.34 },
    { l: "52%", d: 12, dur: 29, s: 0.44 },
    { l: "71%", d: 3, dur: 37, s: 0.28 },
    { l: "88%", d: 17, dur: 31, s: 0.4 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="drift-petal absolute -top-24"
          style={{
            left: p.l,
            animationDelay: `-${p.d}s`,
            animationDuration: `${p.dur}s`,
          }}
        >
          <svg viewBox="0 0 120 120" style={{ width: 120 * p.s, height: 120 * p.s }}>
            <Petals />
          </svg>
        </span>
      ))}
    </div>
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
