const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const storageKey = 'peoplehcm:workplace:book-resource:v1';
const url = theme => pathToFileURL(path.resolve(__dirname, '../modules/admin/options/book-resource.html')).href + '?theme=' + theme;
async function screenshot(page, filename) {
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect.getComputedTiming().endTime)).map(animation => animation.finished.catch(() => {})));
  });
  await page.screenshot({ path: path.resolve(__dirname, filename) });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: 950 });
      await page.goto(url(theme), { waitUntil: 'domcontentloaded' });
      await page.evaluate(key => localStorage.removeItem(key), storageKey);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.ok(await page.$('#bookingAdd'), 'Current Records must offer an Add icon');
      assert.equal(await page.$eval('#bookingEditor', n => n.hidden), true);
      assert.equal(await page.$$eval('#bookingRecords .history-card-item', n => n.length), 1);
      assert.equal(await page.$$eval('#bookingRecords .fa-chevron-right', n => n.length), 0);
      await screenshot(page, `book-resource-records-${theme}-${width}.png`);
      await page.click('#bookingAdd');
      assert.equal(await page.$eval('#bookingAdd', n => n.getAttribute('aria-expanded')), 'true');
      assert.equal(await page.$eval('.booking-list-heading', n => n.getBoundingClientRect().height), 0, 'Form must not show the Current Records heading or Add icon');
      assert.equal(await page.$eval('#bookingRecords', n => n.getBoundingClientRect().height), 0, 'Form must not show record cards below its fields');
      assert.equal(await page.$eval('#bookingFeedback', n => n.getBoundingClientRect().height), 0, 'Record feedback belongs only to the list');
      await page.click('#bookingPlan');
      assert.equal(await page.$$eval('#bookingRecords .history-card-item', n => n.length), 1, 'Invalid forms must not save');
      await page.evaluate(() => {
        document.getElementById('bookingStartTime').value = '10:00';
        document.getElementById('bookingEndTime').value = '09:00';
      });
      await page.select('#bookingResource', 'selangor-room');
      await page.select('#bookingTask', 'meeting');
      await page.click('#bookingPlan');
      assert.match(await page.$eval('#bookingFormFeedback', n => n.textContent), /End Time/);
      await page.$eval('#bookingEndTime', n => { n.value = '11:00'; n.dispatchEvent(new Event('input', { bubbles: true })); });
      await page.type('#bookingPurpose', '<script>alert(1)</script> Team discussion');
      await page.type('#bookingMeetingRef', 'MEET-001');
      await page.type('#bookingRemarks', 'Bring agenda');
      await screenshot(page, `book-resource-form-${theme}-${width}.png`);
      await page.click('#bookingPlan');
      assert.equal(await page.$eval('#bookingEditor', n => n.hidden), true);
      assert.ok(await page.$eval('.booking-list-heading', n => n.getBoundingClientRect().height) > 0, 'Submitting returns to Current Records');
      assert.equal(await page.$$eval('[data-booking-status="plan"]', n => n.length), 1);
      assert.equal(await page.$$eval('[data-booking-status="plan"] [data-booking-action]', n => n.length), 2);
      assert.equal(await page.$$eval('#bookingRecords script', n => n.length), 0);
      assert.match(await page.$eval('#bookingRecords', n => n.textContent), /MEET-001.*Bring agenda/s);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$$eval('#bookingRecords .history-card-item', n => n.length), 2);
      await screenshot(page, `book-resource-plan-${theme}-${width}.png`);
      await page.click('[data-booking-action="confirm"]');
      assert.equal(await page.$$eval('[data-booking-action="confirm"]', n => n.length), 0);
      assert.equal(await page.$$eval('[data-booking-status="confirmed"]', n => n.length), 2);
      await page.click('#bookingAdd');
      await page.evaluate(() => {
        document.getElementById('bookingStartTime').value = '12:00';
        document.getElementById('bookingEndTime').value = '13:00';
      });
      await page.select('#bookingResource', 'selangor-room');
      await page.select('#bookingTask', 'meeting');
      await page.click('#bookingBook');
      assert.equal(await page.$$eval('[data-booking-status="confirmed"]', n => n.length), 3);
      assert.equal(await page.$$eval('[data-booking-action="confirm"]', n => n.length), 0);
      assert.equal(await page.$eval('.admin-content', n => n.scrollWidth > n.clientWidth), false);
      const identity = await page.$eval('.booking-employee-id', n => ({ text: n.textContent, below: n.getBoundingClientRect().top >= n.previousElementSibling.getBoundingClientRect().bottom }));
      assert.match(identity.text, /^#/);
      assert.equal(identity.below, true);
      while (await page.$('[data-booking-action="delete"]')) await page.click('[data-booking-action="delete"]');
      assert.equal(await page.$eval('#bookingEmpty', n => n.hidden), false);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$$eval('#bookingRecords .history-card-item', n => n.length), 0, 'Deleted records must not reseed');
      await page.click('#bookingAdd');
      assert.equal(await page.$eval('#bookingEmpty', n => n.getBoundingClientRect().height), 0, 'Empty list message must not appear on the form');
      await page.click('#bookingCancel');
      assert.equal(await page.$eval('#bookingEditor', n => n.hidden), true);
      assert.ok(await page.$eval('.booking-list-heading', n => n.getBoundingClientRect().height) > 0);
      await page.click('#bookingAdd');
      await page.click('.admin-back');
      assert.equal(page.url(), url(theme), 'Header Back exits the form before leaving Workplace');
      assert.equal(await page.$eval('#bookingEditor', n => n.hidden), true);
      await page.click('#bookingAdd');
      await page.evaluate(() => {
        document.getElementById('bookingStartTime').value = '10:00';
        document.getElementById('bookingEndTime').value = '11:00';
        window.originalBookingSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (key === 'peoplehcm:workplace:book-resource:v1') throw new Error('Storage full');
          return window.originalBookingSetItem.call(this, key, value);
        };
      });
      await page.select('#bookingResource', 'selangor-room');
      await page.select('#bookingTask', 'meeting');
      await page.type('#bookingPurpose', 'Keep this form');
      await page.click('#bookingPlan');
      assert.match(await page.$eval('#bookingFormFeedback', n => n.textContent), /Unable to save/);
      assert.equal(await page.$eval('#bookingPurpose', n => n.value), 'Keep this form');
      assert.equal(await page.$eval('#bookingEditor', n => n.hidden), false);
      assert.equal(await page.$$eval('#bookingRecords .history-card-item', n => n.length), 0);
      await page.evaluate(() => { Storage.prototype.setItem = window.originalBookingSetItem; });
      await page.click('#bookingPlan');
      assert.equal(await page.$$eval('[data-booking-status="plan"]', n => n.length), 1, 'Retry saves once');
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
      await page.click('#bookingAdd');
      assert.equal(await page.$eval('#bookingEditor', n => getComputedStyle(n).animationName), 'none');
      await page.click('#bookingCancel');
      await page.evaluate(key => localStorage.setItem(key, '{broken'), storageKey);
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.match(await page.$eval('#bookingFeedback', n => n.textContent), /Unable to load/);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), '{broken', 'Corrupt records must not be overwritten');
      assert.deepEqual(errors, []);
      console.log(`PASS ${theme} ${width}: Add, validation, Plan, Confirm, Book, Delete, persistence, safe text, identity, layout, storage errors, save retry, reduced motion`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
