// node findterms.js <url> <hoverText?> <term1,term2,...>
const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry } = require('./lib');
(async () => {
  const url = process.argv[2];
  const hover = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null;
  const terms = (process.argv[4] || '').split(',').filter(Boolean);
  const b = await launchBrowser(); const c = await newContext(b); const p = await c.newPage();
  try {
    await gotoRetry(p, url, 'commit');
    await p.waitForTimeout(8000); await dismissPopups(p);
    if (hover) { try { await p.getByText(hover, { exact: true }).first().hover({ timeout: 5000 }); } catch (e) {} await p.waitForTimeout(2500); }
    const info = await p.evaluate((terms) => {
      const found = {};
      terms.forEach((t) => {
        const el = [...document.querySelectorAll('a,button,li,span,div,em,strong')].find((e) => e.textContent.trim() === t && e.offsetParent !== null);
        const any = [...document.querySelectorAll('a,button,li,span,div,em,strong')].find((e) => e.textContent.trim() === t);
        found[t] = el ? 'VISIBLE' : (any ? 'exists-hidden' : 'absent');
      });
      const navs = [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((v, i, s) => s.indexOf(v) === i).slice(0, 40);
      return { found, navs, linkCount: document.querySelectorAll('a[href]').length };
    }, terms);
    console.log(JSON.stringify(info, null, 2));
  } catch (e) { console.log('ERR', e.message); }
  await b.close();
})();
