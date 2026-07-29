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
          duration: reduce ? 0.15 : 0.7,
          delay: reduce ? 0 : 0.16,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </>
  );
}

/*
  A sheet of paper that lifts off the new page. Nothing rides on it: an earlier
  version put a forget-me-not in the middle, which read as a flower flashing dead
  centre of the screen on every load. Just the paper now.
*/
function RouteVeil({ reduce }: { reduce: boolean | null }) {
  if (reduce) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[90] bg-paper"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    />
  );
}
