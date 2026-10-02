const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const pat=process.argv[3]?new RegExp(process.argv[3],'i'):null;
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(10000); await dismissPopups(p); await autoScroll(p); await p.waitForTimeout(1500);
  const links=await p.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>({h:a.href,t:(a.textContent||'').replace(/\s+/g,' ').trim().slice(0,25)})));
  const uniq=[...new Map(links.map(l=>[l.h,l])).values()];
  const out=pat?uniq.filter(l=>pat.test(l.h)||pat.test(l.t)):uniq;
  console.log('total',uniq.length);
  out.slice(0,40).forEach(l=>console.log(l.h,'||',l.t));
  await b.close();
})();
