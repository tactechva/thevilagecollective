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
  that flies through it, panning sideways and diagonally, pushing in and pulling
  back out, banking a few degrees as it turns.

  Every station sits at its own coordinate in that field, connected by a single
  vine that winds through all of them. Because the vine is continuous and the
  camera moves through space, beats DISSOLVE into one another, the next bloom is
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

/*
  The vine is split into ONE SVG PER SEGMENT rather than a single sheet spanning
  the whole field. A 2900x4900 element inside a scaled ancestor rasterises to
  roughly 3570x6030, which is past the 4096px max texture size on a lot of GPUs
  the layer then renders as nothing at all. Per-segment sheets stay small, and
  each one carries the slice of the draw progress that belongs to it.

  Control points come from a Catmull-Rom spline through ALL the stations, which is
  what makes the segments join smoothly. Bowing each segment on its own put a hard
  V kink at every station, the tangents did not match across the joins.
*/
const TENSION = 5.4;

function controlPoints(i: number) {
  const pts = STATIONS;
  const p0 = pts[Math.max(i - 1, 0)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(i + 2, pts.length - 1)];
  return {
    c1: { x: p1.x + (p2.x - p0.x) / TENSION, y: p1.y + (p2.y - p0.y) / TENSION },
    c2: { x: p2.x - (p3.x - p1.x) / TENSION, y: p2.y - (p3.y - p1.y) / TENSION },
  };
}

const SEGMENTS = STATIONS.slice(0, -1).map((a, i) => {
  const b = STATIONS[i + 1];
  const { c1, c2 } = controlPoints(i);
  const pad = 420; /* control points bow outside the station bounding box */
  const minX = Math.min(a.x, b.x, c1.x, c2.x) - pad;
  const minY = Math.min(a.y, b.y, c1.y, c2.y) - pad;
  const w = Math.max(a.x, b.x, c1.x, c2.x) - minX + pad;
  const h = Math.max(a.y, b.y, c1.y, c2.y) - minY + pad;
  const d = `M${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
  return { i, minX, minY, w, h, d };
});

export function FlowerWorld({ seasons }: { seasons: Season[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const n = Math.min(seasons.length, STATIONS.length);

  /*
    Camera fit. On desktop we scale to the field's width. On a phone we deliberately
    do NOT, fitting a 2900px field into 375px drove station text down to ~17px
    headlines and ~8px body, which is unreadable. Phones stay close and get their
    sense of space from the camera's travel instead of from a wide shot.
  */
  const [fit, setFit] = useState(0.8);
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      setFit(w < 700 ? 0.82 : Math.max(0.7, Math.min(1.15, w / 1500)));
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
  /*
    The camera does NOT start centred on station 0, that put the first station
    directly behind the arrival headline. It starts above and left of it, so the
    title has clean paper, then flies down onto the first bloom.
  */
  const keys: number[] = [0];
  const xs: number[] = [-STATIONS[0].x + 300];
  const ys: number[] = [-STATIONS[0].y + 240];
  const zs: number[] = [1.5];
  const rs: number[] = [-2];

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
      zs.push(0.6); /* pull way back between stations, you see the field */
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


  /*
    The arrival holds until it has finished FORMING, then departs. It used to start
    fading at 0.045 while its own words were still assembling until 0.072, so the
    headline was dissolving before it existed.
  */
  const titleOpacity = useTransform(p, [0, 0.082, 0.118], [1, 1, 0]);
  const titleY = useTransform(p, [0, 0.118], ["0vh", "-8vh"]);
  const hint = useTransform(p, [0, 0.026], [1, 0]);
  const outroOpacity = useTransform(p, [0.955, 0.99], [0, 1]);

  if (reduce) return <StaticSeasons seasons={seasons} />;

  return (
    /* 20% more scroll distance than before, so the flight reads slower per gesture */
    <div ref={ref} style={{ height: `${n * 142 + 180}vh` }} className="relative">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* light on paper, drifting very slightly with the camera */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 80% at 58% 26%, #fbfaf2 0%, #f2f1e6 44%, #e6e5d5 100%)",
          }}
        />

        {/*
          Ambient petals sit BEHIND the camera layer. Rendered on top they drifted
          across the station text and cost legibility.
        */}
        <Drift />

        {/* ── the camera ────────────────────────────────────────────── */}
        <motion.div
          className="absolute top-1/2 left-1/2"
          style={{ scale: camZ, rotate: camR, transformOrigin: "50% 50%" }}
        >
          <motion.div className="relative" style={{ x: camX, y: camY }}>
            {/* the vine, one small sheet per segment, see SEGMENTS above */}
            {SEGMENTS.map((seg) => (
              <VineSegment key={seg.i} seg={seg} total={SEGMENTS.length} p={p} />
            ))}

            {seasons.slice(0, n).map((s, i) => (
              <Station
                key={s.slug}
                season={s}
                at={stops[i]}
                index={i}
                pos={STATIONS[i]}
                p={p}
                gate={0.108}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* ── arrival, over the world ── */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6">
          {/*
            The scroll-driven values stay on the OUTER element. The load-in is a
            separate layer inside it, so the two never fight: the page introduces
            itself once on arrival, then scroll takes over and forms everything.
          */}
          <motion.div className="text-center" style={{ opacity: titleOpacity, y: titleY }}>
            <motion.div
              initial="rest"
              animate="in"
              variants={{
                rest: {},
                in: { transition: { staggerChildren: 0.21, delayChildren: 0.44 } },
              }}
            >
              <LoadIn>
                <FormingWreath />
              </LoadIn>

              {/*
                The whole headline arrives on LOAD, sweeping left to right, rather
                than waiting for scroll. Both lines are one word sequence so the
                sweep carries straight through the line break.
              */}
              <LoadIn>
                <h1 className="display mt-6 text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[1.02]">
                  <SweepHeadline
                    lines={[
                      ["Every", "season", "of", "life"],
                      ["deserves", "a", "village"],
                    ]}
                    accentLastWord
                  />
                </h1>
              </LoadIn>

              <LoadIn>
                <p className="prose-warm mx-auto mt-5 max-w-[40ch] text-[15px]">
                  Thirty-nine local businesses across Hampton Roads, gathered by a woman who
                  knows exactly who to call.
                </p>
              </LoadIn>
            </motion.div>
          </motion.div>

          <motion.p
            className="eyebrow absolute bottom-9 left-1/2 -translate-x-1/2"
            style={{ opacity: hint }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.75, ease: [0.16, 1, 0.3, 1] }}
            >
              Keep scrolling. It grows as you go
            </motion.span>
          </motion.p>
        </div>


        {/* ── the last thing you see ── */}
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
          style={{ opacity: outroOpacity }}
        >
          <div className="pointer-events-auto relative text-center">
            {/* the last station is still fading out under this, so it gets clean ground too */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-24 -inset-y-16"
              style={{
                background:
                  "radial-gradient(64% 58% at 50% 50%, #f2f1e6 0%, #f2f1e6 62%, rgba(242,241,230,0.85) 80%, rgba(242,241,230,0) 100%)",
              }}
            />
            <p className="hand relative text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.15]">
              No one should have to
              <br />
              navigate a season alone.
            </p>
            <Link
              href="/village"
              className="relative mt-9 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[13px] tracking-[0.06em] text-paper transition-colors duration-500 hover:bg-bell-deep"
            >
              Meet all 39 &rarr;
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

/*
  One season, at its own coordinate in the field.

  It fades and scales through a WIDE window either side of its stop, so the
  previous and next stations are still on screen, softly, off-centre, slightly
  smaller, while you read this one. That overlap is what dissolves the beats
  into each other instead of stacking them.
*/
function Station({
  season,
  at,
  index,
  pos,
  p,
  gate,
}: {
  season: Season;
  at: number;
  index: number;
  pos: { x: number; y: number; rot: number };
  p: MotionValue<number>;
  /** No station may appear before this point, it is when the arrival title clears. */
  gate: number;
}) {
  const w = 0.1;
  /*
    Clamped to `gate`. Without it station 0's fade-in window started at a negative
    p, so it was already ~26% visible at scroll zero and collided with the hero.
  */
  const inAt = Math.max(at - w * 1.9, gate);
  /*
    Every later keyframe is derived FROM inAt so the input array is guaranteed
    monotonically increasing. It was not: for station 0 the gate (0.108) exceeded
    `at - w*0.45` (0.1075), which is an invalid useTransform range, Motion
    returned opacity 1 and the first station was fully visible at scroll zero.
  */
  /*
    The full-opacity dwell at a station is 30% longer than it was: hold opens
    earlier and fade starts later, so a card sits legible for noticeably longer
    before the camera carries you on.
  */
  const hold = Math.max(at - w * 0.585, inAt + 0.01);
  /*
    The outgoing tail is short on purpose. With a long tail a station sat at ~0.95
    opacity while the camera had already carried it half off the frame edge, so you
    saw a headline sliced down the middle. It now recedes quickly once you leave,
    while still overlapping the next one enough to dissolve rather than cut.
  */
  const fade = Math.max(at + w * 0.286, hold + 0.01);
  const gone = Math.max(at + w * 0.95, fade + 0.02);

  const opacity = useTransform(p, [inAt, hold, fade, gone], [0, 1, 1, 0.05]);
  const scale = useTransform(p, [inAt, Math.max(at, hold + 0.005), gone], [0.88, 1, 1.06]);
  const textX = useTransform(p, [inAt, gone], [64, -64]);

  const flip = index % 2 === 1;
  const words = season.label.split(" ");

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
      {/*
        Stacked on a phone (bloom above the words, always left-aligned) and only
        side-by-side with the alternating flip from sm up. The flipped right-align
        was cramping text into a narrow column at 375px.
      */}
      <div
        className={`flex w-[min(86vw,1000px)] flex-col items-start gap-5 sm:items-center sm:gap-10 ${
          flip ? "sm:flex-row-reverse sm:text-right" : "sm:flex-row"
        }`}
      >
        {/* the flower opens ONE PETAL AT A TIME as the camera closes on it */}
        <div className="shrink-0">
          <svg
            viewBox="0 0 120 120"
            className="h-[86px] w-[86px] overflow-visible sm:h-[168px] sm:w-[168px]"
            aria-hidden="true"
          >
            <ScrollBloom p={p} cx={60} cy={60} r={1} from={inAt} to={at - w * 0.15} />
          </svg>
        </div>

        {/*
          Text always sits on clean ground. The vine wanders through station
          coordinates by design, so without this the stroke cut straight through
          the words. A feathered paper scrim (no hard edge, so it never reads as a
          box) guarantees legibility over any graphic behind it.
        */}
        <motion.div className="relative z-10 min-w-0 flex-1" style={{ x: textX }}>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-10 -inset-y-8"
            style={{
              background:
                "radial-gradient(70% 60% at 40% 50%, #f2f1e6 0%, #f2f1e6 58%, rgba(242,241,230,0.82) 76%, rgba(242,241,230,0) 100%)",
            }}
          />
          <Link href={`/seasons/${season.slug}`} className="group relative block">
            <p className="eyebrow">
              {String(index + 1).padStart(2, "0")} &nbsp;·&nbsp; {season.count} in your village
            </p>
            <h2 className="display mt-3 text-[clamp(2.1rem,5.4vw,4.2rem)] leading-[1.01] transition-colors duration-500 group-hover:text-bell-deep">
              {/* the name writes itself in as you arrive */}
              <FormingLine p={p} words={words} from={inAt + w * 0.2} to={at - w * 0.1} />
            </h2>
            <p
              className={`prose-warm mt-4 max-w-[34ch] text-[15px] ${flip ? "sm:ml-auto" : ""}`}
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

/*
  One segment of the vine, plus the leaves that belong to it. Each is its own small
  SVG sheet so no single composited layer is oversized, and each draws across the
  slice of scroll between its two stations.
*/
function VineSegment({
  seg,
  total,
  p,
}: {
  seg: { i: number; minX: number; minY: number; w: number; h: number; d: string };
  total: number;
  p: MotionValue<number>;
}) {
  const from = 0.02 + (seg.i / total) * 0.88;
  const to = 0.02 + ((seg.i + 1) / total) * 0.88;
  const draw = useTransform(p, [from, to], [seg.i === 0 ? 0.02 : 0, 1]);

  return (
    <svg
      width={seg.w}
      height={seg.h}
      viewBox={`${seg.minX} ${seg.minY} ${seg.w} ${seg.h}`}
      className="pointer-events-none absolute overflow-visible"
      style={{ left: seg.minX, top: seg.minY }}
      aria-hidden="true"
    >
      <motion.path
        d={seg.d}
        fill="none"
        stroke={SAGE}
        strokeWidth="20"
        strokeOpacity="0.1"
        strokeLinecap="round"
        style={{ pathLength: draw }}
      />
      <motion.path
        d={seg.d}
        fill="none"
        stroke={SAGE_DEEP}
        strokeWidth="8"
        strokeLinecap="round"
        style={{ pathLength: draw }}
      />
      <SegmentLeaves seg={seg} from={from} to={to} p={p} />
    </svg>
  );
}

/* leaves for one segment, unfurling as the vine reaches them */
function SegmentLeaves({
  seg,
  from,
  to,
  p,
}: {
  seg: { i: number; minX: number; minY: number };
  from: number;
  to: number;
  p: MotionValue<number>;
}) {
  const a = STATIONS[seg.i];
  const b = STATIONS[seg.i + 1];
  const leaves = Array.from({ length: 5 }, (_, k) => {
    const t = (k + 1) / 6;
    return {
      x: a.x + (b.x - a.x) * t + (k % 2 ? 110 : -130),
      y: a.y + (b.y - a.y) * t + (k % 2 ? -60 : 80),
      r: (seg.i * 47 + k * 71) % 360,
      sc: 1 + ((seg.i + k) % 3) * 0.35,
      dark: (seg.i + k) % 2 === 0,
      at: from + (to - from) * t,
    };
  });
  return (
    <g>
      {leaves.map((f, i) => (
        <Unfurl key={i} p={p} f={f} />
      ))}
    </g>
  );
}

/*
  The headline sweeping in on load, left to right. Each word carries a small
  negative x so it drifts in from the left as it resolves, and the delay is keyed
  to the word's position across BOTH lines, so the sweep reads as one continuous
  motion through the line break rather than restarting on line two.
*/
function SweepHeadline({
  lines,
  accentLastWord = false,
}: {
  lines: string[][];
  accentLastWord?: boolean;
}) {
  const reduce = useReducedMotion();
  /*
    A single running letter counter across every word and both lines, so the
    spell-out never restarts at a word or a line break. Each word stays an
    inline-block so it can never break mid-word when the line wraps; the letters
    inside it are the things that animate.
  */
  const lastLine = lines.length - 1;
  let n = 0;
  const plan = lines.map((words, li) =>
    words.map((word, wi) => {
      const letters = [...word].map((ch) => ({ ch, delay: n++ * 0.045 }));
      n += 1; /* the space between words costs a beat too, so the rhythm stays even */
      return {
        letters,
        space: wi < words.length - 1,
        accent: accentLastWord && li === lastLine && wi === words.length - 1,
      };
    }),
  );

  return (
    <>
      {plan.map((words, li) => (
        <span className="block" key={li}>
          {words.map((w, wi) => (
            <span
              key={wi}
              className={`inline-block whitespace-nowrap ${w.accent ? "text-bell-deep" : ""}`}
            >
              {w.letters.map(({ ch, delay }, ci) => (
                <motion.span
                  key={ci}
                  className="inline-block"
                  initial={{
                    opacity: 0,
                    y: reduce ? 0 : "0.24em",
                    filter: reduce ? "blur(0px)" : "blur(5px)",
                  }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: reduce ? 0.2 : 0.72,
                    delay: reduce ? 0 : delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {ch}
                </motion.span>
              ))}
              {w.space && <span className="inline-block">&nbsp;</span>}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

/*
  One beat of the arrival's load-in. Rises and settles once on mount, then never
  animates again, so it cannot interfere with the scroll-driven forming inside it.
*/
function LoadIn({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{
        rest: { opacity: 0, y: reduce ? 0 : 20, filter: reduce ? "blur(0px)" : "blur(5px)" },
        in: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: reduce ? 0.2 : 1.35, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── forming primitives: everything below is a function of SCROLL, not time ── */

/** A line of display type that assembles word by word as you scroll. */
function FormingLine({
  p,
  words,
  from,
  to,
  accentLast = false,
}: {
  p: MotionValue<number>;
  words: string[];
  from: number;
  to: number;
  accentLast?: boolean;
}) {
  /*
    Divided by length + 0.4 so the LAST word finishes exactly at `to`. Dividing by
    length alone made each word's end `from + (i+1.4)*step`, which for the final
    word landed past `to`, you arrived at a station before its name had finished
    forming, and the last word sat permanently half-faded.
  */
  const step = (to - from) / (Math.max(words.length, 1) + 0.4);
  return (
    <span className="block">
      {words.map((word, i) => (
        <FormingWord
          key={`${word}-${i}`}
          p={p}
          word={word}
          start={from + i * step}
          end={from + (i + 1.4) * step}
          accent={accentLast && i === words.length - 1}
        />
      ))}
    </span>
  );
}

function FormingWord({
  p,
  word,
  start,
  end,
  accent,
}: {
  p: MotionValue<number>;
  word: string;
  start: number;
  end: number;
  accent?: boolean;
}) {
  const opacity = useTransform(p, [start, end], [0, 1]);
  const y = useTransform(p, [start, end], [26, 0]);
  const blur = useTransform(p, [start, end], [7, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  return (
    <motion.span
      className={`inline-block ${accent ? "text-bell-deep" : ""}`}
      style={{ opacity, y, filter }}
    >
      {word}&nbsp;
    </motion.span>
  );
}

/** One forget-me-not whose five petals open one at a time, on scroll. */
function ScrollBloom({
  p,
  cx,
  cy,
  r,
  from,
  to,
}: {
  p: MotionValue<number>;
  cx: number;
  cy: number;
  r: number;
  from: number;
  to: number;
}) {
  const span = Math.max(to - from, 0.001);
  const step = span / 6;
  const eye = useTransform(p, [from + step * 4, from + step * 6], [0, 1]);
  return (
    <g>
      {[0, 72, 144, 216, 288].map((deg, j) => (
        <ScrollPetal
          key={deg}
          p={p}
          cx={cx}
          cy={cy}
          r={r}
          deg={deg}
          dark={j % 2 !== 0}
          from={from + step * j}
          to={from + step * (j + 1.8)}
        />
      ))}
      <motion.circle
        cx={cx}
        cy={cy}
        r={9 * r}
        fill={POLLEN}
        style={{ scale: eye, opacity: eye, transformBox: "fill-box", transformOrigin: "center" }}
      />
    </g>
  );
}

function ScrollPetal({
  p,
  cx,
  cy,
  r,
  deg,
  dark,
  from,
  to,
}: {
  p: MotionValue<number>;
  cx: number;
  cy: number;
  r: number;
  deg: number;
  dark: boolean;
  from: number;
  to: number;
}) {
  const t = useTransform(p, [from, to], [0, 1]);
  const scale = useTransform(t, [0, 1], [0.06, 1]);
  const rotate = useTransform(t, [0, 1], [deg - 52, deg]);
  /*
    Rotation MUST live in style, not in the SVG transform attribute. Motion writes
    its own transform into style, which overrides the attribute entirely, so with
    rotate as an attribute all five petals rendered unrotated, stacked on top of
    each other, and the flower looked like a single blue oval.

    transformBox:"view-box" + an explicit origin at the flower's centre means both
    the spin and the scale happen about the middle, so the bloom opens outward.
  */
  return (
    <motion.ellipse
      cx={cx}
      cy={cy - 26 * r}
      rx={18 * r}
      ry={23 * r}
      fill={dark ? BLUE_DEEP : BLUE}
      fillOpacity={dark ? 0.82 : 0.96}
      style={{
        scale,
        rotate,
        opacity: t,
        transformBox: "view-box",
        transformOrigin: `${cx}px ${cy}px`,
      }}
    />
  );
}

/*
  The mark on arrival. It loads FULLY: it used to sit at 42% opacity until you
  scrolled, which read as a washed-out logo beside crisp type rather than as
  something deliberately unformed. Her artwork is solid the moment it lands. The
  brass arc and the blooms still build, but on load, in step with the headline.
*/
function FormingWreath() {
  const reduce = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="relative mx-auto h-[min(56vw,290px)] w-[min(56vw,290px)]">
      <svg
        viewBox="0 0 300 300"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <motion.path
          d="M56 228 C 4 176, 10 84, 78 40 C 142 -4, 232 12, 272 74 C 296 112, 296 162, 272 200"
          fill="none"
          stroke={BRASS}
          strokeWidth="1.5"
          strokeOpacity="0.6"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 2.1, ease }}
        />
        {/*
          No added blooms here. Her mark already carries its own forget-me-nots,
          and drawing three more over them piled into a blue blob at the base.
          The arc is the only thing we author around her artwork.
        */}
      </svg>
      <motion.img
        src="/tvc-mark-keyed.png"
        alt="The Village Collective logo: an open olive wreath around the letters T V C, with a brass key and forget-me-nots"
        width={744}
        height={675}
        className="absolute inset-0 m-auto block h-auto w-[84%]"
        initial={{ opacity: 0, scale: reduce ? 1 : 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0.2 : 1.2, delay: reduce ? 0 : 0.1, ease }}
      />
    </div>
  );
}

/* each leaf unfurls from its stem end as the vine reaches it */
function Unfurl({
  p,
  f,
}: {
  p: MotionValue<number>;
  f: { x: number; y: number; r: number; sc: number; dark: boolean; at: number };
}) {
  const t = useTransform(p, [f.at - 0.035, f.at + 0.02], [0, 1]);
  const scale = useTransform(t, (v) => v * f.sc);
  return (
    <motion.g
      transform={`translate(${f.x} ${f.y}) rotate(${f.r})`}
      style={{ scale, opacity: t, transformBox: "fill-box", transformOrigin: "0% 50%" }}
      opacity={f.dark ? 0.5 : 0.32}
    >
      <path d="M0 0 C 22 -18, 48 -8, 46 18 C 22 32, 3 22, 0 0 Z" fill={f.dark ? SAGE : SAGE_PALE} />
      <path d="M0 0 C 18 4, 34 10, 46 18" stroke="#f2f1e6" strokeWidth="1.4" fill="none" opacity="0.45" />
    </motion.g>
  );
}

/* ambient petals drifting across the frame, pure CSS, never scroll-bound */
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
