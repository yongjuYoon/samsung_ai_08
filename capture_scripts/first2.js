const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const n=parseInt(process.argv[3]||'2',10);
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p);
  for(let y=0;y<2500;y+=600){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(600);}
  const r=await p.evaluate((n)=>{
    const out=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const id=(a.href.match(/CardDetail\/(\d+)/)||[])[1];
      const cont=a.closest('li')||a.parentElement; const txt=cont?cont.innerText.replace(/\s+/g,' ').trim():'';
      const m=txt.match(/([가-힣A-Za-z().\s]{2,30}?)\s*([0-9]{2,3},[0-9]{3})원/);
      if(id) out.push({id, name:m?m[1].trim():'', price:m?m[2]:''});
    });
    const seen=new Set(); return out.filter(x=>!seen.has(x.id)&&seen.add(x.id)).slice(0,n);
  },n);
  console.log(JSON.stringify(r));
  await b.close();
})();
