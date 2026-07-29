import { chromium } from 'playwright';
import fs from 'node:fs';

/*
  Where frames land. Was an absolute path into one machine's temp directory,
  which is no use to anyone else who checks this out. Override with SHOTS_DIR.
*/
const SITE = process.env.SITE || 'http://localhost:4311';
const OUT = process.env.SHOTS_DIR || '.shots';
fs.mkdirSync(OUT, { recursive: true });
const W = Number(process.argv[2] || 1440);
const H = Number(process.argv[3] || 900);
const TAG = process.argv[4] || 'd';

const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
pg.on('pageerror', e => errors.push('PAGEERROR ' + e.message));

await pg.goto(SITE, { waitUntil: 'networkidle' });
await pg.waitForTimeout(1200);

// the scroll world is the sticky element's parent, NOT main's first child —
// template.tsx now renders a fixed route veil first, which is viewport-height.
const worldH = await pg.evaluate(() => {
  const sticky = document.querySelector('main .sticky');
  return (sticky?.parentElement ?? document.querySelector('main > div')).offsetHeight;
});
const max = worldH - H;

// smooth-scroll in real increments so Motion's scroll listener fires naturally
async function goTo(target) {
  await pg.evaluate(async (t) => {
    const start = document.documentElement.scrollTop;
    const steps = 26;
    for (let i = 1; i <= steps; i++) {
      document.documentElement.scrollTop = start + ((t - start) * i) / steps;
      await new Promise(r => requestAnimationFrame(r));
    }
  }, target);
  await pg.waitForTimeout(900); // let the spring settle
}

const marks = [
  ['00-arrival', 0],
  ['01-forming', 0.035],
  ['02-formed', 0.075],
  ['03-depart', 0.13],
  ['04-station1', 0.1525],
  ['05-between', 0.205],
  ['06-station2', 0.2575],
  ['07-station3', 0.3625],
  ['08-station5', 0.5725],
  ['09-station8', 0.8875],
  ['10-outro', 0.98],
];

const report = [];
for (const [name, frac] of marks) {
  await goTo(Math.round(max * frac));
  await pg.screenshot({ path: `${OUT}/${TAG}-${name}.png` });
  const info = await pg.evaluate(() => {
    const vis = [...document.querySelectorAll('main a[href^="/seasons/"]')].map(a => {
      const wr = a.closest('div.absolute');
      if (!wr) return null;
      const r = wr.getBoundingClientRect();
      const op = +getComputedStyle(wr).opacity;
      const on = r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
      return { t: a.querySelector('h2')?.textContent.trim().slice(0, 20) || '?', op: +op.toFixed(2), on };
    }).filter(Boolean).filter(s => s.op > 0.25 && s.on);
    // cumulative opacity up the ancestor chain — the h1's direct parent is the
    // load-in wrapper, which always sits at 1, so reading it alone lies.
    const h1 = document.querySelector('h1');
    let op = null;
    if (h1) {
      op = 1;
      for (let el = h1; el && el !== document.body; el = el.parentElement) {
        op *= +getComputedStyle(el).opacity;
      }
      op = +op.toFixed(2);
    }
    return { onScreen: vis, titleOp: op };
  });
  report.push({ name, frac, ...info });
}

console.log(JSON.stringify({ viewport: `${W}x${H}`, worldH, errors: [...new Set(errors)].slice(0, 6), report }, null, 1));
await b.close();
