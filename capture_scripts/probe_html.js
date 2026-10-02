const { launchBrowser, newContext, dismissPopups, gotoRetry } = require('./lib');
(async()=>{
  const url=process.argv[2]; const waitMs=parseInt(process.argv[3]||'22000',10);
  const b=await launchBrowser(); const c=await newContext(b); const p=await c.newPage();
  const fails=[]; p.on('requestfailed',r=>fails.push(r.url().slice(0,80)+' :: '+(r.failure()&&r.failure().errorText)));
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(waitMs); await dismissPopups(p);
  const info=await p.evaluate(()=>({
    tableCount:document.querySelectorAll('table').length,
    tabCount:document.querySelectorAll('.item_goods_tab a').length,
    has_수량별:document.documentElement.outerHTML.includes('수량별'),
    bodyTextLen:(document.body.innerText||'').length
  }));
  console.log(JSON.stringify(info));
  console.log('FAILS',JSON.stringify([...new Set(fails)].slice(0,15),null,1));
  await b.close();
})();
