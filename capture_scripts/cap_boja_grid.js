const { launchBrowser, newContext, gotoRetry, installRetryRouting, verifyPng } = require('./lib');
(async()=>{
  const url=process.argv[2]; const out=process.argv[3]; const vh=parseInt(process.argv[4]||'1300',10); const extra=parseInt(process.argv[5]||'0',10);
  const b=await launchBrowser(); const c=await newContext(b,{height:vh}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:vh});
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(9000);
  for(let y=0;y<=2600;y+=650){ await p.evaluate(yy=>window.scrollTo(0,yy),y); await p.waitForTimeout(1300); }
  const pos=await p.evaluate(()=>{
    const cards=[...document.querySelectorAll('a[href*="product_detail"]')].filter(a=>/부/.test(a.textContent)&&/원/.test(a.textContent));
    if(!cards.length) return {count:0};
    const r=cards[0].getBoundingClientRect();
    return {count:cards.length, firstY:Math.round(r.top+window.scrollY), names:cards.slice(0,4).map(a=>a.textContent.replace(/\s+/g,' ').trim().slice(0,40))};
  });
  if(pos.firstY!==undefined){ await p.evaluate(y=>window.scrollTo(0,y-30),pos.firstY+extra); await p.waitForTimeout(2500); }
  await p.screenshot({path:out});
  const v=verifyPng(out);
  console.log(JSON.stringify({ok:v.ok,size:v.size,count:pos.count,names:pos.names}));
  await b.close();
})();
