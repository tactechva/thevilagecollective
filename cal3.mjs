import { chromium } from 'playwright';
const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('http://localhost:4311/',{waitUntil:'networkidle'});
await pg.waitForTimeout(2800);
const H=await pg.evaluate(()=>document.querySelector('main .sticky').parentElement.getBoundingClientRect().height);
const N=56, s=[];
for (let i=0;i<=N;i++){
  await pg.evaluate(y=>window.scrollTo(0,y), Math.round((H-900)*(i/N)));
  await pg.waitForTimeout(2200);          // long settle: the spring must finish, or lag fakes a lurch
  s.push(await pg.evaluate(()=>{
    const o=document.querySelector('main .sticky .absolute.top-1\\/2.left-1\\/2');
    const mo=new DOMMatrix(getComputedStyle(o).transform);
    const mi=new DOMMatrix(getComputedStyle(o.firstElementChild).transform);
    return {s:mo.a,x:mi.e,y:mi.f};
  }));
}
const ss=(H-900)/N;
const step=s.slice(1).map((v,i)=>Math.hypot(v.x-s[i].x,v.y-s[i].y)*v.s);
const moving=step.filter(v=>v/ss>0.15);
const mean=step.reduce((a,c)=>a+c,0)/step.length;
const jerk=step.slice(1).map((v,i)=>Math.abs(v-step[i]));
console.log('peak camera px / scroll px  ', (Math.max(...step)/ss).toFixed(2));
console.log('mean while moving           ', (moving.reduce((a,c)=>a+c,0)/moving.length/ss).toFixed(2));
console.log('burstiness (peak / moving)  ', (Math.max(...step)/(moving.reduce((a,c)=>a+c,0)/moving.length)).toFixed(2));
console.log('worst jerk                  ', (Math.max(...jerk)/ss).toFixed(2),'px/px');
console.log('zoom swing                  ', (Math.max(...s.map(v=>v.s))/Math.min(...s.map(v=>v.s))).toFixed(2)+'x');
await b.close();
