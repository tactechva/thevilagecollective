import { chromium } from 'playwright';
const OUT='/private/tmp/claude-501/-Users-cadentacoronte-BTM/a36f7dd1-2f34-4f32-b9dd-0c9968a1d1f3/scratchpad/shots';
const b=await chromium.launch();
for (const [w,h,tag] of [[1440,900,'v-desk'],[390,844,'v-mob']]) {
  const pg=await b.newPage({viewport:{width:w,height:h}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await pg.goto('http://localhost:4311/',{waitUntil:'networkidle'});
  await pg.waitForTimeout(3200);
  await pg.screenshot({path:`${OUT}/${tag}.png`});
  console.log(tag, 'errors:', errs.length?errs.slice(0,2):'none');
  await pg.close();
}
await b.close();
