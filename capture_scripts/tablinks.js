const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p);
  const res=await p.evaluate(()=>{
    return [...document.querySelectorAll('a')].filter(a=>a.getBoundingClientRect().top<520 && a.getBoundingClientRect().top>60)
      .map(a=>({t:a.textContent.replace(/\s+/g,' ').trim().slice(0,20), href:a.getAttribute('href')}))
      .filter(x=>x.t);
  });
  console.log(JSON.stringify(res,null,0).slice(0,1500));
  await b.close();
})();
