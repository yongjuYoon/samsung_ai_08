const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const labels=(process.argv[3]||'').split(',');
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p);
  const r=await p.evaluate((labels)=>{
    const out={};
    labels.forEach(lab=>{
      const a=[...document.querySelectorAll('a')].find(x=>x.textContent.trim()===lab);
      out[lab]=a?a.href:null;
    });
    return out;
  },labels);
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
