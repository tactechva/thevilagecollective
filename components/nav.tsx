"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ForgetMeNot } from "@/components/floral";

const LINKS = [
  { href: "/village", label: "The Village" },
  { href: "/seasons", label: "Seasons" },
  { href: "/about", label: "Jess" },
];

/*
  Over the hero it is not a bar at all: the wordmark and three words sit directly
  on the paper, no box, no backdrop, no border.

  Past the hero it becomes one. It has to. With no ground, page content scrolled
  straight under it and collided, and the worst case was the closing signature on
  Jess's letter landing on top of the wordmark, two pieces of type in the same
  square inch. A sheet of paper and a brass hairline fade in once you have left
  the first screen, so anything passing beneath is simply behind it.
*/
export function Nav() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const shell = useRef<HTMLDivElement>(null);
  const openedAt = useRef(0);
  const here = usePathname();

  /*
    The ground arrives after the first screen, which is what "past the hero"
    amounts to on every page here: the arrival on the home page, the title block
    everywhere else. Measured rather than a fixed pixel count, so it is the same
    moment on a phone as on a desktop.
  */
  const [screen, setScreen] = useState(900);
  useEffect(() => {
    const measure = () => setScreen(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollY } = useScroll();
  const ground = useTransform(scrollY, [screen * 0.55, screen * 0.92], [0, 1]);

  /*
    The small mark belongs to the NAV, not to the scroll world. It used to be
    absolutely positioned against the viewport edge while the wordmark sits inside
    a centred 1280px container, so the two never lined up, and it carried a
    scroll-driven rotation that made it swing. It now sits inline beside the
    wordmark: same container, same baseline, no rotation, always square.
  */
  const markOpacity = useTransform(scrollY, [120, 420], [0, 1]);
  const markWidth = useTransform(scrollY, [120, 420], ["0rem", "2.25rem"]);
  const markGap = useTransform(scrollY, [120, 420], ["0rem", "0.625rem"]);

  /*
    The menu used to be a full-screen sheet that set body overflow to hidden, so
    opening it froze the page underneath. It is a panel hanging off the bar now:
    the page keeps scrolling, and scrolling is itself a way to dismiss it.
  */
  useMotionValueEvent(scrollY, "change", (y) => {
    if (open && Math.abs(y - openedAt.current) > 28) setOpen(false);
  });

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (shell.current && !shell.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  /* the nav lives in layout.tsx and never remounts, so a route change must close it */
  useEffect(() => setOpen(false), [here]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/*
        Settles down from above on load, a beat before the wreath, so the page
        frames itself first and the arrival lands inside it. This lives in
        layout.tsx rather than template.tsx, so it runs on a real page load and
        stays put through route changes, which is the point: the nav is the one
        thing that should not re-enter every time you move around the site.

        `animate` is always the visible state. Gating it on reduced motion is
        how content ends up stuck at `initial` and invisible; reduced motion
        drops the travel and shortens the fade instead.
      */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: reduce ? 0 : -26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduce ? 0.2 : 0.95,
          delay: reduce ? 0 : 0.28,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/*
          The ground.

          Opaque for most of its height and then dissolving, rather than a flat
          fill with a hairline under it. Two reasons. A hard bottom edge draws a
          line clean across the flower world, which is one continuous field and
          should not look banded. And the world's paper is lighter at the top than
          the page's own paper is, so a flat #f2f1e6 bar read as a grey stripe laid
          over it; paper-lift sits where the world actually is, and the fade means
          there is no edge to notice either way.

          It extends below the bar so type has cleared the opaque part before it
          reaches the fade. Not interactive: over the hero it is invisible, and an
          invisible sheet that swallowed clicks would make the top of the arrival
          dead to the touch.
        */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-7"
          style={{
            opacity: ground,
            background:
              "linear-gradient(to bottom, #f8f7ee 0%, #f8f7ee 66%, rgba(248,247,238,0.72) 84%, rgba(248,247,238,0) 100%)",
          }}
          aria-hidden="true"
        />

        <div
          ref={shell}
          className="pointer-events-auto relative mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6 sm:px-10"
        >
          <Link href="/" className="group flex items-center">
            {/* fades and widens in as you leave the arrival, then stays put */}
            <motion.span
              className="block shrink-0 overflow-hidden"
              style={{ opacity: markOpacity, width: markWidth, marginRight: markGap }}
              aria-hidden="true"
            >
              <img
                src="/tvc-mark-keyed.png"
                alt=""
                width={744}
                height={675}
                className="h-9 w-9 max-w-none object-contain"
              />
            </motion.span>
            <span className="display text-[19px] leading-none tracking-[0.02em] sm:text-[21px]">
              The Village Collective
            </span>
            <span className="ml-2.5 hidden h-1.5 w-1.5 shrink-0 rounded-full bg-brass/60 transition-colors duration-500 group-hover:bg-bell sm:block" />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={here === l.href ? "page" : undefined}
                className="group relative flex items-center gap-2 text-[13.5px] text-ink-soft transition-colors duration-500 hover:text-ink aria-[current=page]:text-ink"
              >
                <span className="absolute -left-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <ForgetMeNot size={10} />
                </span>
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => {
              openedAt.current = window.scrollY;
              setOpen((v) => !v);
            }}
            aria-expanded={open}
            aria-controls="nav-menu"
            className="flex items-center gap-2 text-[13px] text-ink-soft md:hidden"
          >
            {open ? "Close" : "Menu"}
            <span className="flex h-3 w-4 flex-col justify-center gap-[3px]">
              <motion.span
                className="block h-px w-4 origin-center bg-ink"
                animate={reduce ? { rotate: 0, y: 0 } : { rotate: open ? 45 : 0, y: open ? 2 : 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.span
                className="block h-px w-4 origin-center bg-ink"
                animate={
                  reduce ? { rotate: 0, y: 0 } : { rotate: open ? -45 : 0, y: open ? -2 : 0 }
                }
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
          </button>

          {/*
            The panel. Hangs off the bar rather than covering the screen, so the
            page behind it is still there and still scrollable.
          */}
          <AnimatePresence>
            {open && (
              <motion.div
                id="nav-menu"
                className="absolute top-full right-6 left-6 origin-top border-b border-brass/25 bg-[#f8f7ee] shadow-[0_18px_40px_-28px_rgba(60,56,40,0.45)] sm:right-10 sm:left-10 md:hidden"
                initial={{ opacity: 0, y: reduce ? 0 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                transition={{ duration: reduce ? 0.15 : 0.42, ease: [0.16, 1, 0.3, 1] }}
              >
                {LINKS.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: reduce ? 0 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reduce ? 0 : 0.08 + i * 0.06,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex items-center gap-3 border-t border-brass/15 first:border-t-0"
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={here === l.href ? "page" : undefined}
                      className="display flex w-full items-center gap-3 px-5 py-4 text-[26px] leading-none"
                    >
                      <ForgetMeNot size={14} delay={reduce ? 0 : 0.18 + i * 0.06} />
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
