const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/clocking-summary.html')).href, { waitUntil: 'networkidle0' });

    await page.click('#summaryTableBody .attendance-report-pill');
    assert.equal(await page.$eval('#view-details', node => getComputedStyle(node).display), 'block');
    assert.equal(await page.$eval('#pageHeaderTitle', node => node.textContent.trim()), 'Clocking Summary Details');
    assert.equal(await page.$eval('#detailsRecordCount', node => node.textContent.trim()), 'Total Records: 4');
    assert.equal(await page.$$('#detailsModal').then(nodes => nodes.length), 0, 'Details must not use a pop-out modal');

    const mapAction = await page.$eval('#detailsListContainer .clocking-map-btn', button => ({
      label: button.textContent.trim(),
      hasFullscreenIcon: Boolean(button.querySelector('.fa-expand'))
    }));
    assert.deepEqual(mapAction, { label: 'View Map', hasFullscreenIcon: true });
    await page.click('#detailsListContainer .clocking-map-btn');

    assert.equal(await page.$eval('#view-map', node => getComputedStyle(node).display), 'block');
    assert.equal(await page.$eval('#pageHeaderTitle', node => node.textContent.trim()), 'Location Map');
    assert.equal(await page.$eval('#clockingMapAddress', node => node.textContent.trim()), 'Times Square Office, Kuala Lumpur');
    assert.equal(await page.$eval('#view-map', node => node.textContent.includes('Example Map')), false);
    assert.equal(await page.$eval('phone-bottom-nav', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#clockingFullMap', node => node.getBoundingClientRect().height >= document.querySelector('.main-content').clientHeight - 2), true);

    await page.click('.header-btn-icon');
    assert.equal(await page.$eval('#view-details', node => getComputedStyle(node).display), 'block');
    await page.click('.header-btn-icon');
    assert.equal(await page.$eval('#view-summary', node => getComputedStyle(node).display), 'block');
    console.log('PASS: Count opens a dedicated details page and View Map opens a full-phone map page.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
