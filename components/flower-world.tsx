"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  cubicBezier,
  type MotionValue,
} from "motion/react";
import { spellCount } from "@/lib/spell";

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
  { x: 1180, y: 150, rot: 0 },
  { x: 300, y: 1120, rot: 0 },
  { x: 1400, y: 1860, rot: 0 },
  { x: 420, y: 2650, rot: 0 },
  { x: 1520, y: 3370, rot: 0 },
  { x: 360, y: 4100, rot: 0 },
  { x: 1300, y: 4820, rot: 0 },
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
  /*
    The opening segment is written BACKWARDS, from b to a. Geometry is identical,
    but pathLength then grows from the far end, so the branch enters from the
    right of the screen and sweeps left beneath the arrival instead of crawling
    away to the right.
  */
  const d =
    i === 0
      ? `M${b.x} ${b.y} C ${c2.x} ${c2.y}, ${c1.x} ${c1.y}, ${a.x} ${a.y}`
      : `M${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
  return { i, minX, minY, w, h, d };
});

/*
  Which side the words sit on.

  The vine runs almost vertically through every interior station: its tangent
  there is (next - previous), and since y climbs steadily while x zigzags, that
  works out to between 2 and 15 degrees off vertical. So words placed to either
  side clear the stroke, and they alternate for rhythm.

  The two ends are the exception. At the first station the vine only leaves, to
  the right; at the last it only arrives, from the left. Those are pinned to the
  side the stroke is not on, which costs one repeat at each end of the sequence.
*/
const textLeftAt = (i: number, n: number) =>
  i === 0 ? true : i === n - 1 ? false : i % 2 === 1;

export function FlowerWorld({ seasons, total }: { seasons: Season[]; total: number }) {
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
  const [narrow, setNarrow] = useState(false);
  const [vw, setVw] = useState(1440);
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      setNarrow(w < 700);
      setVw(w);
      setFit(w < 700 ? 0.82 : Math.max(0.7, Math.min(1.15, w / 1500)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref });
  /* softer than it was, so it filters the jitter in a real scroll wheel */
  const p = useSpring(scrollYProgress, { stiffness: 62, damping: 30, mass: 0.6 });

  /*
    The camera keyframes.

    It used to whipsaw: it punched to 1.28 at every station and yanked back to
    0.6 between them, seven times over, with a ±190px sideways drift that flipped
    direction on every leg and a final shove to 1.72. Scrolled at any real speed
    that reads as thrashing rather than flying.

    Now it breathes. The zoom moves between 1.14 and 0.95, the turns arc by 80px,
    and, most of the difference, the camera actually STOPS at each station and
    holds while you read, then leaves. Motion between the two is eased out of rest
    and back into rest, so a leg accelerates, coasts through its midpoint, and
    settles. No corner anywhere in the path.
  */
  /*
    How far a station's block slides off its own node.

    Centred on the node, the vine ran straight through the middle of the words.
    Sliding the row by half its width less half the bloom puts the BLOOM on the
    node instead, which is what it should have been all along: a flower on the
    stem, with the copy set beside it on clean paper. The camera takes the same
    offset, so the block stays centred in frame.

    On a phone the block is stacked rather than side by side and is nearly as
    wide as the screen, so there is no room beside the bloom. There the vine gets
    its own gutter just outside the block.
  */
  const rowW = Math.min(vw * 0.86, 1000);
  const asideMag = narrow ? rowW / 2 + 36 : rowW / 2 - 62;
  const asideAt = (i: number) => (textLeftAt(i, n) ? -asideMag : asideMag);

  /*
    Where the camera sits when it is looking at station i. Note the sideways
    offset is baked in: the camera frames the BLOCK, not the vine's node.
  */
  const camAt = (i: number) => ({ x: -(STATIONS[i].x + asideAt(i)), y: -STATIONS[i].y });

  /*
    Stops spaced by DISTANCE rather than evenly.

    Evenly spaced, every leg got the same slice of scroll regardless of how far it
    actually was, and the legs are not equal: because textLeftAt pins both ends of
    the sequence, the sideways offset does not flip across the first or the last
    leg, so those two are about 1185px where the rest are about 780px. Same scroll,
    fifty percent more ground, and the camera lunged on exactly those two.

    Weighting each leg by its own length gives every one of them the same speed.
  */
  const first = 0.15; /* where the camera reaches the opening bloom */
  const last = 0.885; /* and the closing one */
  const legs = Array.from({ length: n - 1 }, (_, i) => {
    const a = camAt(i);
    const b = camAt(i + 1);
    return Math.hypot(b.x - a.x, b.y - a.y);
  });
  const ground = legs.reduce((s, v) => s + v, 0);
  const stops = [first];
  for (let i = 0; i < n - 1; i++) stops.push(stops[i] + (legs[i] / ground) * (last - first));
  const span = (last - first) / (n - 1);
  /*
    Only a brief settle at each station. A long hold sounds calmer but does the
    opposite: it crams the same distance into a shorter window, so the legs have
    to move faster and the whole thing reads as lurching. Nearly all of the scroll
    is now spent gliding, which is the calm version of moving.
  */
  const dwell = span * 0.09;


  /*
    Deliberately FLAT easings.

    A leg is two segments, station to midpoint and midpoint to station, and these
    used to be a textbook easeIn and easeOut. That shape starts at zero velocity
    and spikes to roughly double the average at the midpoint, so every leg was a
    lunge: the camera sat still, hurled itself at the next flower, and stopped.
    Measured, its peak was 2.7 camera pixels per pixel of scroll.

    These curves have soft ends (about 0.4x) and a gentle crest (about 1.1x), so a
    leg runs at close to constant speed and merely tapers where it meets a station.
    The spring smooths what little step is left.
  */
  const leave = cubicBezier(0.4, 0.15, 0.75, 0.72);
  const settle = cubicBezier(0.25, 0.28, 0.6, 0.85);
  const both = cubicBezier(0.4, 0.1, 0.6, 0.9);
  const still = (v: number) => v; /* the dwell: nothing is moving anyway */

  /*
    The camera does NOT start centred on station 0, that put the first station
    directly behind the arrival headline. It starts above and left of it, so the
    title has clean paper, then flies down onto the first bloom.
  */
  const keys: number[] = [0];
  const xs: number[] = [-STATIONS[0].x - 597];
  const ys: number[] = [-STATIONS[0].y + 319];
  const zs: number[] = [0.98];
  const rs: number[] = [0];
  /*
    How present the vine is. On a phone a station's block is nearly as wide as
    the screen, so there is no gutter for the stroke to sit in and it crosses the
    words wherever you put them. It recedes while you are reading and comes back
    for the flight, which reads as depth rather than as something switching off.
    Desktop has the room, so it stays at full there.
  */
  const vs: number[] = [1];
  const eases: ((v: number) => number)[] = [];

  for (let i = 0; i < n; i++) {
    /* arrive, and hold: the same position twice, so the camera rests */
    for (const k of [stops[i] - dwell, stops[i] + dwell]) {
      keys.push(k);
      xs.push(camAt(i).x);
      ys.push(camAt(i).y);
      zs.push(1.12);
      rs.push(0);
      vs.push(narrow ? 0.06 : 1);
    }
    eases.push(i === 0 ? both : settle);
    eases.push(still);

    if (i < n - 1) {
      const a = STATIONS[i];
      const b = STATIONS[i + 1];
      keys.push((stops[i] + stops[i + 1]) / 2);
      /* a gentle bow off the straight line, so the turn arcs rather than corners */
      xs.push(-((a.x + b.x) / 2 + (i % 2 === 0 ? 80 : -80)));
      ys.push(-((a.y + b.y) / 2));
      zs.push(1.04); /* a breath back, not the yank to 0.6 this used to be */
      rs.push(0);
      vs.push(1);
      eases.push(leave);
    }
  }
  keys.push(1);
  xs.push(camAt(n - 1).x - 150);
  ys.push(camAt(n - 1).y - 380);
  zs.push(1.24);
  rs.push(0);
  vs.push(narrow ? 0.06 : 1);
  eases.push(both);

  const camX = useTransform(p, keys, xs, { ease: eases });
  const camY = useTransform(p, keys, ys, { ease: eases });
  const camZraw = useTransform(p, keys, zs, { ease: eases });
  const camZ = useTransform(camZraw, (z) => z * fit);
  const camR = useTransform(p, keys, rs, { ease: eases });
  const vineAlpha = useTransform(p, keys, vs, { ease: eases });


  /*
    The arrival holds until it has finished FORMING, then departs. It used to start
    fading at 0.045 while its own words were still assembling until 0.072, so the
    headline was dissolving before it existed.
  */
  const titleOpacity = useTransform(p, [0, 0.082, 0.118], [1, 1, 0]);
  const titleY = useTransform(p, [0, 0.118], ["0vh", "-8vh"]);
  const hint = useTransform(p, [0, 0.026], [1, 0]);
  const outroOpacity = useTransform(p, [0.955, 0.99], [0, 1]);

  if (reduce) return <StaticSeasons seasons={seasons} total={total} />;

  return (
    /* More scroll per station again, so the camera covers its ground unhurried */
    <div ref={ref} style={{ height: `${n * 175 + 180}vh` }} className="relative">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/*
          Light on paper. Masked off at the foot so the world's ground dissolves
          into the page's own paper instead of ending on a hard horizontal edge:
          when the sticky stage releases and scrolls away, that edge was a visible
          seam straight across the frame, which is precisely the stacked-sections
          read this whole thing exists to avoid.
        */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 80% at 58% 26%, #fbfaf2 0%, #f2f1e6 44%, #e6e5d5 100%)",
            maskImage: "linear-gradient(to bottom, #000 0%, #000 74%, transparent 99%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 74%, transparent 99%)",
          }}
        />

        {/*
          Ambient petals sit BEHIND the camera layer. Rendered on top they drifted
          across the station text and cost legibility.
        */}
        <Drift p={p} />

        {/* ── the camera ────────────────────────────────────────────── */}
        <motion.div
          className="absolute top-1/2 left-1/2"
          style={{ scale: camZ, rotate: camR, transformOrigin: "50% 50%" }}
        >
          <motion.div className="relative" style={{ x: camX, y: camY }}>
            {/* the vine, one small sheet per segment, see SEGMENTS above */}
            <motion.div style={{ opacity: vineAlpha }}>
              {SEGMENTS.slice(0, n - 1).map((seg) => (
                <VineSegment
                  key={seg.i}
                  seg={seg}
                  from={seg.i === 0 ? 0 : stops[seg.i] - dwell}
                  to={stops[seg.i + 1] - dwell}
                  p={p}
                />
              ))}
            </motion.div>

            {seasons.slice(0, n).map((s, i) => (
              <Station
                key={s.slug}
                season={s}
                at={stops[i]}
                index={i}
                pos={STATIONS[i]}
                aside={asideAt(i)}
                flip={textLeftAt(i, n)}
                p={p}
                gate={0.108}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* ── arrival, over the world ── */}
        <div className="pointer-events-none absolute inset-0 flex -translate-y-[5vh] flex-col items-center justify-center px-6">
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
                  {spellCount(total, true)} local businesses across Hampton Roads,
                  gathered by a woman who
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
            <p className="hand relative text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.15]">
              No one should have to
              <br />
              navigate a season alone.
            </p>
            <Link
              href="/village"
              className="relative mt-9 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[13px] tracking-[0.06em] text-paper transition-colors duration-500 hover:bg-bell-deep"
            >
              Meet all {total} &rarr;
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
  aside,
  flip,
  p,
  gate,
}: {
  season: Season;
  at: number;
  index: number;
  pos: { x: number; y: number; rot: number };
  /** slides the block off its node so the vine runs beside the words */
  aside: number;
  /** true puts the words left of the bloom, see textLeftAt */
  flip: boolean;
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

  const words = season.label.split(" ");

  return (
    <motion.div
      className="absolute"
      style={{
        left: pos.x + aside,
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
          No scrim behind the words. It was a radial gradient meant to feather out,
          but its ending shape reached past the box at the vertical midline, so it
          painted hard left and right edges: a visible panel around every station.
          The words are kept clear of the vine by moving them (see ASIDE) rather
          than by putting a lighter rectangle underneath them.
        */}
        <motion.div className="relative z-10 min-w-0 flex-1" style={{ x: textX }}>
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
  from,
  to,
  p,
}: {
  seg: { i: number; minX: number; minY: number; w: number; h: number; d: string };
  /*
    When this length of vine draws. Spaced by the STATIONS rather than evenly
    across the scroll, which is what they used to be: evenly spaced, the windows
    drifted out of step with the stops, and by the last one the vine finished 10%
    short of its own bloom, leaving a cut stub hanging in the field. Each segment
    now grows over exactly the flight between the two stations it joins, so the
    path is always complete the moment you arrive.
  */
  from: number;
  to: number;
  p: MotionValue<number>;
}) {
  /* Nothing is drawn at rest. The arrival is clean paper, type and her mark. */
  const draw = useTransform(p, [from, to], [0, 1]);
  /*
    A round linecap still paints a dot at pathLength 0, which left a stray speck
    on the arrival. Fade the stroke in over the first fraction of a percent so the
    cap has nothing to draw until the branch genuinely starts.
  */
  const inked = useTransform(draw, [0, 0.004], [0, 1]);

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
        strokeWidth="12"
        strokeLinecap="round"
        style={{ pathLength: draw, opacity: inked, strokeOpacity: 0.09 }}
      />
      <motion.path
        d={seg.d}
        fill="none"
        stroke={SAGE_DEEP}
        strokeWidth="4.5"
        strokeLinecap="round"
        style={{ pathLength: draw, opacity: inked }}
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
  /*
    Clamped so no leaf can be part-open at rest. The first leaf on segment 0 had a
    window starting at a negative scroll value, so it sat 19% unfurled on the
    arrival: a stray speck under the headline before anything had grown.
  */
  const a0 = Math.max(f.at - 0.035, 0.006);
  const a1 = Math.max(f.at + 0.02, a0 + 0.012);
  const t = useTransform(p, [a0, a1], [0, 1]);
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

/*
  Ambient petals drifting across the frame, pure CSS, never scroll-bound.

  Two masks keep them off the copy. The horizontal one dissolves any petal that
  wanders into the centre column, where the headline and every station's text
  live; the vertical one clears the nav band at the top and the scroll hint at
  the bottom. They are separate nested elements on purpose: one mask each, so
  this needs no mask-composite. Petals still cross the frame, they just cannot
  land on a word. The x positions start in the margins so most of each drift is
  spent where it is actually visible.
*/
function Drift({ p }: { p: MotionValue<number> }) {
  /*
    The masks below are anchored to the world, but the nav is fixed to the
    viewport, so once the sticky stage releases and slides up, its unmasked
    middle passes under the nav and a petal lands next to the links. Fading the
    whole layer out as the journey ends solves that at the source, and is right
    anyway: the air stops moving once you have walked out of the garden.
  */
  const air = useTransform(p, [0.9, 0.965], [1, 0]);
  const petals = [
    { l: "6%", d: 0, dur: 26, s: 0.5 },
    { l: "17%", d: 6, dur: 33, s: 0.34 },
    { l: "28%", d: 12, dur: 29, s: 0.4 },
    { l: "79%", d: 3, dur: 37, s: 0.28 },
    { l: "92%", d: 17, dur: 31, s: 0.44 },
  ];
  const acrossTheType =
    "linear-gradient(to right, #000 0%, #000 17%, transparent 33%, transparent 67%, #000 83%, #000 100%)";
  const pastTheChrome =
    "linear-gradient(to bottom, transparent 0%, transparent 9%, #000 16%, #000 87%, transparent 96%)";

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: air, maskImage: acrossTheType, WebkitMaskImage: acrossTheType }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{ maskImage: pastTheChrome, WebkitMaskImage: pastTheChrome }}
      >
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
    </motion.div>
  );
}

/* ── reduced-motion / no-JS path: the same content, plainly ── */
function StaticSeasons({ seasons, total }: { seasons: Season[]; total: number }) {
  return (
    <section className="px-6 py-24 sm:px-10">
      <div className="mx-auto max-w-[1180px]">
        <h1 className="display text-[clamp(2.2rem,5vw,4rem)] leading-[1.04]">
          Every season of life deserves a <span className="text-bell-deep">village</span>
        </h1>
        <p className="prose-warm mt-6 max-w-[46ch]">
          {spellCount(total, true)} local businesses across Hampton Roads, gathered by a
          woman who knows
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
