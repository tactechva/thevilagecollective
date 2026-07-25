# The Village Collective

A curated directory of trusted local businesses across Hampton Roads, presented by
Bless This Mess Cleaning.

## Run it

```bash
npm install
npm run dev        # http://localhost:4311
```

## Where things live

| Path | What it is |
|---|---|
| `data/members.ts` | The 39 members — typed, hand-corrected, the single source of truth |
| `data/members.enriched.json` | Working data the TS file was generated from |
| `lib/tiles.ts` | Builds the season tiles server-side |
| `components/` | Header, footer, member card/mark, season tiles, directory grid |
| `public/members/` | All 38 member logos, self-hosted (pulled off Wix) |

## Editing members

Everything is one file: `data/members.ts`. Add or edit an entry, commit, deploy.
There is no CMS by design — it keeps the site static and fast.

Each member carries:

- `serviceModel` — how they serve you (`mobile`, `onsite`, `studio`, `office`,
  `maker`, `shop`, `remote`)
- `serviceArea` — where, in plain language
- `areaConfidence` — `"V"` verified by research, `"I"` inferred from the bio copy
- `fit` — `"contain"` letterboxes wide/tall marks so wordmarks are never cropped
- `jessNote` — Jessica's own first-person note, present on 11 of 39
- `categories` / `seasons` — members can belong to several of each

## Two rules the design depends on

1. **Nothing is ranked.** No ratings, no "featured", no sponsored placement.
   Members that look like competitors are differentiated by *fit* — one comes to
   you, one has a studio. Jessica's words: "I love them all."
2. **Bless This Mess is listed first but is never the theme.** TVC is the brand;
   BTM is the presenter.

## Deploying

Built for Vercel. `npm run build` prerenders 54 pages (39 members + 8 seasons +
home, about, seasons index).

Set `NEXT_PUBLIC_SITE_URL` to the real domain so Open Graph URLs resolve.
