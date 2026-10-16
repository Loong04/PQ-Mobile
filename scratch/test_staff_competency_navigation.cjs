const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
let browser;
before(async () => { browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'] }); });
after(async () => { await browser?.close(); });
async function open(query) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
  await page.setViewport({ width: 420, height: 900 });
  await page.goto(pathToFileURL(path.join(__dirname, '../modules/training-competency/options/staff-competency.html')).href + query, { waitUntil: 'domcontentloaded' });
  return page;
}
test('a preserved gap drilldown does not intercept the Search header back destination', async () => {
  const page = await open('?tab=gap&gapSkill=effective-communication&theme=light');
  try {
    await page.click('[data-competency-tab="search"]');
    await page.click('#staffCompetencyBack');
    assert.match(page.url(), /\/index\.html\?/, 'Search back goes to Team even when Gap remembers a selected competency');
  } finally { await page.close(); }
});
test('browser back closes the Staff filter before exposing a different tab', async () => {
  const page = await open('?tab=search');
  try {
    await page.click('[data-competency-tab="staff"]');
    await page.click('#staffCompetencyFilterTrigger');
    await page.goBack({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('#staffCompetencyFilterOverlay', node => node.hidden), true, 'Inactive Staff filter is closed');
    assert.equal(await page.$eval('main', node => node.inert), false, 'Search is interactive after browser Back');
    await page.click('#competencyHubFilterTrigger');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('main', node => node.inert), false);
  } finally { await page.close(); }
});
