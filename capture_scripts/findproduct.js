// node findproduct.js <listUrl> <nameNeedle>
const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const needle=process.argv[3];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p); await autoScroll(p); await p.waitForTimeout(1500);
  const res=await p.evaluate((needle)=>{
    const out=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const txt=(a.closest('li,div,article')||a).textContent.replace(/\s+/g,' ').trim().slice(0,80);
      out.push({href:a.href, txt});
    });
    // dedupe
    const seen=new Set(); const uniq=out.filter(o=>{if(seen.has(o.href))return false;seen.add(o.href);return true;});
    const match=needle?uniq.filter(o=>o.txt.includes(needle)):uniq;
    return {total:uniq.length, match:match.slice(0,10), sample:uniq.slice(0,6)};
  },needle);
  console.log(JSON.stringify(res,null,1));
  await b.close();
})();
