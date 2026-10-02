const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const keyword=process.argv[2]; const code=process.argv[3];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,'https://www.barunsoncard.com/Product/CardList?keyword='+encodeURIComponent(keyword),'commit');
  await p.waitForTimeout(12000); await dismissPopups(p);
  for(let y=0;y<4000;y+=600){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(800);}
  const res=await p.evaluate((code)=>{
    const out=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const img=a.querySelector('img'); const src=img?(img.src||img.getAttribute('data-src')||''):'';
      const all=a.innerHTML;
      if(src.includes(code)||all.includes(code)) out.push(a.href);
    });
    // also global: any img with code
    const imgs=[...document.querySelectorAll('img')].map(i=>i.src||i.getAttribute('data-src')||'').filter(s=>s.includes(code));
    return {matchLinks:[...new Set(out)], imgsWithCode:imgs.slice(0,3), totalCards:document.querySelectorAll('a[href*=CardDetail]').length};
  },code);
  console.log(JSON.stringify(res,null,1));
  await b.close();
})();
