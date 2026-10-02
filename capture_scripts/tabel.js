const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting } = require('./lib');
(async()=>{
  const url=process.argv[2]; const lab=process.argv[3]||'심플';
  const b=await launchBrowser(); const c=await newContext(b); await installRetryRouting(c); const p=await c.newPage();
  await gotoRetry(p,url,'commit'); await p.waitForTimeout(11000); await dismissPopups(p);
  const res=await p.evaluate((lab)=>{
    const els=[...document.querySelectorAll('*')].filter(e=>e.childElementCount<=2 && e.textContent.trim()===lab && e.getBoundingClientRect().top<520 && e.getBoundingClientRect().top>60);
    return els.slice(0,5).map(e=>{
      let a=e.closest('a'); 
      return {tag:e.tagName, cls:(e.className||'').toString().slice(0,40), onclick:(e.getAttribute('onclick')||'').slice(0,80), parentTag:e.parentElement&&e.parentElement.tagName, parentOnclick:(e.parentElement&&e.parentElement.getAttribute('onclick')||'').slice(0,80), parentHref:(e.closest('[href]')&&e.closest('[href]').getAttribute('href'))||null, top:Math.round(e.getBoundingClientRect().top)};
    });
  },lab);
  console.log(JSON.stringify(res,null,1));
  await b.close();
})();
