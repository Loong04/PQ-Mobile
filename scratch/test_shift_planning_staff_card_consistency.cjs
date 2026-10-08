const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;

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
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(pageUrl + '?theme=light', { waitUntil: 'load' });

    assert.equal(await page.$$eval('.staff-card', cards => cards.length), 6);
    assert.equal(await page.$$eval('.staff-card .fa-chevron-right', icons => icons.length), 0);
    assert.equal(await page.$$eval('.staff-card-top', rows => rows.length), 6);
    assert.equal(await page.$$eval('.staff-card-summary-panel', panels => panels.length), 6);

    const firstCard = await page.$eval('.staff-card', card => ({
      radius: getComputedStyle(card).borderRadius,
      idFollowsName: card.querySelector('.staff-name')?.nextElementSibling?.classList.contains('emp-id-label') || false,
      id: card.querySelector('.emp-id-label')?.textContent.trim(),
      labels: [...card.querySelectorAll('.staff-card-detail span')].map(node => node.textContent.trim())
    }));
    assert.equal(firstCard.radius, '18px');
    assert.equal(firstCard.idFollowsName, true);
    assert.equal(firstCard.id, '#000008');
    assert.deepEqual(firstCard.labels, ['Job Title', 'Shift Group', 'Shift']);
    assert.equal(await page.$$eval('.staff-status-badge', badges => badges.length), 0);

    const cardStyles = await page.$$eval('.staff-card', cards => cards.map(card => ({
      hasStatus: card.hasAttribute('data-status'),
      accent: getComputedStyle(card).borderLeftColor
    })));
    assert.ok(cardStyles.every(card => card.hasStatus === false));
    assert.ok(cardStyles.every(card => card.accent === 'rgb(16, 185, 129)'));

    const initiallySelected = await page.$eval('.staff-card', card => card.classList.contains('selected'));
    await page.click('.staff-card');
    const selectedAfterClick = await page.$eval('.staff-card', card => card.classList.contains('selected'));
    assert.notEqual(selectedAfterClick, initiallySelected);
    assert.deepEqual(errors, []);
    console.log('PASS: Shift Planning staff cards use the consistent Attendance teal structure.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
