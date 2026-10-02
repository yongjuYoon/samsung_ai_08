const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting, verifyPng } = require('./lib');
(async()=>{
  const out=process.argv[2]; const vh=parseInt(process.argv[3]||'1150',10);
  const b=await launchBrowser(); const c=await newContext(b,{height:vh}); await installRetryRouting(c); const p=await c.newPage();
  await p.setViewportSize({width:1440,height:vh});
  await gotoRetry(p,'https://www.barunsoncard.com/','commit'); await p.waitForTimeout(10000); await dismissPopups(p).catch(()=>{});
  // locate the 네컷 section: find the three necut product imgs, compute a bounding region incl. heading above
  for(let y=0;y<14000;y+=900){ 
    const found=await p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&/필름 네 컷|블랙 네 컷/.test(x.textContent||'')); if(e){const r=e.getBoundingClientRect(); return (r.top>-200&&r.top<window.innerHeight)?Math.round(r.top+window.scrollY):null;} return 'none';});
    if(found&&found!=='none'){ 
      // scroll so the section (with heading above) is in view: place ~250px above the label
      await p.evaluate(yy=>window.scrollTo(0,Math.max(0,yy-320)),found); 
      await p.waitForTimeout(2500);
      break;
    }
    await p.evaluate(yy=>window.scrollTo(0,yy),y); await p.waitForTimeout(700);
  }
  await p.waitForTimeout(1500);
  await p.screenshot({path:out});
  const v=verifyPng(out);
  const chk=await p.evaluate(()=>['블랙 네 컷','화이트 네 컷','필름 네 컷'].filter(k=>document.body.innerText.includes(k)));
  console.log(JSON.stringify({ok:v.ok,size:v.size,visible:chk}));
  await b.close();
})();
