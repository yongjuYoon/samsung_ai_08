const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2];
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(12000); await dismissPopups(p);
  const info=await p.evaluate(()=>{
    const out={};
    const layer=document.querySelector('.layer_jehulogin');
    out.layerExists=!!layer;
    if(layer){ const st=getComputedStyle(layer); out.layerDisplay=st.display; out.layerVisible=layer.offsetParent!==null;
      out.closeBtns=[...layer.querySelectorAll('a,button,span,img')].filter(e=>/닫기|close|X|×/i.test(e.textContent||e.className||e.alt||'')).map(e=>e.tagName+'.'+e.className+':'+(e.textContent||e.alt||'').trim().slice(0,20)).slice(0,8);
    }
    // price tab
    const tab=[...document.querySelectorAll('.item_goods_tab a, a')].find(a=>a.textContent.includes('수량별 할인가격'));
    out.priceTab=!!tab;
    // table with 900장
    const t900=[...document.querySelectorAll('table')].find(t=>t.textContent.includes('900장'));
    out.priceTableExists=!!t900;
    if(t900){const r=t900.getBoundingClientRect(); const st=getComputedStyle(t900); out.priceTableDisplay=st.display; out.priceTableRect={y:Math.round(r.y+scrollY),h:Math.round(r.height)};}
    return out;
  });
  console.log(JSON.stringify(info,null,1));
  await b.close();
})();
