const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,'https://www.barunsoncard.com/Product/CardList?cate1=청첩장&cate2=콜라보','commit');
  await p.waitForTimeout(13000); await dismissPopups(p);
  for(let y=0;y<4000;y+=500){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(600);}
  await p.waitForTimeout(1500);
  const items=await p.evaluate(()=>{
    const out=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const id=(a.href.match(/CardDetail\/(\d+)/)||[])[1];
      const img=a.querySelector('img'); const code=(img&&(img.src||'').match(/\/([A-Z]{2,3}\d{3,4})\//)||[])[1];
      const cont=a.closest('li,div,article')||a;
      const name=cont.textContent.replace(/\s+/g,' ').trim().slice(0,45);
      if(id) out.push({id,code,name});
    });
    const seen=new Set(); return out.filter(x=>!seen.has(x.id)&&seen.add(x.id)).slice(0,16);
  });
  console.log('COUNT',items.length);
  items.forEach(i=>console.log(i.id,'|',i.code,'|',i.name));
  await b.close();
})();
