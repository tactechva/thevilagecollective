"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ForgetMeNot } from "@/components/floral";

const LINKS = [
  { href: "/village", label: "The Village" },
  { href: "/seasons", label: "Seasons" },
  { href: "/about", label: "Jess" },
];

/*
  Not a bar. No box, no backdrop, no border, the wordmark and three words sit
  directly on the paper, and a forget-me-not marks your place. Clear on desktop,
  which is the one thing a nav must be.
*/
export function Nav() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  /*
    The small mark belongs to the NAV, not to the scroll world. It used to be
    absolutely positioned against the viewport edge while the wordmark sits inside
    a centred 1280px container, so the two never lined up, and it carried a
    scroll-driven rotation that made it swing. It now sits inline beside the
    wordmark: same container, same baseline, no rotation, always square.
  */
  const { scrollY } = useScroll();
  const markOpacity = useTransform(scrollY, [120, 420], [0, 1]);
  const markWidth = useTransform(scrollY, [120, 420], ["0rem", "2.25rem"]);
  const markGap = useTransform(scrollY, [120, 420], ["0rem", "0.625rem"]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <>
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
          className="pointer-events-auto mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6 sm:px-10"
          initial={{ opacity: 0, y: reduce ? 0 : -26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0.2 : 0.95,
            delay: reduce ? 0 : 0.28,
            ease: [0.16, 1, 0.3, 1],
          }}
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
                className="group relative flex items-center gap-2 text-[13.5px] text-ink-soft transition-colors duration-500 hover:text-ink"
              >
                <span className="absolute -left-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <ForgetMeNot size={10} />
                </span>
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-[13px] text-ink-soft md:hidden"
            aria-label="Open menu"
          >
            Menu
            <span className="flex flex-col gap-[3px]">
              <span className="block h-px w-4 bg-ink" />
              <span className="block h-px w-4 bg-ink" />
            </span>
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[70] bg-paper md:hidden"
          >
            <div className="flex items-center justify-end px-6 py-6">
              <button
                onClick={() => setOpen(false)}
                className="text-[13px] text-ink-soft"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <div className="px-6">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 border-b border-brass/20 py-6"
                >
                  <ForgetMeNot size={18} delay={0.2 + i * 0.07} />
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="display text-[40px]"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
