const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const doDismiss=process.argv[3]==='1'; const doScroll=process.argv[4]==='1';
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(6000);
  const u1=p.url();
  if(doDismiss) await dismissPopups(p);
  await p.waitForTimeout(3000);
  const u2=p.url();
  if(doScroll){ for(let y=0;y<4000;y+=800){await p.evaluate(yy=>scrollTo(0,yy),y); await p.waitForTimeout(1200);} }
  await p.waitForTimeout(2000);
  const r=await p.evaluate(()=>({url:location.href, detailLinks:document.querySelectorAll('a[href*="product_detail"]').length, prices:(document.body.innerText.match(/[0-9]{1,3}부\s*[0-9,]+\s*원/g)||[]).slice(0,6), total:(document.body.innerText.match(/세트 디자인\s*[0-9,]+\s*개|[0-9,]+개 후기/g)||[]).slice(0,3)}));
  console.log('u_after_load:',u1); console.log('u_after_dismiss:',u2); console.log(JSON.stringify(r,null,1));
  await b.close();
})();
