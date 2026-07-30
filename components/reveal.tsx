"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/*
  A block that eases up as you reach it. Desktop only, by request.

  The obvious build of this is `initial={{ opacity: 0 }}` plus whileInView, and it
  has a flaw worth avoiding: anything already on screen when the page loads starts
  invisible and has to fade in after hydration, so the top of the page blinks. And
  gating it on a matchMedia read in an effect makes that worse, since the server
  has already sent the content visible and the client then hides it.

  So nothing is hidden until we know it is BELOW the fold. On mount this measures:
  already in view means show it immediately and never animate; further down means
  snap to hidden with a zero-length transition, which nobody can see because it is
  off screen, then ease it up when it arrives.

  Phones and anyone asking for reduced motion get the plain element, no wrapper
  animation at all, which is also the state it renders in if JS never runs.
*/
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  /** seconds, for offsetting a neighbour so a pair arrives in sequence */
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"open" | "waiting">("open");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce || !window.matchMedia("(min-width: 768px)").matches) return;

    /*
      Any part of it already on screen: leave it alone. This was 0.88 of the
      viewport height, which hid blocks whose top edge sat in the last twelfth of
      the screen, so a visible sliver of them blinked out on load.
    */
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setState("waiting");

    /*
      Opens on arrival, and also on "we are past it".

      IntersectionObserver only reports when the intersection ratio CHANGES, so a
      single instantaneous jump, End, Cmd+End, an in-page anchor, can take a block
      from below the fold to above it without the ratio ever leaving zero. The
      observer stays silent and the block is stranded invisible for the rest of the
      visit. The scroll listener below is the safety net: any position where the
      element has entered or passed opens it.
    */
    const open = () => {
      setState("open");
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight - 80) open();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          open();
        }
      },
      /*
        A small fixed inset, not a percentage. At -12% the last block on the page
        could never satisfy it: once scrolling hits the bottom its top is still
        inside that dead band, so it stayed invisible forever. 80px is always
        reachable.
      */
      { rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduce]);

  return (
    <motion.div
      ref={ref}
      className={className}
      /* false, so the first commit paints the open state rather than animating to it */
      initial={false}
      animate={state === "waiting" ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
      transition={
        state === "waiting"
          ? { duration: 0 } /* hiding happens off screen; do not animate it */
          : { duration: 1.05, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
