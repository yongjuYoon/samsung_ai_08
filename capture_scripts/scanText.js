const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry } = require('./lib');
(async()=>{
  const url=process.argv[2]; const needles=(process.argv[3]||'할인,장당,수량').split(',');
  const b=await launchBrowser(); const c=await newContext(b); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(9000); await dismissPopups(p); await autoScroll(p); await p.waitForTimeout(1500);
  const res=await p.evaluate((needles)=>{
    const out=[];
    const walk=document.createEladElementorNull; // noop
    const all=[...document.querySelectorAll('body *')];
    for(const el of all){
      if(el.children.length>3) continue; // leaf-ish
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(!t||t.length>60) continue;
      if(needles.some(n=>t.includes(n))){
        const r=el.getBoundingClientRect();
        if(r.height===0) continue;
        out.push({y:Math.round(r.y+window.scrollY),tag:el.tagName,t});
      }
    }
    // dedupe by y+t
    const seen=new Set(); return out.filter(o=>{const k=o.y+o.t;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,40);
  },needles);
  console.log(JSON.stringify(res,null,1));
  await b.close();
})();
