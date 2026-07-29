"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
        <div className="pointer-events-auto mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6 sm:px-10">
          <Link href="/" className="group flex items-baseline gap-2.5">
            <span className="display text-[19px] tracking-[0.02em] sm:text-[21px]">
              The Village Collective
            </span>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-brass/60 transition-colors duration-500 group-hover:bg-bell sm:block" />
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
        </div>
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
