const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const urls=process.argv.slice(2);
  const b=await launchBrowser(); const c=await newContext(b,{height:1200}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:1200});
  for(const url of urls){
    try{
      await gotoRetry(p,url,'commit'); await p.waitForTimeout(9000); await dismissPopups(p).catch(()=>{});
      // click a 후기/리뷰 tab if present
      try{ const tab=await p.$('text=/후기|리뷰/'); if(tab) await tab.click({timeout:3000}); }catch(e){}
      for(let y=0;y<20000;y+=1200){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(400);}
      await p.waitForTimeout(1500);
      const r=await p.evaluate(()=>{
        const t=document.body.innerText;
        // review-like sentences: contain 사진 and 일러스트/캐리커/그림, longer than 15 chars, Korean sentence
        const lines=t.split('\n').map(s=>s.trim()).filter(l=>l.length>15 && /사진/.test(l) && /(일러스트|캐리커|그림|드로잉|대신|부담|넣기)/.test(l));
        return [...new Set(lines)].slice(0,6);
      });
      console.log('URL',url.slice(40,60),'HITS',JSON.stringify(r,null,0));
      if(r.length){ console.log('>>> FOUND on',url.split('?')[0]); break; }
    }catch(e){console.log('err',e.message.slice(0,40));}
  }
  await b.close();
})();
