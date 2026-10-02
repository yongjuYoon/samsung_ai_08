const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const code=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  const hits=[];
  p.on('response',async r=>{ try{ const u=r.url(); if(r.request().resourceType()==='image')return; const ct=r.headers()['content-type']||''; if(!/json|text/.test(ct))return; const t=await r.text(); if(t.includes(code)){ hits.push({url:u.slice(0,80), idx:t.indexOf(code), frag:t.slice(Math.max(0,t.indexOf(code)-150),t.indexOf(code)+30)}); } }catch(e){} });
  await gotoRetry(p,'https://www.barunsoncard.com/Product/CardList?keyword='+code,'commit');
  await p.waitForTimeout(13000); await dismissPopups(p);
  for(let y=0;y<2000;y+=600){await p.evaluate(yy=>scrollTo(0,yy),y);await p.waitForTimeout(900);}
  const dom=await p.evaluate(()=>({cards:[...new Set([...document.querySelectorAll('a[href*=CardDetail]')].map(a=>a.href))].slice(0,8)}));
  console.log('API HITS',hits.length); hits.slice(0,3).forEach(h=>console.log(h.url,'::',JSON.stringify(h.frag)));
  console.log('DOM cards:',JSON.stringify(dom.cards));
  await b.close();
})();
