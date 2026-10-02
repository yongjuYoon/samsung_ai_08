const { launchBrowser, newContext } = require('./lib');
(async () => {
  const urls = process.argv.slice(2);
  const browser = await launchBrowser();
  const ctx = await newContext(browser);
  const page = await ctx.newPage();
  for (const u of urls) {
    for (const wu of ['commit', 'domcontentloaded']) {
      try {
        const r = await page.goto(u, { waitUntil: wu, timeout: 30000 });
        console.log(`OK  [${wu}] ${r && r.status()} ${u} -> ${page.url()}`);
        break;
      } catch (e) {
        console.log(`ERR [${wu}] ${u} :: ${e.message.split('\n')[0]}`);
      }
    }
  }
  await browser.close();
})();
