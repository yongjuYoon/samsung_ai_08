const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const want=process.argv[3];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p);
  for(let y=0;y<9000;y+=500){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(450);}
  const pairs=await p.evaluate(()=>{
    const out=[];
    document.querySelectorAll('a[href*="CardDetail"]').forEach(a=>{
      const id=(a.href.match(/CardDetail\/(\d+)/)||[])[1];
      const img=a.querySelector('img'); const code=(img&&(img.src||'').match(/\/([A-Z]{2,3}\d{3,4})\//)||[])[1];
      if(id&&code) out.push(id+'|'+code);
    });
    return [...new Set(out)];
  });
  const hit=pairs.find(x=>x.endsWith('|'+want));
  console.log('COUNT',pairs.length,'WANT',want,'=>',hit||'NOT FOUND');
  console.log('codes:',pairs.map(x=>x.split('|')[1]).join(','));
  await b.close();
})();
