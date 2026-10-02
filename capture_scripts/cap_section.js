// node cap_section.js <url> <needle> <out> [vh] [offset]  (env PRECLICK to click a tab first)
const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting, verifyPng } = require('./lib');
(async()=>{
  const url=process.argv[2]; const needle=process.argv[3]; const out=process.argv[4];
  const vh=parseInt(process.argv[5]||'1100',10); const offset=parseInt(process.argv[6]||'0',10);
  const noDismiss=process.env.NODISMISS==='1';
  const b=await launchBrowser(); const c=await newContext(b,{height:vh}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:vh});
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000);
  if(!noDismiss){ await dismissPopups(p); await p.waitForTimeout(800); }
  if(process.env.PRECLICK){ try{ await p.getByText(process.env.PRECLICK,{exact:false}).first().click({timeout:6000}); await p.waitForTimeout(3000);}catch(e){console.error('preclick',e.message);} }
  // incremental scroll to trigger lazy content
  for(let y=0;y<16000;y+=vh-200){ await p.evaluate(yy=>window.scrollTo(0,yy),y); await p.waitForTimeout(500); }
  const box=await p.evaluate((needle)=>{
    const els=[...document.querySelectorAll('body *')].filter(e=>e.textContent.includes(needle)&&e.getClientRects().length);
    if(!els.length) return null;
    // smallest
    els.sort((a,b)=>(a.getBoundingClientRect().height*a.getBoundingClientRect().width)-(b.getBoundingClientRect().height*b.getBoundingClientRect().width));
    const el=els[0]; el.scrollIntoView({block:'start'});
    return {y:Math.round(el.getBoundingClientRect().top+window.scrollY)};
  },needle);
  if(!box){ console.log(JSON.stringify({ok:false,reason:'needle not found'})); await b.close(); return; }
  await p.evaluate((y)=>window.scrollTo(0,Math.max(0,y-60)),box.y+offset);
  await p.waitForTimeout(2000);
  await dismissPopups(p).catch(()=>{});
  await p.evaluate((y)=>window.scrollTo(0,Math.max(0,y-60)),box.y+offset);
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{document.querySelectorAll('[class*=modal],[class*=popup],[class*=layer],[class*=dim]').forEach(e=>{const t=e.textContent||'';if(/예상 도착일|배송비 무료|쿠폰|이벤트 참여/.test(t)&&e.getBoundingClientRect().width>200)e.style.display='none';});});
  await p.waitForTimeout(500);
  await p.screenshot({path:out});
  const v=verifyPng(out); console.log(JSON.stringify({ok:v.ok,size:v.size,y:box.y}));
  await b.close();
})();
