const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry, installRetryRouting, verifyPng } = require('./lib');
(async()=>{
  const url=process.argv[2]; const out=process.argv[3];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(12000); await dismissPopups(p);
  await autoScroll(p); await p.waitForTimeout(1500);
  await p.evaluate(()=>{ document.querySelectorAll('.layer_jehulogin,[class*=layer_jehu]').forEach(e=>e.style.display='none'); });
  // locate the price section container: the closest common ancestor of the price tables
  const sel = await p.evaluate(()=>{
    const priceTables=[...document.querySelectorAll('table')].filter(t=>/장당/.test(t.textContent)&&/50장/.test(t.textContent));
    if(!priceTables.length) return null;
    // give the section an id for capture
    let node=priceTables[0];
    // climb up to a wrapper that contains all price tables but isn't the whole page
    let wrap=node.parentElement;
    for(let i=0;i<4 && wrap && wrap.parentElement;i++){ if(wrap.querySelectorAll('table').length>=priceTables.length) break; wrap=wrap.parentElement;}
    wrap.setAttribute('data-capme','1');
    return {tables:priceTables.length};
  });
  if(!sel){console.log(JSON.stringify({ok:false,reason:'no price tables'})); await b.close(); return;}
  const el=p.locator('[data-capme="1"]').first();
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await el.screenshot({path:out});
  const v=verifyPng(out);
  console.log(JSON.stringify({ok:v.ok,size:v.size,info:sel}));
  await b.close();
})();
