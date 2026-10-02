const { launchBrowser, newContext, dismissPopups } = require('./lib');
(async()=>{
  const b=await launchBrowser(); const c=await newContext(b); const p=await c.newPage();
  await p.goto('https://bojagicard.com/card/',{waitUntil:'commit',timeout:45000});
  await p.waitForTimeout(8000); await dismissPopups(p);
  const box = await p.evaluate(()=>{
    const el=[...document.querySelectorAll('a,button,li,span,div')].find(e=>e.textContent.trim()==='청첩장' && e.offsetParent!==null && e.getBoundingClientRect().top<160);
    if(!el) return null; const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};
  });
  console.log('navbox', JSON.stringify(box));
  if(box){ await p.mouse.move(box.x, box.y); await p.waitForTimeout(2500); await p.mouse.move(box.x, box.y+5); await p.waitForTimeout(2000);}
  const vis = await p.evaluate(()=>{
    const terms=['전체','포토','심플','러블리','셀픽','프리미엄'];
    const out={}; terms.forEach(t=>{const e=[...document.querySelectorAll('*')].find(x=>x.textContent.trim()===t && x.offsetParent!==null); out[t]=!!e;});
    return out;
  });
  console.log('vis', JSON.stringify(vis));
  await p.screenshot({path:'/tmp/claude-0/boja_hover.png'});
  await b.close();
})();
