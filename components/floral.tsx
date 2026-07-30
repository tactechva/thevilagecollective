"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

/*
  Hand-authored botanical system. Every path here was drawn by hand for this brand
  the olive laurel, the forget-me-not, the brass key, because they are the three
  things in Jessica's own mark.

  All motion is stroke-dashoffset (path drawing), scale and rotate: GPU-only, so a
  growing vine costs nothing on a phone.
*/

const SAGE = "#848460";
const SAGE_DEEP = "#545430";
const BLUE = "#6090C0";
const BLUE_DEEP = "#43709E";
const GOLD = "#E8C55A";
const BRASS = "#A89060";

/* ── Forget-me-not: five petals, gold eye. The flower of remembrance. ── */
export function ForgetMeNot({
  size = 26,
  delay = 0,
  className,
}: {
  size?: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      initial={{ scale: reduce ? 1 : 0, rotate: reduce ? 0 : -35 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "50% 50%" }}
    >
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <motion.ellipse
          key={deg}
          cx="20"
          cy="10.5"
          rx="6.6"
          ry="8.2"
          fill={i % 2 === 0 ? BLUE : BLUE_DEEP}
          fillOpacity={i % 2 === 0 ? 0.95 : 0.82}
          transform={`rotate(${deg} 20 20)`}
          initial={{ scale: reduce ? 1 : 0.35, opacity: reduce ? 1 : 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            delay: delay + 0.06 * i,
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ transformOrigin: "20px 20px" }}
        />
      ))}
      <circle cx="20" cy="20" r="3.6" fill={GOLD} />
      <circle cx="20" cy="20" r="1.5" fill="#fff" fillOpacity="0.55" />
    </motion.svg>
  );
}

/* ── A single olive leaf that unfurls from its stem end. ── */
function Leaf({
  d,
  delay,
  flip = false,
  reduce,
}: {
  d: string;
  delay: number;
  flip?: boolean;
  reduce: boolean | null;
}) {
  return (
    <motion.path
      d={d}
      fill={flip ? SAGE_DEEP : SAGE}
      fillOpacity={flip ? 0.78 : 0.92}
      initial={{ scale: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ delay, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "center" }}
    />
  );
}

/*
  ── The growing vine ──
  A stem that draws itself as the page scrolls, sprouting leaves and blooming
  forget-me-nots on the way down. This is the spine of the page: it literally
  grows alongside you, which is the village assembling itself.
*/
export function GrowingVine({
  height = 2400,
  blooms = [0.16, 0.42, 0.68, 0.9],
  className,
}: {
  height?: number;
  blooms?: number[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 15%"],
  });
  const grow = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.4 });
  const drawn = useTransform(grow, (v) => (reduce ? 1 : v));

  /* One S-curving stem, hand-drawn, running the full height of a 120-wide band. */
  const stem =
    "M60 0 C 34 130, 92 250, 58 380 C 26 505, 96 620, 62 750 C 30 875, 92 990, 58 1120 C 26 1245, 94 1360, 60 1490";

  const leaves: { d: string; at: number; flip?: boolean }[] = [
    { d: "M58 96 C 30 78, 12 96, 16 122 C 42 132, 58 120, 58 96 Z", at: 0.06, flip: true },
    { d: "M62 168 C 92 150, 110 170, 105 196 C 78 205, 62 192, 62 168 Z", at: 0.11 },
    { d: "M58 300 C 28 284, 10 302, 15 328 C 41 337, 58 324, 58 300 Z", at: 0.2, flip: true },
    { d: "M64 402 C 94 386, 112 404, 107 430 C 80 439, 64 426, 64 402 Z", at: 0.27 },
    { d: "M58 520 C 28 504, 10 522, 15 548 C 41 557, 58 544, 58 520 Z", at: 0.35, flip: true },
    { d: "M64 648 C 94 632, 112 650, 107 676 C 80 685, 64 672, 64 648 Z", at: 0.44 },
    { d: "M58 790 C 28 774, 10 792, 15 818 C 41 827, 58 814, 58 790 Z", at: 0.53, flip: true },
    { d: "M64 918 C 94 902, 112 920, 107 946 C 80 955, 64 942, 64 918 Z", at: 0.62 },
    { d: "M58 1046 C 28 1030, 10 1048, 15 1074 C 41 1083, 58 1070, 58 1046 Z", at: 0.71, flip: true },
    { d: "M64 1188 C 94 1172, 112 1190, 107 1216 C 80 1225, 64 1212, 64 1188 Z", at: 0.8 },
    { d: "M58 1330 C 28 1314, 10 1332, 15 1358 C 41 1367, 58 1354, 58 1330 Z", at: 0.89, flip: true },
  ];

  return (
    <div ref={ref} className={className} style={{ height }} aria-hidden="true">
      <div className="sticky top-0 h-screen">
        <svg
          viewBox="0 0 120 1490"
          preserveAspectRatio="xMidYMin slice"
          className="h-full w-full overflow-visible"
        >
          {/* the stem, drawing itself */}
          <motion.path
            d={stem}
            fill="none"
            stroke={SAGE_DEEP}
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{ pathLength: drawn, opacity: 0.9 }}
          />
          {/* a paler second stroke gives the stem depth */}
          <motion.path
            d={stem}
            fill="none"
            stroke={SAGE}
            strokeWidth="4.6"
            strokeLinecap="round"
            strokeOpacity="0.22"
            style={{ pathLength: drawn }}
          />
          {leaves.map((l, i) => (
            <LeafOnVine key={i} {...l} grow={grow} reduce={reduce} />
          ))}
          {blooms.map((at, i) => (
            <BloomOnVine key={i} at={at} y={at * 1490} grow={grow} reduce={reduce} />
          ))}
        </svg>
      </div>
    </div>
  );
}

function LeafOnVine({
  d,
  at,
  flip,
  grow,
  reduce,
}: {
  d: string;
  at: number;
  flip?: boolean;
  grow: ReturnType<typeof useSpring>;
  reduce: boolean | null;
}) {
  const s = useTransform(grow, [at - 0.02, at + 0.05], [0, 1], { clamp: true });
  const scale = useTransform(s, (v) => (reduce ? 1 : v));
  return (
    <motion.path
      d={d}
      fill={flip ? SAGE_DEEP : SAGE}
      fillOpacity={flip ? 0.75 : 0.9}
      style={{ scale, opacity: scale, transformBox: "fill-box", transformOrigin: flip ? "100% 0%" : "0% 0%" }}
    />
  );
}

function BloomOnVine({
  at,
  y,
  grow,
  reduce,
}: {
  at: number;
  y: number;
  grow: ReturnType<typeof useSpring>;
  reduce: boolean | null;
}) {
  const s = useTransform(grow, [at - 0.015, at + 0.06], [0, 1], { clamp: true });
  const scale = useTransform(s, (v) => (reduce ? 1 : v));
  const rot = useTransform(s, [0, 1], [-40, 0]);
  return (
    <motion.g style={{ scale, opacity: scale, rotate: reduce ? 0 : rot, transformBox: "fill-box", transformOrigin: "center" }}>
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse
          key={deg}
          cx="60"
          cy={y - 9}
          rx="5.4"
          ry="6.8"
          fill={i % 2 === 0 ? BLUE : BLUE_DEEP}
          fillOpacity={i % 2 === 0 ? 0.95 : 0.8}
          transform={`rotate(${deg} 60 ${y})`}
        />
      ))}
      <circle cx="60" cy={y} r="2.9" fill={GOLD} />
    </motion.g>
  );
}

/*
  ── The mark, arriving ──
  Jessica's real monogram is a beautiful piece of illustration and it is not mine to
  redraw. So the mark itself is her actual artwork; what we author is the MOTION
  around it: a brass arc that draws open (her wreath deliberately never closes), her
  mark settling in behind it, and forget-me-nots blooming last at the base.
*/
export function DrawnWreath({ size = 470, className }: { size?: number; className?: string }) {
  const reduce = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;

  /* an open arc, drawn around her mark, it stops short on purpose */
  const halo =
    "M 96 372 C 18 300, 10 168, 96 92 C 176 22, 300 26, 372 96 C 430 154, 438 246, 398 312";

  return (
    <div className={`relative ${className ?? ""}`} style={{ width: size, maxWidth: "100%" }}>
      <motion.svg
        viewBox="0 0 470 470"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <motion.path
          d={halo}
          fill="none"
          stroke={BRASS}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeOpacity="0.55"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 2.4, delay: reduce ? 0 : 0.2, ease }}
        />
        {[
          { x: 356, y: 372, s: 1 },
          { x: 404, y: 344, s: 0.72 },
          { x: 330, y: 412, s: 0.6 },
        ].map((b, i) => (
          <motion.g
            key={i}
            initial={{ scale: reduce ? b.s : 0, opacity: 0, rotate: reduce ? 0 : -60 }}
            animate={{ scale: b.s, opacity: 1, rotate: 0 }}
            transition={{ duration: reduce ? 0.2 : 1, delay: reduce ? 0 : 1.5 + i * 0.16, ease }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            {[0, 72, 144, 216, 288].map((deg, j) => (
              <ellipse
                key={deg}
                cx={b.x}
                cy={b.y - 11}
                rx="7"
                ry="8.6"
                fill={j % 2 === 0 ? BLUE : BLUE_DEEP}
                fillOpacity={j % 2 === 0 ? 0.95 : 0.8}
                transform={`rotate(${deg} ${b.x} ${b.y})`}
              />
            ))}
            <circle cx={b.x} cy={b.y} r="3.4" fill={GOLD} />
          </motion.g>
        ))}
      </motion.svg>

      {/*
        `animate` is ALWAYS the visible state, never gated on reduced motion.
        Gating it left the mark stuck at opacity 0 for reduced-motion users, i.e.
        permanently invisible. Reduced motion shortens the motion; it never removes
        the content.
      */}
      <motion.img
        src="/tvc-mark-keyed.png"
        alt="The Village Collective logo: an open olive wreath around the letters T V C, with a brass key and forget-me-nots"
        width={744}
        height={675}
        className="relative block h-auto w-full"
        initial={{ opacity: 0, scale: reduce ? 1 : 0.94, y: reduce ? 0 : 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduce ? 0.2 : 1.8, delay: reduce ? 0 : 0.35, ease }}
      />
    </div>
  );
}

/* ── A small sprig used as a rule/divider between sections. ── */
export function Sprig({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 220 24"
      className={className}
      aria-hidden="true"
      initial={{ opacity: reduce ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.path
        d="M8 12 C 60 12, 78 6, 110 6 C 142 6, 160 12, 212 12"
        fill="none"
        stroke={BRASS}
        strokeWidth="1"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      {[
        [40, 12, -1],
        [68, 9, 1],
        [152, 9, -1],
        [180, 12, 1],
      ].map(([x, y, dir], i) => (
        <motion.path
          key={i}
          d={`M${x} ${y} c ${8 * dir} ${-6 * dir}, ${16 * dir} ${-2 * dir}, ${15 * dir} ${5 * dir} c ${-8 * dir} ${3 * dir}, ${-14 * dir} ${1 * dir}, ${-15 * dir} ${-5 * dir} Z`}
          fill={SAGE}
          fillOpacity="0.85"
          initial={{ scale: reduce ? 1 : 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      ))}
      <g>
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="110"
            cy="8"
            rx="3.4"
            ry="4.2"
            fill={BLUE}
            fillOpacity="0.9"
            transform={`rotate(${deg} 110 12)`}
          />
        ))}
        <circle cx="110" cy="12" r="1.9" fill={GOLD} />
      </g>
    </motion.svg>
  );
}

/*
  The flourish that opens under a nav link on hover.

  Same vocabulary as Sprig, scaled right down: a shallow arch, a leaf either side,
  a forget-me-not at each end. The arch is two mirrored halves that both START at
  the centre, so on hover it grows outward from under the middle of the word and
  the two flowers arrive together, rather than sweeping across in one direction.

  Pure CSS, driven by the link's `group` hover. No per-link React state for
  something the browser can do on its own, and it costs nothing when idle.

  Fixed size on purpose. Stretching it to each link's width would make the
  flourish under "Jess" a different shape from the one under "The Village", and
  stretching an SVG of flowers distorts the flowers. A decorative mark of one
  consistent size, centred, reads as deliberate.
*/
export function NavSprig() {
  /* one half of the arch, and its mirror; ~34 units long, hence the dash values */
  const half = (dir: 1 | -1) =>
    `M38 4.5 C ${38 + 12 * dir} 4.5, ${38 + 20 * dir} 7.5, ${38 + 30 * dir} 11`;

  const leaf = (x: number, y: number, dir: 1 | -1) =>
    `M${x} ${y} c ${3.4 * dir} ${-2.6 * dir}, ${6.8 * dir} ${-0.8 * dir}, ${6.4 * dir} ${2.1 * dir}` +
    ` c ${-3.4 * dir} ${1.3 * dir}, ${-6 * dir} ${0.4 * dir}, ${-6.4 * dir} ${-2.1 * dir} Z`;

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-3.5 left-1/2 -translate-x-1/2"
    >
      <svg width="76" height="16" viewBox="0 0 76 16" className="overflow-visible">
        {([1, -1] as const).map((dir) => (
          <path
            key={dir}
            d={half(dir)}
            fill="none"
            stroke={SAGE}
            strokeWidth="1"
            strokeLinecap="round"
            className="[stroke-dasharray:34] [stroke-dashoffset:34] transition-[stroke-dashoffset] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:[stroke-dashoffset:0]"
          />
        ))}

        {/* a leaf on each side, opening just behind the branch that carries it */}
        {(
          [
            [26, 6.2, -1],
            [50, 6.2, 1],
          ] as const
        ).map(([x, y, dir]) => (
          <path
            key={x}
            d={leaf(x, y, dir)}
            fill={SAGE}
            fillOpacity="0.85"
            className="scale-0 transition-transform delay-[180ms] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100"
            style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }}
          />
        ))}

        {/* and the two blooms the branch is reaching towards */}
        {([8, 68] as const).map((cx) => (
          <g
            key={cx}
            className="scale-0 transition-transform delay-[300ms] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100"
            style={{ transformBox: "view-box", transformOrigin: `${cx}px 11px` }}
          >
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx={cx}
                cy="8.4"
                rx="2.1"
                ry="2.7"
                fill={BLUE}
                fillOpacity="0.9"
                transform={`rotate(${deg} ${cx} 11)`}
              />
            ))}
            <circle cx={cx} cy="11" r="1.2" fill={GOLD} />
          </g>
        ))}
      </svg>
    </span>
  );
}
