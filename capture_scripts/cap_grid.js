const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry, installRetryRouting, verifyPng } = require('./lib');
(async()=>{
  const url=process.argv[2]; const out=process.argv[3]; const vh=parseInt(process.argv[4]||'1300',10);
  const b=await launchBrowser(); const c=await newContext(b,{height:vh}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:vh});
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(12000); await dismissPopups(p);
  await autoScroll(p); await p.waitForTimeout(1500); // trigger all lazy loads
  // find the product grid: the container holding the most product_detail cards with prices
  const pos=await p.evaluate(()=>{
    const cards=[...document.querySelectorAll('a[href*="product_detail"]')].filter(a=>/원/.test(a.textContent));
    if(cards.length<2) return {count:cards.length};
    // y of the first card that has price
    const first=cards[0]; const r=first.getBoundingClientRect();
    // sample names
    const names=cards.slice(0,6).map(a=>a.textContent.replace(/\s+/g,' ').trim().slice(0,50));
    return {count:cards.length, firstY:Math.round(r.top+window.scrollY), names};
  });
  if(!pos.firstY){console.log(JSON.stringify({ok:false,pos})); await b.close(); return;}
  await p.evaluate((y)=>window.scrollTo(0,y-40), pos.firstY);
  await p.waitForTimeout(2500);
  await p.screenshot({path:out});
  const v=verifyPng(out);
  console.log(JSON.stringify({ok:v.ok,size:v.size,count:pos.count,names:pos.names}));
  await b.close();
})();
