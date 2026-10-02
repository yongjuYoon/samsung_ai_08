const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b,{height:1200}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:1200});
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(9000); await dismissPopups(p).catch(()=>{});
  for(let y=0;y<22000;y+=1000){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(400);}
  await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
    const t=document.body.innerText;
    const idx=t.indexOf('후기');
    // grab lines that look like real review sentences (end with 요/다/음 ., korean, 12-120 chars)
    const lines=t.split('\n').map(s=>s.trim()).filter(l=>l.length>=12&&l.length<=140&&/[가-힣]/.test(l)&&/(요|다|니다|음|어요|네요|습니다|좋|예뻐|만족|추천)/.test(l));
    return {reviewIdx:idx, total:t.length, sample:[...new Set(lines)].slice(-25)};
  });
  console.log('reviewIdx',r.reviewIdx,'len',r.total);
  r.sample.forEach(s=>console.log('·',s));
  await b.close();
})();
