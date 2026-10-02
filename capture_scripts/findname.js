const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const kw=process.argv[3];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(12000); await dismissPopups(p);
  for(let y=0;y<9000;y+=500){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(500);}
  await p.waitForTimeout(1500);
  const r=await p.evaluate((kw)=>{
    const out=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const id=(a.href.match(/CardDetail\/(\d+)/)||[])[1];
      const img=a.querySelector('img'); const code=(img&&(img.src||'').match(/\/([A-Z]{2,3}\d{3,4})\//)||[])[1];
      // name: look at sibling text / parent text excluding price
      const cont=a.closest('li')||a.parentElement;
      let txt=cont?cont.innerText.replace(/\s+/g,' ').trim():'';
      const nameM=txt.match(/([가-힣A-Za-z().\s]{2,30}?)\s*\d{2,3},\d{3}원/);
      const name=nameM?nameM[1].trim():txt.slice(0,25);
      if(id&&kw&&name.includes(kw)) out.push({id,code,name});
    });
    return out;
  },kw);
  console.log(JSON.stringify(r,null,1));
  await b.close();
})();
