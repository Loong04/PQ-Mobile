const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/feedback-history.html')).href;
    for (const theme of ['light', 'dark']) {
      await page.goto(url + '?theme=' + theme, { waitUntil: 'networkidle0' });
      assert.equal(await page.$eval('#pendingFeedbackTotal', node => node.textContent.trim()), 'Total 2 Records');
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 950 });
        const cards = await page.$$eval('.pending-feedback-record', nodes => nodes.map(node => {
          const rect = node.getBoundingClientRect();
          return {
            radius: getComputedStyle(node).borderRadius,
            title: node.querySelector('.history-card-title')?.textContent.trim(),
            date: node.querySelector('.history-card-ref')?.textContent.trim(),
            labels: [...node.querySelectorAll('.attendance-history-detail > span')].map(row => row.textContent.trim()),
            values: [...node.querySelectorAll('.attendance-history-detail > strong')].map(row => row.textContent.trim()),
            status: node.querySelector('.history-card-header .card-status-badge')?.textContent.trim(),
            statusAtRight: (() => {
              const heading = node.querySelector('.history-card-heading').getBoundingClientRect();
              const status = node.querySelector('.history-card-header .card-status-badge');
              return !!status && status.getBoundingClientRect().left >= heading.right;
            })(),
            feedbackColor: getComputedStyle(node.querySelector('.btn-feedback')).color,
            feedbackBackground: getComputedStyle(node.querySelector('.btn-feedback')).backgroundImage,
            fits: node.scrollWidth <= node.clientWidth + 1 && [...node.querySelectorAll('.history-card-title,.card-status-badge,button,.attendance-history-detail strong')].every(child => {
              const childRect = child.getBoundingClientRect();
              return childRect.left >= rect.left - 1 && childRect.right <= rect.right + 1;
            }),
            dateBadge: !!node.querySelector('.history-date-badge')
          };
        }));
        assert.equal(cards.length, 2);
        assert.deepEqual(cards.map(card => card.date), ['Mon 14 SEP', 'Tue 15 SEP']);
        cards.forEach(card => {
          assert.equal(card.radius, '18px');
          assert.ok(card.title && card.fits && !card.dateBadge);
          assert.deepEqual(card.labels, ['Clocked Times', 'Normal Hours', 'Overtime']);
          assert.ok(card.statusAtRight, 'Exception uses the top-right History status slot');
          assert.equal(card.feedbackColor, 'rgb(255, 255, 255)');
          assert.equal(card.feedbackBackground, 'linear-gradient(135deg, rgb(124, 58, 237) 0%, rgb(109, 40, 217) 100%)');
        });
        assert.deepEqual(cards[0].values, ['08:09 · 19:40', '8.00', '2.00']);
        assert.deepEqual(cards[1].values, ['07:38', '0.00', '0.00']);
        assert.deepEqual(cards.map(card => card.status), ['Unapproved OT', 'Missing Clock Out']);
        assert.ok(await page.$eval('.main-content', node => node.scrollWidth <= node.clientWidth + 1));
        if (width === 390) await page.screenshot({ path: path.join(__dirname, `pending_attendance_feedback_${theme}.png`) });
      }
      await page.click('.pending-feedback-record [data-verify-record]');
      assert.equal(await page.$$eval('.verify-checkbox-box.checked', nodes => nodes.length), 1);
      assert.equal(await page.$eval('#attendanceDetailsModalOverlay', node => getComputedStyle(node).display), 'none');
      await page.click('#verifyAllBtn');
      assert.equal(await page.$$eval('.verify-checkbox-box.checked', nodes => nodes.length), 2);
      await page.click('#verifyAllBtn');
      assert.equal(await page.$$eval('.verify-checkbox-box.checked', nodes => nodes.length), 0);
      await page.focus('.pending-feedback-record');
      await page.keyboard.press('Enter');
      await page.waitForSelector('#attendanceDetailsModalOverlay', { visible: true });
      await page.evaluate(() => closeModal('attendanceDetailsModalOverlay'));
      await page.waitForSelector('#attendanceDetailsModalOverlay', { hidden: true });
      for (let index = 0; index < 2; index++) {
        await page.$$eval('.pending-feedback-record .btn-feedback', (nodes, index) => nodes[index].click(), index);
        await page.waitForSelector('#feedbackModalOverlay', { visible: true });
        assert.equal(await page.$eval('#fbMetaDate', node => node.textContent.trim()), ['14 Sep 2026', '15 Sep 2026'][index]);
        await page.evaluate(() => submitFeedbackForm());
        await page.waitForSelector('#feedbackModalOverlay', { hidden: true });
      }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Pending Attendance Feedback uses History cards, Total 2 Records, working Verify/Feedback controls, both themes and three mobile widths.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
