import Link from "next/link";
import { CATEGORIES, SEASONS, MEMBERS, VILLAGE_COUNT } from "@/data/members";
import { Sprig } from "@/components/floral";

export function Footer() {
  return (
    <footer className="px-6 pt-24 pb-14 sm:px-10">
      <div className="mx-auto max-w-[1280px]">
        <Sprig className="mx-auto h-6 w-[220px]" />

        <div className="mt-16 grid gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="display text-[30px] leading-[1.1] sm:text-[34px]">
              Every season of life
              <br />
              deserves a village.
            </p>
            <p className="prose-warm mt-6 max-w-[34ch] text-[14px]">
              Connecting trusted local businesses, resources, and families across Hampton Roads.
            </p>
            <p className="mt-7 text-[12.5px] text-ink-faint">
              Presented by{" "}
              <Link
                href="/village/bless-this-mess-cleaning"
                className="text-ink-soft underline decoration-brass/40 underline-offset-4 transition-colors duration-500 hover:text-bell-deep"
              >
                Bless This Mess Cleaning
              </Link>
            </p>
          </div>

          <nav aria-label="Browse by need">
            <p className="eyebrow">What you need</p>
            <ul className="mt-5 space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/village?c=${c.slug}`}
                    className="text-[13.5px] text-ink-soft transition-colors duration-500 hover:text-bell-deep"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Browse by season">
            <p className="eyebrow">Where you are</p>
            <ul className="mt-5 space-y-2.5">
              {SEASONS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/seasons/${s.slug}`}
                    className="text-[13.5px] text-ink-soft transition-colors duration-500 hover:text-bell-deep"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-16 text-[12px] text-ink-faint">
          {VILLAGE_COUNT} local businesses · Proudly serving Hampton Roads · &copy;{" "}
          {new Date().getFullYear()} The Village Collective
        </p>
        {/*
          Keys of Moon release their free tracks under Creative Commons
          Attribution, so the credit is a licence condition, not a courtesy.
          Do not remove it while the track is on the site.
        */}
        <p className="mt-2 text-[11px] text-ink-faint/80">
          Music: &ldquo;White Petals&rdquo; by Keys of Moon, licensed under Creative Commons
          Attribution
        </p>
      </div>
    </footer>
  );
}
