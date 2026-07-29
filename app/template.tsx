"use client";

import { motion, useReducedMotion } from "motion/react";

/*
  Next re-mounts template.tsx on every navigation, so this is where page
  transitions live. The nav and footer sit in layout.tsx and stay put, only the
  page content changes, which is what makes a route change feel like turning a
  page rather than reloading a site.

  Deliberately OPACITY-ONLY on the wrapper. A transform here would make this
  element the containing block for its descendants and break `position: sticky`,
  which the whole flower world depends on. The sense of movement comes from the
  veil instead, which is fixed and wraps nothing.
*/
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <>
      <RouteVeil reduce={reduce} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: reduce ? 0.15 : 0.55,
          delay: reduce ? 0 : 0.12,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </>
  );
}

/*
  A sheet of paper that lifts off the new page, with a sprig of forget-me-nots
  going with it. Fixed and pointer-events-none, so it never blocks a tap even
  mid-flight.
*/
function RouteVeil({ reduce }: { reduce: boolean | null }) {
  if (reduce) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-paper"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <motion.svg
        viewBox="0 0 120 120"
        width="54"
        height="54"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: [0, 1, 0] }}
        transition={{ duration: 0.62, times: [0, 0.4, 1], ease: [0.16, 1, 0.3, 1] }}
      >
        {[0, 72, 144, 216, 288].map((deg, j) => (
          <ellipse
            key={deg}
            cx="60"
            cy="34"
            rx="18"
            ry="23"
            fill={j % 2 === 0 ? "#6090c0" : "#3e6fa6"}
            fillOpacity={j % 2 === 0 ? 0.95 : 0.8}
            transform={`rotate(${deg} 60 60)`}
          />
        ))}
        <circle cx="60" cy="60" r="9" fill="#e8c55a" />
      </motion.svg>
    </motion.div>
  );
}
