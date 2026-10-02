const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const urls=process.argv.slice(2);
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  for(const url of urls){
    try{
      await gotoRetry(p,url,'commit'); await p.waitForTimeout(10000); await dismissPopups(p);
      for(let y=0;y<2000;y+=600){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(600);}
      const r=await p.evaluate(()=>{
        const a=document.querySelector('a[href*="CardDetail"]');
        if(!a) return {id:null};
        const id=(a.href.match(/CardDetail\/(\d+)/)||[])[1];
        const cont=a.closest('li')||a.parentElement;
        const txt=cont?cont.innerText.replace(/\s+/g,' ').trim():'';
        const n=txt.match(/([가-힣A-Za-z().\s]{2,30}?)\s*\d{2,3},\d{3}원/);
        return {id, name:n?n[1].trim():txt.slice(0,25), total:(document.body.innerText.match(/총\s*[0-9]+건/)||[''])[0]};
      });
      console.log(url.split('mdseq=')[1], '=>', JSON.stringify(r));
    }catch(e){console.log(url,'ERR',e.message.slice(0,30));}
  }
  await b.close();
})();
