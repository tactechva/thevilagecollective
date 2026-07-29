"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CATEGORIES, SERVICE_MODEL_LABEL, type Member } from "@/data/members";
import { MemberPlate } from "@/components/member-plate";
import { ForgetMeNot } from "@/components/floral";

/*
  The full village. Filtering is over 39 records in memory, instant, no spinner.

  Deliberately absent: any sort-by-rating or "featured first". Order is Jessica's
  (Bless This Mess first, then alphabetical) and never changes by quality, because
  there is no quality ranking here. Members differ by FIT, which is what the
  service line under each name is for.
*/
export function VillageIndex({
  members,
  initialCategory,
}: {
  members: Member[];
  initialCategory?: string;
}) {
  const [cat, setCat] = useState<string | null>(initialCategory ?? null);
  const [q, setQ] = useState("");

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
      <div className="border-y border-brass/20 py-6">
        <label className="flex items-center gap-3">
          <span className="sr-only">Search the village</span>
          <ForgetMeNot size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a name, a need, or a city"
            className="w-full bg-transparent text-[16px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="shrink-0 text-[12px] text-ink-faint transition-colors duration-500 hover:text-ink"
            >
              clear
            </button>
          )}
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5">
        <Pill active={cat === null} onClick={() => setCat(null)}>
          Everyone <Num n={members.length} />
        </Pill>
        {CATEGORIES.map((c) => {
          const n = members.filter((m) => m.categories.includes(c.slug)).length;
          return (
            <Pill key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.label} <Num n={n} />
            </Pill>
          );
        })}
      </div>

      <p className="eyebrow mt-10" aria-live="polite">
        {shown.length === members.length ? `All ${members.length}` : `${shown.length} of ${members.length}`}
      </p>

      {shown.length === 0 ? (
        <div className="py-24 text-center">
          <p className="display text-[clamp(1.5rem,2.6vw,2.1rem)]">
            No one in the village does that yet.
          </p>
          <p className="prose-warm mx-auto mt-4 max-w-[42ch] text-[14.5px]">
            The village is still growing. Try another word, or browse everyone.
          </p>
          <button
            onClick={() => {
              setQ("");
              setCat(null);
            }}
            className="mt-8 rounded-full px-6 py-3 text-[12.5px] text-ink-soft ring-1 ring-brass/40 transition-colors duration-500 hover:text-bell-deep hover:ring-bell"
          >
            Show everyone
          </button>
        </div>
      ) : (
        <ul className="mt-4">
          {shown.map((m, i) => (
            <motion.li
              key={m.slug}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.02, 0.3) }}
              className="border-b border-brass/20 first:border-t"
            >
              <Link
                href={`/village/${m.slug}`}
                className="group grid grid-cols-[64px_1fr_auto] items-center gap-5 py-5 sm:grid-cols-[84px_1fr_auto] sm:gap-8"
              >
                <MemberPlate
                  member={m}
                  sizes="84px"
                  priority={i < 8}
                  className="aspect-square w-full"
                />
                <div className="min-w-0">
                  <h2 className="display text-[clamp(1.2rem,2.1vw,1.7rem)] leading-[1.1] transition-colors duration-500 group-hover:text-bell-deep">
                    {m.title}
                  </h2>
                  <p className="prose-warm mt-1 truncate text-[13.5px]">{m.tagline}</p>
                  <p className="eyebrow mt-2">
                    {SERVICE_MODEL_LABEL[m.serviceModel]} · {m.serviceArea}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="text-ink-faint transition-all duration-500 group-hover:translate-x-1 group-hover:text-bell"
                >
                  &rarr;
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}

      <p className="prose-warm mt-16 text-[13px]">
        Every business here is one Jessica knows personally. Nothing is ranked, nothing is
        sponsored, and browsing is free.
      </p>
    </>
  );
}

function Pill({
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
      className={`text-[13px] transition-colors duration-500 ${
        active
          ? "text-ink underline decoration-bell decoration-2 underline-offset-[6px]"
          : "text-ink-faint hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Num({ n }: { n: number }) {
  return <span className="text-[10.5px] tabular-nums opacity-60">{n}</span>;
}
