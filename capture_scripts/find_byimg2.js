const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const code=process.argv[3];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p);
  for(let y=0;y<8000;y+=500){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(500);}
  await p.waitForTimeout(1500);
  const res=await p.evaluate((code)=>{
    const map=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const img=a.querySelector('img'); let src=img?(img.currentSrc||img.src||img.getAttribute('data-src')||img.getAttribute('data-original')||''):'';
      const m=src.match(/barunson[a-z]*\/([A-Z]{2}\d{3,4})/i);
      map.push({id:(a.href.match(/CardDetail\/(\d+)/)||[])[1], code:m?m[1]:null, src:src.slice(-40)});
    });
    const hit=map.find(x=>x.code===code);
    const sample=map.slice(0,5);
    return {total:map.length, hit, sample, codesSeen:[...new Set(map.map(x=>x.code).filter(Boolean))].slice(0,30)};
  },code);
  console.log(JSON.stringify(res,null,1));
  await b.close();
})();
