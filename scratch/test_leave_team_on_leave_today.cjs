const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const leaveUrl = pathToFileURL(path.resolve(__dirname, '..', 'leave.html')).href + '?theme=dark';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(leaveUrl, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => showLeaveSection('viewLeaveHub', 'team'));
    assert.equal(await page.$eval('#headerTitleText', node => node.textContent.trim()), 'Leave Dashboard');
    assert.equal(await page.$eval('#headerSubtitleText', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#teamLeaveOverviewHeader', node => node.textContent.includes('Live Status')), false);
    await page.click('#teamOnLeaveMetric');
    await page.waitForFunction(() => document.getElementById('staffOnLeaveSheetOverlay')?.classList.contains('open'));

    assert.equal(await page.$eval('#viewLeaveHub', node => getComputedStyle(node).display), 'block');
    assert.equal(await page.$eval('#headerTitleText', node => node.textContent.trim()), 'Leave Dashboard');
    assert.deepEqual(
      await page.$eval('#staffOnLeaveSheetOverlay', node => ({
        display: getComputedStyle(node).display,
        alignItems: getComputedStyle(node).alignItems,
        open: node.classList.contains('open')
      })),
      { display: 'flex', alignItems: 'flex-end', open: true }
    );
    assert.equal(await page.$eval('#staffOnLeaveSheetTitle', node => node.textContent.trim()), 'Staff On Leave');
    assert.deepEqual(
      await page.$$eval('#staffOnLeaveSheetOverlay .staff-on-leave-card', cards => cards.map(card => ({
        usesHighlightRecord: card.classList.contains('leave-highlight-detail-record'),
        status: card.dataset.status,
        name: card.querySelector('.staff-on-leave-name').textContent.trim(),
        empNo: card.querySelector('.staff-on-leave-name + .employee-id-standard').textContent.trim(),
        position: card.querySelector('.staff-on-leave-position').textContent.trim(),
        department: card.querySelector('.staff-on-leave-department').textContent.trim(),
        hasVisibleStatus: Boolean(card.querySelector('.staff-on-leave-status')),
        headerBackground: getComputedStyle(card.querySelector('.leave-highlight-detail-date')).backgroundImage
      }))),
      [
        { usesHighlightRecord: true, status: 'approved', name: 'Afifah Nasir', empNo: '#004177', position: 'QA Manager', department: 'Quality Assurance', hasVisibleStatus: false, headerBackground: 'linear-gradient(135deg, rgb(76, 29, 149) 0%, rgb(109, 40, 217) 50%, rgb(124, 58, 237) 100%)' },
        { usesHighlightRecord: true, status: 'approved', name: 'Siti Nurhaliza', empNo: '#006734', position: 'UI/UX Designer', department: 'Product & Design', hasVisibleStatus: false, headerBackground: 'linear-gradient(135deg, rgb(76, 29, 149) 0%, rgb(109, 40, 217) 50%, rgb(124, 58, 237) 100%)' },
        { usesHighlightRecord: true, status: 'approved', name: 'Marcus Tan', empNo: '#008129', position: 'Systems Analyst', department: 'IT Enterprise', hasVisibleStatus: false, headerBackground: 'linear-gradient(135deg, rgb(76, 29, 149) 0%, rgb(109, 40, 217) 50%, rgb(124, 58, 237) 100%)' },
        { usesHighlightRecord: true, status: 'approved', name: 'Kavitha Murugan', empNo: '#007452', position: 'Compliance Officer', department: 'Legal & Compliance', hasVisibleStatus: false, headerBackground: 'linear-gradient(135deg, rgb(76, 29, 149) 0%, rgb(109, 40, 217) 50%, rgb(124, 58, 237) 100%)' }
      ]
    );
    assert.ok(await page.$$eval('#staffOnLeaveSheetOverlay .staff-on-leave-card', cards => cards.every(card => {
      const widths = [...card.querySelectorAll('.leave-highlight-detail-field')].map(field => field.getBoundingClientRect().width);
      return widths.length === 2 && Math.abs(widths[0] - widths[1]) <= 1;
    })));
    assert.equal(await page.$eval('#staffOnLeaveList', node => node.scrollWidth > node.clientWidth + 1), false);

    await page.click('#staffOnLeaveSheetClose');
    await page.waitForFunction(() => getComputedStyle(document.getElementById('staffOnLeaveSheetOverlay')).display === 'none');
    assert.equal(await page.$eval('#viewLeaveHub', node => getComputedStyle(node).display), 'block');
    assert.equal(await page.$eval('#headerTitleText', node => node.textContent.trim()), 'Leave Dashboard');
    console.log('PASS: On Leave Today opens a highlight-style bottom sheet over the Team dashboard.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
