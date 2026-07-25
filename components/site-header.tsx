"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const NAV = [
  { href: "/village", label: "The Village" },
  { href: "/seasons", label: "Seasons" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Floating island nav — detached from the top edge, single line, 72px tall. */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5 sm:pt-6">
        <nav className="flex h-14 w-full max-w-[1180px] items-center justify-between gap-6 border border-brass/25 bg-paper/80 px-4 backdrop-blur-xl sm:px-6">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="The Village Collective — home"
          >
            <Image
              src="/tvc-mark-keyed.png"
              alt=""
              width={36}
              height={33}
              className="h-[34px] w-auto transition-transform duration-700 ease-drift group-hover:scale-105"
              priority
            />
            <span className="t-display hidden text-[15px] leading-none tracking-[0.16em] uppercase sm:block">
              The Village Collective
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="group relative text-[12px] tracking-[0.14em] text-ink-soft uppercase transition-colors duration-500 ease-drift hover:text-ink"
              >
                {n.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-bluebell transition-transform duration-500 ease-drift group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-9 w-9 shrink-0 items-center justify-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span
              className={`absolute h-px w-5 bg-ink transition-all duration-500 ease-drift ${
                open ? "rotate-45" : "-translate-y-[3px]"
              }`}
            />
            <span
              className={`absolute h-px w-5 bg-ink transition-all duration-500 ease-drift ${
                open ? "-rotate-45" : "translate-y-[3px]"
              }`}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center gap-2 bg-paper/95 px-8 backdrop-blur-2xl md:hidden"
          >
            {NAV.map((n, i) => (
              <motion.div
                key={n.href}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.08 + i * 0.06,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="t-display block py-2 text-[13vw] leading-[1.02]"
                >
                  {n.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
