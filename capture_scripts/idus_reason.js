const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const urls=process.argv.slice(2);
  const b=await launchBrowser(); const c=await newContext(b,{height:1200}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:1200});
  for(const url of urls){
    try{
      await gotoRetry(p,url,'commit'); await p.waitForTimeout(8000); await dismissPopups(p).catch(()=>{});
      for(let y=0;y<24000;y+=1100){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(350);}
      await p.waitForTimeout(1200);
      const hits=await p.evaluate(()=>{
        const t=document.body.innerText;
        const lines=t.split('\n').map(s=>s.trim()).filter(l=>l.length>=14&&l.length<=160&&/(사진 대신|사진대신|얼굴 넣|부담|사진을 넣|사진보다|실사 대신|사진이 부담|얼굴공개|얼굴 공개|일러스트로 (하|결정|선택))/.test(l));
        return [...new Set(lines)].slice(0,5);
      });
      console.log(url.split('/product/')[1].slice(0,8), JSON.stringify(hits));
      if(hits.length){console.log('>>>FOUND',url.split('?')[0]);break;}
    }catch(e){console.log('err',e.message.slice(0,30));}
  }
  await b.close();
})();
