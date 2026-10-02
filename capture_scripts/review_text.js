const { launchBrowser, newContext, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(10000);
  await p.evaluate(()=>{document.querySelectorAll('[class*=modal],[class*=popup],[class*=layer]').forEach(e=>{if(/예상 도착일/.test(e.textContent))e.style.display='none';});});
  for(let y=0;y<20000;y+=1000){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(350);}
  const t=await p.evaluate(()=>document.body.innerText);
  const idx=t.search(/구매후기|후기 \(/);
  console.log('PRODUCT', (t.match(/[가-힣A-Za-z()\s]{2,20}\s(BC|BH|DDC)\d{3,4}/)||[''])[0].trim());
  const kw=['사진','인쇄','선명','색감','화질','퀄리티','프린트'];
  console.log('KEYWORDS', kw.filter(k=>t.slice(idx).includes(k)).join(','));
  await b.close();
})();
