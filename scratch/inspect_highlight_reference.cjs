const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/claims/options/benefit-highlight.html')).href, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(__dirname, 'highlight_reference_table.png') });
    await page.evaluate(() => showBenefitSection('chart'));
    await page.screenshot({ path: path.join(__dirname, 'highlight_reference_chart.png') });
    await page.evaluate(() => openHighlightFilterModal());
    await page.screenshot({ path: path.join(__dirname, 'highlight_reference_filter.png') });
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
