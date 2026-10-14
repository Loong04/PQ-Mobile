const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/staff-hours-summary.html')).href;
const cases = [
  { rate: 100, theme: 'green', border: 'rgb(16, 185, 129)' },
  { rate: 91, theme: 'green', border: 'rgb(16, 185, 129)' },
  { rate: 90, theme: 'orange', border: 'rgb(245, 158, 11)' },
  { rate: 60, theme: 'orange', border: 'rgb(245, 158, 11)' },
  { rate: 59, theme: 'purple', border: 'rgb(124, 58, 237)' },
  { rate: 30, theme: 'purple', border: 'rgb(124, 58, 237)' },
  { rate: 29, theme: 'red', border: 'rgb(239, 68, 68)' },
  { rate: 0, theme: 'red', border: 'rgb(239, 68, 68)' }
];

async function cardAppearance(page, selector) {
  return page.$eval(selector, card => {
    const details = card.querySelector('.summary-history-details');
    const rateRow = [...card.querySelectorAll('.summary-history-detail')].find(row => row.querySelector('span').textContent === 'Attendance Rate');
    const style = getComputedStyle(card);
    const detailsStyle = getComputedStyle(details);
    return {
      theme: [...card.classList].find(value => value.startsWith('theme-')),
      border: style.borderLeftColor,
      background: style.backgroundImage,
      detailsBorder: detailsStyle.borderColor,
      detailsBackground: detailsStyle.backgroundColor,
      rate: rateRow?.querySelector('strong').textContent || null,
      rateColor: rateRow ? getComputedStyle(rateRow.querySelector('strong')).color : null,
      textColor: getComputedStyle(card.querySelector('.staff-name-text')).color
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: 920 });
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
      await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
      const originalData = await page.evaluate(() => JSON.stringify(sampleStaffData));
      await page.click('.bento-group-work .summary-kpi-card:nth-child(2)');
      assert.equal(await page.$eval('#list-record-count', node => node.textContent), '5');
      assert.equal(await page.$eval('#staff-list-total-value', node => node.textContent), '105.00');
      assert.deepEqual(await page.$$eval('#details-list-container .summary-history-card', cards => cards.map(card => {
        const row = [...card.querySelectorAll('.summary-history-detail')].find(row => row.querySelector('span').textContent === 'Attendance Rate');
        return row.querySelector('strong').textContent;
      })), ['100%', '91%', '95%', '100%', '100%']);
      await page.screenshot({ path: path.resolve(__dirname, `staff-hours-attendance-rate-${theme}-${width}.png`) });

      // Supply isolated test records through the data reader; never mutate the staff dataset.
      await page.evaluate(rates => {
        const readStaff = getStaffMetricItems;
        const fixtures = rates.map(rate => ({
          ...sampleStaffData[0], empNo: 'RATE' + rate, name: 'Rate ' + rate,
          scheduledDays: 100, presentDays: rate
        }));
        getStaffMetricItems = title => title === 'Normal Present Days' ? fixtures : readStaff(title);
        renderDetailsList('Normal Present Days');
      }, cases.map(item => item.rate));

      for (let index = 0; index < cases.length; index++) {
        const expected = cases[index];
        const selector = `#details-list-container .summary-history-card:nth-child(${index + 1})`;
        const appearance = await cardAppearance(page, selector);
        assert.equal(appearance.rate, `${expected.rate}%`);
        assert.equal(appearance.theme, `theme-${expected.theme}`, `${theme} ${width}px: ${expected.rate}% selects the right attendance band`);
        assert.equal(appearance.border, expected.border);
        assert.notEqual(appearance.rateColor, appearance.textColor, 'Attendance percentage is visibly colored');
        await page.click(selector);
        assert.equal(await page.$eval('#daily-record-count', node => node.textContent), String(expected.rate));
        if (expected.rate) {
          const daily = await cardAppearance(page, '#daily-list-container .summary-history-card');
          for (const key of ['theme', 'border', 'background', 'detailsBorder', 'detailsBackground']) {
            assert.equal(daily[key], appearance[key], `${expected.rate}% daily card inherits its staff card ${key}`);
          }
          assert.ok(await page.$$eval('#daily-list-container .summary-history-card', (cards, color) => cards.every(card => getComputedStyle(card).borderLeftColor === color), expected.border));
          if (width === 420 && [90, 29].includes(expected.rate)) {
            await page.screenshot({ path: path.resolve(__dirname, `staff-hours-attendance-rate-${expected.theme}-daily-${theme}.png`) });
          }
        } else {
          assert.equal(await page.$$eval('#daily-list-container .summary-history-card', cards => cards.length), 0);
        }
        await page.evaluate(() => goBack());
      }
      await page.evaluate(() => openListDetails('Scheduled Work Days'));
      assert.equal((await cardAppearance(page, '#details-list-container .summary-history-card')).theme, 'theme-green', 'Attendance bands do not change other metrics');
      assert.equal(await page.evaluate(() => JSON.stringify(sampleStaffData)), originalData, 'Staff data stays unchanged after rendering and navigation');
      assert.ok(await page.$eval('.main-content', node => node.scrollWidth <= node.clientWidth + 1));
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS: Attendance rate colors, 90/60/30 boundaries, inherited daily card colors, unchanged data, themes and 360/420px layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
