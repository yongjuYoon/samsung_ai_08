const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting, verifyPng } = require('./lib');
(async()=>{
  const url=process.argv[2]; const out=process.argv[3];
  const b=await launchBrowser(); const c=await newContext(b,{height:1150}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:1150});
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(9000); await dismissPopups(p).catch(()=>{});
  for(let y=0;y<24000;y+=1000){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(350);}
  await p.waitForTimeout(1000);
  // find a real review sentence element and scroll it near top
  const y=await p.evaluate(()=>{
    const el=[...document.querySelectorAll('*')].find(e=>e.children.length===0 && /청첩장하시고 싶으신분들 강추|귀엽고 심플한 디자인에 만족|반응도 좋았/.test(e.textContent||''));
    if(!el) {const any=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&/강추|만족했어요|귀여워/.test(e.textContent||'')&&(e.textContent||'').length>14); if(any){any.scrollIntoView({block:'center'});const r=any.getBoundingClientRect();return Math.round(r.top+window.scrollY);} return null;}
    el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return Math.round(r.top+window.scrollY);
  });
  if(y) { await p.evaluate(yy=>window.scrollTo(0,Math.max(0,yy-250)),y); await p.waitForTimeout(1500); }
  await p.screenshot({path:out});
  const v=verifyPng(out); console.log(JSON.stringify({ok:v.ok,size:v.size,y}));
  await b.close();
})();
