const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const nameKw=process.argv[3];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p);
  for(let y=0;y<4000;y+=500){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(500);}
  const r=await p.evaluate((nameKw)=>{
    const out=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const id=(a.href.match(/CardDetail\/(\d+)/)||[])[1];
      const img=a.querySelector('img'); const code=(img&&(img.src||'').match(/\/([A-Z]{2,3}\d{3,4})\//)||[])[1];
      const cont=a.closest('li,div,article')||a; const name=cont.textContent.replace(/\s+/g,' ').trim().slice(0,30);
      if(id&&(!nameKw||name.includes(nameKw))) out.push(id+'|'+code+'|'+name);
    });
    return [...new Set(out)];
  },nameKw);
  r.slice(0,20).forEach(x=>console.log(x));
  await b.close();
})();
