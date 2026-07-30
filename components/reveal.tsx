"use client";

import { useEffect, useRef, useState } from "react";

/*
  A block that eases up when it comes into view, including the ones already on
  screen when the page loads.

  The hiding is done in CSS, not here, which is the whole trick. An earlier version
  set the hidden state from JavaScript after mount, so anything already visible had
  to be hidden first and would blink; to dodge the blink it skipped those blocks
  entirely, which meant the top of the page never animated at all. Wrong trade.

  Now the stylesheet hides `[data-reveal]` from the very first paint, but ONLY
  inside `(min-width: 768px) and (prefers-reduced-motion: no-preference)`. So on a
  phone, or for anyone who asked for less movement, the rule never applies and the
  content is simply there, never hidden, nothing to go wrong. A noscript override
  in the layout covers the case where this file never runs at all.

  All this component does is decide when to add `data-shown`.
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
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* if the CSS is not hiding anything, there is nothing to reveal */
    const armed =
      window.matchMedia("(min-width: 768px)").matches &&
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!armed) {
      setShown(true);
      return;
    }

    const show = () => {
      setShown(true);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };

    /*
      IntersectionObserver only reports when the ratio CHANGES, so one
      instantaneous jump, End, Cmd+End, an in-page anchor, can carry a block from
      below the fold to above it without the ratio ever leaving zero: the observer
      stays silent and the block is stranded invisible for the rest of the visit.
      Hence the scroll listener, and the past-it check on the entry.
    */
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight - 80) show();
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) show();
      },
      /*
        A fixed inset rather than a percentage: at -12% the last block on the page
        could never satisfy it, because once scrolling hits the bottom its top is
        still inside that dead band.
      */
      { rootMargin: "0px 0px -80px 0px" },
    );

    /* observe reports once immediately, which is what eases the first screen in */
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      data-reveal=""
      {...(shown ? { "data-shown": "" } : null)}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
