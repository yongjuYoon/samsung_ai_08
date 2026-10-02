const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry } = require('./lib');
(async()=>{
  const url=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(9000); await dismissPopups(p);
  // click the 수량별 할인가격 tab anchor
  const r1=await p.evaluate(()=>{
    const a=[...document.querySelectorAll('a')].find(x=>x.getAttribute('href')==='#m006'||x.textContent.includes('수량별 할인가격'));
    if(a){a.click(); return a.outerHTML.slice(0,120);} return 'no tab';
  });
  await p.waitForTimeout(3000);
  const info=await p.evaluate(()=>{
    const t=document.querySelector('.detailta_01');
    const st=t?getComputedStyle(t):null;
    const r=t?t.getBoundingClientRect():null;
    return {
      tabClicked:true,
      tableExists:!!t,
      display:st?st.display:null,
      visible: t? (t.offsetParent!==null):null,
      rect: r?{y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height)}:null,
      textSample: t?(t.textContent||'').replace(/\s+/g,' ').trim().slice(0,160):null
    };
  });
  console.log('tab:',r1); console.log(JSON.stringify(info,null,1));
  await b.close();
})();
