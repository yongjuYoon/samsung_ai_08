// node scrollto_products.js <url> <outPath> <priceRegex> [vh]
// Scrolls down in steps until product-price text matching regex appears, then captures that viewport.
const { launchBrowser, newContext, dismissPopups, gotoRetry, installRetryRouting, verifyPng } = require('./lib');
(async () => {
  const url = process.argv[2]; const out = process.argv[3];
  const priceRe = process.argv[4] || '부\\s*[0-9,]+\\s*원|[0-9]{2,3},[0-9]{3}원';
  const vh = parseInt(process.argv[5] || '1300', 10);
  const b = await launchBrowser(); const c = await newContext(b, { height: vh }); await installRetryRouting(c);
  const p = await c.newPage();
  await p.setViewportSize({ width: 1440, height: vh });
  await gotoRetry(p, url, 'commit'); await p.waitForTimeout(12000); await dismissPopups(p);
  const re = new RegExp(priceRe);
  let found = null;
  for (let y = 0; y < 9000; y += Math.floor(vh * 0.7)) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(1600);
    const info = await p.evaluate((reSrc) => {
      const re = new RegExp(reSrc);
      // find a product card (link to product_detail) that is within current viewport and has price text
      const cards = [...document.querySelectorAll('a[href*="product_detail"]')];
      for (const a of cards) {
        const r = a.getBoundingClientRect();
        if (r.top > 40 && r.bottom < window.innerHeight && re.test(a.textContent)) {
          return { hit: true, sampleText: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 60), scrollY: window.scrollY };
        }
      }
      // fallback: any price text visible
      const bodyVis = document.body.innerText || '';
      return { hit: re.test(bodyVis) && cards.length > 0, cards: cards.length };
    }, priceRe);
    if (info.hit) { found = { y, ...info }; break; }
  }
  // settle a little for images
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out });
  const v = verifyPng(out);
  console.log(JSON.stringify({ ok: v.ok, size: v.size, found }));
  await b.close();
})();
