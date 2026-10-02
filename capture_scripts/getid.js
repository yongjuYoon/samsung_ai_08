const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p);
  for(let y=0;y<2500;y+=600){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(700);}
  const ids=await p.evaluate(()=>[...new Set([...document.querySelectorAll('a[href*="CardDetail"]')].map(a=>a.href))]);
  console.log(ids.slice(0,5).join('\n'));
  await b.close();
})();
