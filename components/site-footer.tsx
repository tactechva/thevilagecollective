import Link from "next/link";
import Image from "next/image";
import { InstagramLogoIcon, FacebookLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { CATEGORIES, SEASONS, MEMBERS } from "@/data/members";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-brass/25 px-6 pt-20 pb-12 sm:px-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-14 md:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <Image src="/tvc-mark-keyed.png" alt="" width={92} height={84} className="h-20 w-auto" />
            <p className="t-display mt-6 text-[26px] leading-[1.15]">
              Every season of life
              <br />
              deserves a village.
            </p>
            <p className="mt-5 max-w-[30ch] text-[13.5px] leading-relaxed text-ink-soft">
              Connecting trusted local businesses, resources, and families across Hampton Roads.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://www.instagram.com/bless.this.mess.cleaning/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/30 text-ink-soft transition-all duration-500 ease-drift hover:border-bluebell hover:text-bluebell"
              >
                <InstagramLogoIcon size={17} weight="light" />
              </a>
              <a
                href="https://www.facebook.com/BlessThisMessCleaning/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brass/30 text-ink-soft transition-all duration-500 ease-drift hover:border-bluebell hover:text-bluebell"
              >
                <FacebookLogoIcon size={17} weight="light" />
              </a>
            </div>
          </div>

          <nav aria-label="Browse by need">
            <h2 className="text-[11px] tracking-[0.2em] text-ink-faint uppercase">Browse</h2>
            <ul className="mt-5 space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/village?c=${c.slug}`}
                    className="text-[13.5px] text-ink-soft transition-colors duration-500 ease-drift hover:text-bluebell"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Browse by season">
            <h2 className="text-[11px] tracking-[0.2em] text-ink-faint uppercase">Seasons</h2>
            <ul className="mt-5 space-y-2.5">
              {SEASONS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/seasons/${s.slug}`}
                    className="text-[13.5px] text-ink-soft transition-colors duration-500 ease-drift hover:text-bluebell"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="rule-brass mt-16" />

        <div className="mt-7 flex flex-col gap-3 text-[12px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            The Village Collective · Presented by{" "}
            <Link
              href="/village/bless-this-mess-cleaning"
              className="text-ink-soft transition-colors duration-500 ease-drift hover:text-bluebell"
            >
              Bless This Mess Cleaning
            </Link>
          </p>
          <p>
            {MEMBERS.length} local businesses · Proudly serving Hampton Roads · &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
