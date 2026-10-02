// Declarative driver: node drive.js <spec.json>
// Performs navigation + actions, then inspects and/or captures.
const fs = require('fs');
const { launchBrowser, newContext, dismissPopups, autoScroll, capture, installRetryRouting } = require('./lib');

async function gotoRetry(page, url, waitUntil, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await page.goto(url, { waitUntil: waitUntil || 'commit', timeout: 45000 });
    } catch (e) {
      lastErr = e;
      if (/ERR_TOO_MANY_RETRIES|ERR_NETWORK_CHANGED|ERR_CONNECTION|ERR_TIMED_OUT|interrupted by another navigation|ERR_ABORTED/.test(e.message)) {
        await page.waitForTimeout(1500 * (i + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

async function runActions(page, actions) {
  for (const a of actions || []) {
    try {
      if (a.goto) { await gotoRetry(page, a.goto, a.waitUntil); }
      else if (a.click) { await page.locator(a.click).first().click({ timeout: 8000 }); }
      else if (a.clickText) { await page.getByText(a.clickText, { exact: !!a.exact }).first().click({ timeout: 8000 }); }
      else if (a.clickNth !== undefined && a.sel) { await page.locator(a.sel).nth(a.clickNth).click({ timeout: 8000 }); }
      else if (a.hover) { await page.locator(a.hover).first().hover({ timeout: 8000 }); }
      else if (a.waitFor) { await page.locator(a.waitFor).first().waitFor({ timeout: a.timeout || 15000 }); }
      else if (a.press) { await page.keyboard.press(a.press); }
      else if (a.scroll) { await autoScroll(page); }
      else if (a.wait) { await page.waitForTimeout(a.wait); }
      else if (a.eval) { await page.evaluate(a.eval); }
      else if (a.dismiss) { await dismissPopups(page); }
      if (a.after) await page.waitForTimeout(a.after);
    } catch (e) {
      console.error('ACTION_ERR', JSON.stringify(a), e.message);
    }
  }
}

(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const browser = await launchBrowser();
  const ctx = await newContext(browser, spec);
  if (spec.retryRoute !== false) { await installRetryRouting(ctx, { blockHosts: spec.blockHosts || [] }); }
  const page = await ctx.newPage();
  const out = { url: spec.url };
  try {
    await gotoRetry(page, spec.url, spec.waitUntil);
    await page.waitForTimeout(spec.settle || 2500);
    if (spec.networkidle) { await page.waitForLoadState('networkidle', { timeout: spec.networkidle }).catch(() => {}); }
    if (spec.dismiss !== false) await dismissPopups(page);
    await runActions(page, spec.actions);
    if (spec.scrollAll) { await autoScroll(page); }
    if (spec.postWait) await page.waitForTimeout(spec.postWait);

    out.finalUrl = page.url();
    out.title = await page.title().catch(() => '');

    if (spec.inspect) {
      const tl = spec.inspect.textLen || 1200;
      out.text = await page.evaluate((n) => (document.body ? document.body.innerText.slice(0, n) : ''), tl);
      if (spec.inspect.links) {
        const re = new RegExp(spec.inspect.links, 'i');
        out.links = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => ({ href: a.href, text: (a.innerText || a.getAttribute('aria-label') || a.querySelector('img')?.alt || '').trim().slice(0, 60) })));
        out.links = out.links.filter(l => re.test(l.href) || re.test(l.text)).slice(0, spec.inspect.max || 60);
        // dedupe by href
        const seen = new Set(); out.links = out.links.filter(l => !seen.has(l.href) && seen.add(l.href));
      }
      if (spec.inspect.selectorText) {
        out.selText = await page.evaluate((s) => Array.from(document.querySelectorAll(s)).slice(0,30).map(e => (e.innerText||'').trim().slice(0,80)).filter(Boolean), spec.inspect.selectorText);
      }
    }

    if (spec.capture) {
      const v = await capture(page, spec.capture);
      out.capture = { path: spec.capture.path, mode: spec.capture.mode, ...v };
    }
    out.status = 'done';
  } catch (e) {
    out.status = 'error';
    out.error = e.message;
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 2));
})();
