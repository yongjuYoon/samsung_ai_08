const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const kw=process.argv[3]||'네컷';
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(10000); await dismissPopups(p); await p.waitForTimeout(1500);
  const r=await p.evaluate((kw)=>{
    const imgs=[...document.querySelectorAll('img')].filter(i=>((i.alt||'')+(i.src||'')).includes(kw)).map(i=>({alt:i.alt,src:(i.src||'').slice(-50)}));
    const els=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && (e.textContent||'').includes(kw)).map(e=>e.textContent.trim().slice(0,40));
    const links=[...document.querySelectorAll('a')].filter(a=>((a.textContent||'')+(a.href||'')).includes(kw)).map(a=>({t:a.textContent.trim().slice(0,30),h:a.href}));
    return {imgs:imgs.slice(0,8), textEls:[...new Set(els)].slice(0,8), links:links.slice(0,8)};
  },kw);
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
