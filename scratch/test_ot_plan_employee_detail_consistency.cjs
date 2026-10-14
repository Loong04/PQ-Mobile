const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const otPlanUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/ot-plan.html')).href;
const shiftPlanUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;

async function openEmployeeDetail(page) {
  await page.evaluate(() => openOtPlanDetail('8.30:17.30W', 'OT 1.5 BEFORE WORK', 28, '45.00'));
}

async function readEmployeeCard(page) {
  return page.$eval('#otEmployeeCardsContainer .employee-purple-card:first-child', card => {
    const header = card.querySelector('.employee-purple-header');
    const body = card.querySelector('.employee-purple-body');
    const detail = card.querySelector('.calendar-purple-detail');
    const pick = (element, properties) => {
      const styles = getComputedStyle(element);
      return Object.fromEntries(properties.map(property => [property, styles[property]]));
    };

    return {
      card: pick(card, ['display', 'padding', 'overflow', 'borderRadius', 'backgroundColor', 'flexDirection', 'alignItems']),
      header: pick(header, ['padding', 'backgroundColor', 'color']),
      body: pick(body, ['display', 'gridTemplateColumns', 'gap', 'padding']),
      detail: pick(detail, ['padding', 'borderRadius', 'backgroundColor']),
      name: card.querySelector('.employee-card-name')?.textContent.trim(),
      id: card.querySelector('.employee-card-name + .employee-card-id')?.textContent.trim(),
      labels: [...card.querySelectorAll('.calendar-purple-label')].map(label => label.textContent.trim())
    };
  });
}

async function readDetailSummary(page) {
  return page.$eval('#view-ot-plan-detail .shift-detail-info-card', card => {
    const dateRow = card.querySelector('.shift-detail-info-date');
    const detailRow = card.querySelector('.shift-detail-info-rows .shift-detail-info-row');
    const pick = (element, properties) => {
      const styles = getComputedStyle(element);
      return Object.fromEntries(properties.map(property => [property, styles[property]]));
    };
    return {
      card: pick(card, ['borderRadius', 'backgroundColor', 'boxShadow']),
      dateRow: pick(dateRow, ['display', 'gridTemplateColumns', 'paddingBottom', 'borderBottomWidth']),
      detailRow: pick(detailRow, ['display', 'gridTemplateColumns', 'columnGap']),
      labels: [...card.querySelectorAll('.shift-detail-info-label')].map(label => label.textContent.trim()),
      hasDateIcon: Boolean(card.querySelector('.fa-calendar-check'))
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 900 });

    await page.goto(shiftPlanUrl + '?theme=light', { waitUntil: 'domcontentloaded' });
    await openEmployeeDetail(page);
    assert.equal(await page.$$eval('#otEmployeeCardsContainer .employee-purple-card', cards => cards.length), 28);
    const shiftCard = await readEmployeeCard(page);
    const shiftDetailSummary = await readDetailSummary(page);

    await page.goto(otPlanUrl + '?theme=light', { waitUntil: 'domcontentloaded' });
    await openEmployeeDetail(page);
    assert.equal(await page.$$eval('#otEmployeeCardsContainer .employee-purple-card', cards => cards.length), 28);
    assert.equal(await page.$$eval('#view-ot-plan-detail .shift-detail-info-card', cards => cards.length), 1);
    const otCard = await readEmployeeCard(page);
    const otDetailSummary = await readDetailSummary(page);

    assert.deepEqual(otCard.card, shiftCard.card);
    assert.deepEqual(otCard.header, shiftCard.header);
    assert.deepEqual(otCard.body, shiftCard.body);
    assert.deepEqual(otCard.detail, shiftCard.detail);
    assert.deepEqual(otDetailSummary, shiftDetailSummary);
    assert.deepEqual(otDetailSummary.labels, ['Date:', 'Shift:', 'OT Type:', 'Total Headcount:', 'Total Hours:']);
    assert.equal(otDetailSummary.hasDateIcon, false);
    assert.equal(otCard.name, 'Jason ling soon kam');
    assert.equal(otCard.id, '#000023');
    assert.deepEqual(otCard.labels, ['Job Title', 'Hours']);
    assert.deepEqual(errors, []);

    console.log('OT Plan employee detail summary and cards match Shift Plan.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
