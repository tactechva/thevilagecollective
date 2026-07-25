"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { MemberCard } from "@/components/member-card";
import { CATEGORIES, SERVICE_MODEL_LABEL, type Member } from "@/data/members";

/*
  Filtering is client-side over 39 records — instant, no network, no spinner.

  Deliberately absent: any sort-by-rating or "featured first" control. Order is
  Jessica's order (Bless This Mess first, then alphabetical) and never changes
  based on quality, because there is no quality ranking here.
*/
export function VillageGrid({
  members,
  initialCategory,
}: {
  members: Member[];
  initialCategory?: string;
}) {
  const [cat, setCat] = useState<string | null>(initialCategory ?? null);
  const [q, setQ] = useState("");
  const reduce = useReducedMotion();

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return members.filter((m) => {
      if (cat && !m.categories.includes(cat)) return false;
      if (!needle) return true;
      return (
        m.title.toLowerCase().includes(needle) ||
        m.tagline.toLowerCase().includes(needle) ||
        m.serviceArea.toLowerCase().includes(needle) ||
        SERVICE_MODEL_LABEL[m.serviceModel].toLowerCase().includes(needle) ||
        m.bio.toLowerCase().includes(needle)
      );
    });
  }, [members, cat, q]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <label className="group relative flex items-center border-b border-brass/30 transition-colors duration-500 ease-drift focus-within:border-bluebell">
          <MagnifyingGlassIcon
            size={16}
            weight="light"
            className="shrink-0 text-ink-faint"
            aria-hidden="true"
          />
          <span className="sr-only">Search the village</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a name, a need, or a city"
            className="w-full bg-transparent px-3 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="shrink-0 p-1 text-ink-faint transition-colors duration-500 ease-drift hover:text-ink"
            >
              <XIcon size={14} weight="light" />
            </button>
          )}
        </label>

        <div className="flex flex-wrap gap-2">
          <FilterPill active={cat === null} onClick={() => setCat(null)}>
            Everyone
            <Count n={members.length} />
          </FilterPill>
          {CATEGORIES.map((c) => {
            const n = members.filter((m) => m.categories.includes(c.slug)).length;
            return (
              <FilterPill key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
                {c.label}
                <Count n={n} />
              </FilterPill>
            );
          })}
        </div>
      </div>

      <p className="mt-10 text-[12px] tracking-[0.14em] text-ink-faint uppercase" aria-live="polite">
        {shown.length === members.length
          ? `All ${members.length}`
          : `${shown.length} of ${members.length}`}
      </p>

      {shown.length === 0 ? (
        <div className="border-t border-brass/20 py-24 text-center">
          <p className="t-display text-[clamp(1.5rem,2.6vw,2.1rem)]">
            No one here matches that yet.
          </p>
          <p className="mx-auto mt-4 max-w-[42ch] text-[14.5px] leading-relaxed text-ink-soft">
            The village is still growing. Try a different word, or browse everyone.
          </p>
          <button
            onClick={() => {
              setQ("");
              setCat(null);
            }}
            className="mt-8 rounded-full border border-brass/40 px-6 py-3 text-[12px] tracking-[0.12em] text-ink uppercase transition-all duration-700 ease-drift hover:border-bluebell hover:text-bluebell-deep active:scale-[0.985]"
          >
            Show everyone
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m, i) =>
            reduce ? (
              <MemberCard key={m.slug} member={m} priority={i < 6} />
            ) : (
              <motion.div
                key={m.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <MemberCard member={m} priority={i < 6} />
              </motion.div>
            ),
          )}
        </div>
      )}

      <p className="mt-20 border-t border-brass/20 pt-8 text-[13px] leading-relaxed text-ink-faint">
        Every business here is one Jessica knows personally. Nothing is ranked, nothing is
        sponsored, and browsing is free.{" "}
        <Link
          href="/about"
          className="text-ink-soft transition-colors duration-500 ease-drift hover:text-bluebell"
        >
          How the village works
        </Link>
      </p>
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] tracking-[0.08em] transition-all duration-700 ease-drift active:scale-[0.98] ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-brass/30 text-ink-soft hover:border-bluebell hover:text-bluebell-deep"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className="text-[10.5px] tabular-nums opacity-55">{n}</span>;
}
