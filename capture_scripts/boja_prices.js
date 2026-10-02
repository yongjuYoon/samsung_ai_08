const { launchBrowser, newContext, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(9000);
  const r=await p.evaluate(()=>{
    const txt=document.body.innerText;
    const prices=(txt.match(/10부\s*([0-9,]+)\s*원/g)||[]).map(s=>parseInt(s.replace(/[^0-9]/g,'')));
    const inRange=prices.filter(v=>v>=18000&&v<=21000);
    return {total:prices.length, inRange18to21:inRange.length, all:prices.slice(0,60)};
  });
  console.log(JSON.stringify(r));
  await b.close();
})();
