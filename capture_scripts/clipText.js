// node clipText.js <url> <needleText> <outPath> [padTop] [padBottom] [settle]
// Finds the smallest element whose text contains needle, screenshots a padded region around it.
const { launchBrowser, newContext, dismissPopups, autoScroll, gotoRetry, verifyPng, installRetryRouting } = require('./lib');
(async () => {
  const [url, needle, outPath] = process.argv.slice(2);
  const padTop = parseInt(process.argv[5] || '80', 10);
  const padBottom = parseInt(process.argv[6] || '120', 10);
  const settle = parseInt(process.argv[7] || '9000', 10);
  const preClick = process.env.PRECLICK || null;
  const b = await launchBrowser(); const c = await newContext(b); await installRetryRouting(c); const p = await c.newPage();
  try {
    await gotoRetry(p, url, 'commit');
    await p.waitForTimeout(settle);
    await dismissPopups(p);
    if (preClick) { try { await p.getByText(preClick, { exact: false }).first().click({ timeout: 6000 }); await p.waitForTimeout(2500); } catch (e) { console.error('preclick fail', e.message); } }
    await autoScroll(p);
    await p.waitForTimeout(1500);
    const box = await p.evaluate((needle) => {
      const all = [...document.querySelectorAll('body *')];
      // smallest element that directly or closely contains the needle
      let best = null;
      for (const el of all) {
        if (el.offsetParent === null && el.getClientRects().length === 0) continue;
        const txt = el.textContent || '';
        if (txt.includes(needle)) {
          const area = el.getBoundingClientRect().width * el.getBoundingClientRect().height;
          if (area > 0 && (!best || area < best.area)) best = { el, area };
        }
      }
      if (!best) return null;
      best.el.scrollIntoView({ block: 'center' });
      const r = best.el.getBoundingClientRect();
      return { x: r.x + window.scrollX, y: r.y + window.scrollY, w: r.width, h: r.height };
    }, needle);
    if (!box) { console.log(JSON.stringify({ ok: false, reason: 'needle not found: ' + needle })); await b.close(); return; }
    const full = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
    const clip = {
      x: Math.max(0, box.x - 20),
      y: Math.max(0, box.y - padTop),
      width: Math.min(full.w, box.w + 40),
      height: Math.min(full.h, box.h + padTop + padBottom),
    };
    if (clip.width < 50) clip.width = Math.min(full.w, 1440);
    await p.screenshot({ path: outPath, clip });
    const v = verifyPng(outPath);
    console.log(JSON.stringify({ ok: v.ok, size: v.size, box, clip, url: p.url() }));
  } catch (e) { console.log(JSON.stringify({ ok: false, error: e.message })); }
  await b.close();
})();
