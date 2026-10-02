// Shared Playwright helpers for wedding-card web capture
const { chromium } = require('playwright');
const fs = require('fs');

const PROXY = process.env.HTTPS_PROXY || 'http://127.0.0.1:42751';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

async function launchBrowser() {
  const headful = process.env.HEADFUL === '1';
  return chromium.launch({
    headless: !headful,
    executablePath: CHROME,
    proxy: { server: PROXY },
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=ko-KR', '--disable-blink-features=AutomationControlled', '--disable-http2', '--disable-quic'],
  });
}

async function newContext(browser, opts = {}) {
  return browser.newContext({
    viewport: { width: opts.width || 1440, height: opts.height || 1000 },
    deviceScaleFactor: opts.dsf || 1,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    userAgent: UA,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8' },
  });
}

// Try to dismiss cookie banners / popups / "오늘 하루 보지 않기" layers
async function dismissPopups(page) {
  const texts = ['오늘 하루', '오늘하루', '하루 동안', '닫기', '확인', '동의', '모두 동의', '수락', 'ACCEPT', 'Accept', '확인했습니다', 'OK', '그만보기', '다시 보지 않기', '일주일간'];
  try {
    // text-based buttons/links
    for (const t of texts) {
      const els = await page.locator(`text=${t}`).all().catch(() => []);
      for (const el of els.slice(0, 4)) {
        if (await el.isVisible().catch(() => false)) {
          await el.click({ timeout: 1200 }).catch(() => {});
          await page.waitForTimeout(250);
        }
      }
    }
    // common close selectors
    const sels = ['[class*="close" i]', '[class*="popup" i] button', '[aria-label="close" i]', '[class*="layer" i] button', 'button:has-text("X")', '.btn-close', '.pop_close'];
    for (const s of sels) {
      const els = await page.locator(s).all().catch(() => []);
      for (const el of els.slice(0, 3)) {
        if (await el.isVisible().catch(() => false)) {
          await el.click({ timeout: 1000 }).catch(() => {});
          await page.waitForTimeout(200);
        }
      }
    }
  } catch (e) {}
  // ESC as a gentle fallback
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);
}

async function autoScroll(page, step = 700, maxLoops = 40) {
  await page.evaluate(async ({ step, maxLoops }) => {
    await new Promise((resolve) => {
      let total = 0; let loops = 0; let lastH = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step; loops++;
        const h = document.body.scrollHeight;
        if (loops >= maxLoops || (total >= h && h === lastH)) { clearInterval(timer); resolve(); }
        lastH = h;
      }, 180);
    });
  }, { step, maxLoops });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

// Verify a PNG: exists, non-trivial size, not a blank/near-uniform image
async function verifyPng(path) {
  if (!fs.existsSync(path)) return { ok: false, reason: 'file missing' };
  const sz = fs.statSync(path).size;
  if (sz < 3000) return { ok: false, reason: `too small (${sz} bytes)` };
  const buf = fs.readFileSync(path);
  if (!(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)) return { ok: false, reason: 'not a PNG' };
  return { ok: true, size: sz };
}

async function capture(page, { path, mode = 'viewport', selector = null }) {
  if (mode === 'fullPage') {
    await page.screenshot({ path, fullPage: true });
  } else if (mode === 'element' && selector) {
    const el = page.locator(selector).first();
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(400);
    await el.screenshot({ path });
  } else {
    await page.screenshot({ path });
  }
  return verifyPng(path);
}

// Retry failed subresource loads (proxy drops some concurrent requests with ERR_TOO_MANY_RETRIES).
// Optionally block heavy third-party trackers/ads that hang.
async function installRetryRouting(context, { blockHosts = [] } = {}) {
  const defaultBlock = ['doubleclick.net', 'googletagmanager.com', 'google-analytics.com', 'facebook.net', 'facebook.com/tr', 'pgweb.uplus.co.kr', 'googlesyndication', 'criteo', 'kakao.com/v1/tracker', 'wcs.naver', 'analytics'];
  const block = [...defaultBlock, ...blockHosts];
  await context.route('**/*', async (route) => {
    const req = route.request();
    const url = req.url();
    if (block.some((h) => url.includes(h))) { return route.abort().catch(() => {}); }
    if (req.method() !== 'GET') return route.continue().catch(() => {});
    for (let i = 0; i < 3; i++) {
      try {
        const resp = await route.fetch({ timeout: 30000 });
        return await route.fulfill({ response: resp });
      } catch (e) {
        if (i === 2) { return route.continue().catch(() => route.abort().catch(() => {})); }
        await new Promise((r) => setTimeout(r, 600 * (i + 1)));
      }
    }
  });
}

async function gotoRetry(page, url, waitUntil = 'commit', attempts = 5) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try { return await page.goto(url, { waitUntil, timeout: 45000 }); }
    catch (e) {
      lastErr = e;
      if (/ERR_TOO_MANY_RETRIES|ERR_NETWORK_CHANGED|ERR_CONNECTION|ERR_TIMED_OUT|interrupted by another navigation|ERR_ABORTED|ERR_HTTP2/.test(e.message)) {
        await page.waitForTimeout(1500 * (i + 1)); continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

module.exports = { launchBrowser, newContext, dismissPopups, autoScroll, verifyPng, capture, gotoRetry, installRetryRouting, PROXY };
