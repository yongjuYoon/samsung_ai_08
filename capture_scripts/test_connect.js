const { chromium } = require('playwright');

(async () => {
  const proxyServer = process.env.HTTPS_PROXY || 'http://127.0.0.1:42751';
  console.log('Using proxy:', proxyServer);
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    proxy: { server: proxyServer },
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    locale: 'ko-KR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const url = process.argv[2] || 'https://barunsoncard.com/';
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    console.log('STATUS:', resp && resp.status());
    await page.waitForTimeout(2500);
    const title = await page.title();
    console.log('TITLE:', title);
    const text = (await page.evaluate(() => document.body ? document.body.innerText.slice(0, 300) : 'NO BODY'));
    console.log('TEXT SAMPLE:', text.replace(/\n+/g, ' | '));
    await page.screenshot({ path: '/tmp/claude-0/test_connect.png' });
    console.log('SCREENSHOT OK');
  } catch (e) {
    console.log('ERROR:', e.message);
  }
  await browser.close();
})();
