import { chromium } from 'playwright';
const OUT='/private/tmp/claude-501/-Users-cadentacoronte-BTM/a36f7dd1-2f34-4f32-b9dd-0c9968a1d1f3/scratchpad/shots';
const b = await chromium.launch();
for (const [w,h,tag] of [[1600,900,'wide'],[1440,900,'desk'],[390,844,'mob']]) {
  const pg = await b.newPage({ viewport:{width:w,height:h} });
  await pg.goto('http://localhost:4311/', { waitUntil:'networkidle' });
  await pg.evaluate(async () => {
    document.documentElement.style.scrollBehavior='auto';
    const t=900; const s=document.documentElement.scrollTop;
    for (let i=1;i<=30;i++){ document.documentElement.scrollTop = s+(t-s)*i/30; await new Promise(r=>requestAnimationFrame(r)); }
  });
  await pg.waitForTimeout(900);
  const info = await pg.evaluate(() => {
    const img=[...document.querySelectorAll('header img, nav img, a[href="/"] img')][0];
    const word=[...document.querySelectorAll('a[href="/"] span')].find(s=>s.textContent.includes('Village Collective'));
    const r=img?.getBoundingClientRect(), t=word?.getBoundingClientRect();
    const cs=img?getComputedStyle(img):null;
    return {
      markLeft: r?Math.round(r.left):null, markTop: r?Math.round(r.top):null,
      markW: r?Math.round(r.width):null, markH: r?Math.round(r.height):null,
      wordLeft: t?Math.round(t.left):null,
      square: r?Math.abs(r.width-r.height)<1:null,
      rotated: cs?/matrix|rotate/.test(cs.transform)&&cs.transform!=='none':null,
      transform: cs?cs.transform:null,
      opacity: img?+(+getComputedStyle(img.parentElement).opacity).toFixed(2):null,
    };
  });
  console.log(tag.padEnd(5), JSON.stringify(info));
  await pg.screenshot({ path:`${OUT}/nav-${tag}.png`, clip:{x:0,y:0,width:Math.min(w,700),height:120} });
  await pg.close();
}
await b.close();
