const { launchBrowser, newContext, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b,{height:1200}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:1200});
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(10000);
  // hide delivery popup
  await p.evaluate(()=>{document.querySelectorAll('[class*=modal],[class*=popup],[class*=layer],[class*=dim]').forEach(e=>{if(/예상 도착일/.test(e.textContent))e.style.display='none';});});
  for(let y=0;y<18000;y+=1000){ await p.evaluate(yy=>scrollTo(0,yy),y); await p.waitForTimeout(400); }
  await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
    // find elements that look like review items: contain star rating text or '리뷰'/'후기'
    const full=document.body.innerText;
    const idx=full.search(/리뷰\s*\d+개|포토리뷰|BEST리뷰|구매평|REVIEW/i);
    return {pageH:document.documentElement.scrollHeight, tail:full.slice(Math.max(0,idx-100), idx+1400)};
  });
  console.log('pageH',r.pageH);
  console.log(r.tail);
  await b.close();
})();
