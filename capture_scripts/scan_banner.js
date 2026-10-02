const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  const urls=['https://www.barunsoncard.com/','https://www.barunsoncard.com/Product/CardList?cate1=청첩장&cate2=포토'];
  for(const url of urls){
    try{
      await gotoRetry(p,url,'commit'); await p.waitForTimeout(9000); await dismissPopups(p).catch(()=>{});
      const r=await p.evaluate(()=>{
        const kws=['네컷','네 컷','4컷','포토부스','필름'];
        const imgs=[...document.querySelectorAll('img')].map(i=>(i.alt||'')+' | '+(i.src||'')).filter(s=>kws.some(k=>s.includes(k)));
        const texts=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&kws.some(k=>(e.textContent||'').includes(k))).map(e=>e.textContent.trim().slice(0,40));
        return {imgs:imgs.slice(0,6),texts:[...new Set(texts)].slice(0,6)};
      });
      console.log(url, JSON.stringify(r));
    }catch(e){console.log(url,'ERR',e.message.split(chr=String.fromCharCode(10))[0]);}
  }
  await b.close();
})();
