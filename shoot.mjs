import { chromium } from 'playwright';

const OUT = '/private/tmp/claude-501/-Users-cadentacoronte-BTM/a36f7dd1-2f34-4f32-b9dd-0c9968a1d1f3/scratchpad/shots';
const W = Number(process.argv[2] || 1440);
const H = Number(process.argv[3] || 900);
const TAG = process.argv[4] || 'd';

const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
pg.on('pageerror', e => errors.push('PAGEERROR ' + e.message));

await pg.goto('http://localhost:4311/', { waitUntil: 'networkidle' });
await pg.waitForTimeout(1200);

const worldH = await pg.evaluate(() => document.querySelector('main > div').offsetHeight);
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
    const h1 = document.querySelector('h1');
    return { onScreen: vis, titleOp: h1 ? +getComputedStyle(h1.parentElement).opacity : null };
  });
  report.push({ name, frac, ...info });
}

console.log(JSON.stringify({ viewport: `${W}x${H}`, worldH, errors: [...new Set(errors)].slice(0, 6), report }, null, 1));
await b.close();
