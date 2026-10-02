const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,'https://www.barunsoncard.com/Product/CardList?cate1=청첩장&cate2=포토','commit');
  await p.waitForTimeout(11000); await dismissPopups(p);
  for(let y=0;y<4000;y+=600){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(700);}
  const items=await p.evaluate(()=>{
    const out=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const id=(a.href.match(/CardDetail\/(\d+)/)||[])[1];
      const cont=a.closest('li,div,article')||a;
      const txt=cont.textContent.replace(/\s+/g,' ');
      // comment count often near a speech icon number; grab trailing numbers
      const nums=(txt.match(/\d{2,4}/g)||[]).map(Number);
      const name=(txt.match(/[가-힣A-Za-z()\s]{2,20}\s*\d{2,3},\d{3}원/)||[''])[0];
      out.push({id, maxnum:Math.max(0,...nums), name:name.slice(0,30)});
    });
    const seen=new Set(); return out.filter(x=>x.id&&!seen.has(x.id)&&seen.add(x.id)).sort((a,b)=>b.maxnum-a.maxnum).slice(0,8);
  });
  console.log(JSON.stringify(items,null,0));
  await b.close();
})();
