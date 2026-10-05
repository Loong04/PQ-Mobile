const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/overtime.html')).href;
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 600, height: 1000, deviceScaleFactor: 1 });
      await page.goto(`${url}?theme=${theme}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      const dashboard = await page.evaluate(() => {
        const meta = [...document.querySelectorAll('#overtimeMeta .hero-stat')].map(node => ({ text: node.textContent.replace(/\s+/g, ' ').trim(), top: node.getBoundingClientRect().top }));
        return {
          meta,
          cards: [...document.querySelectorAll('.ot-record-card')].map(node => ({
            title: node.querySelector('.history-time-row').textContent,
            date: node.querySelector('.ot-record-date').textContent,
            status: node.querySelector('.ot-record-status').textContent,
            details: [...node.querySelectorAll('.ot-record-detail')].map(row => row.textContent),
            radius: getComputedStyle(node).borderRadius,
            hasDateBadge: !!node.querySelector('.history-date-badge, .date-badge-compact')
          }))
        };
      });
      assert.ok(dashboard.meta[1].top > dashboard.meta[0].top, 'Supervisor is below Shift Group');
      assert.equal(dashboard.cards.length, 2);
      assert.ok(dashboard.cards.every(card => !card.hasDateBadge));
      assert.deepEqual(dashboard.cards.map(card => card.details.at(-1)), ['Approved Hours0.00', 'Approved Hours2.00']);
      console.log(JSON.stringify({ theme, dashboard }));
      await page.screenshot({ path: path.join(__dirname, `attendance_overtime_${theme}.png`) });

      await page.focus('.ot-record-card');
      await page.keyboard.press('Enter');
      await page.waitForSelector('#modal-ot-details', { visible: true });
      await page.evaluate(() => closeDetails(true));
      await page.waitForSelector('#modal-ot-details', { hidden: true });

      await page.click('#overtimeAddRequest');
      assert.equal(await page.$eval('#headerTitle', node => node.textContent), 'Request OT');
      assert.equal(await page.$eval('#view-request', node => getComputedStyle(node).display), 'block');
      assert.ok(await page.$eval('phone-bottom-nav .bottom-nav', node => node.getBoundingClientRect().height > 0));
      await page.select('#otType', '1.5 OT');
      await page.type('#otRemarks', 'Overtime preview');
      await page.focus('[role="switch"]');
      await page.keyboard.press('Space');
      assert.equal(await page.$eval('[role="switch"]', node => node.getAttribute('aria-checked')), 'true');
      await page.$eval('#hiddenOtFileInput', node => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['sample'], 'overtime-note.pdf', { type: 'application/pdf' }));
        transfer.items.add(new File(['sample'], 'shift-record.txt', { type: 'text/plain' }));
        node.files = transfer.files;
        node.dispatchEvent(new Event('change', { bubbles: true }));
      });
      assert.equal(await page.$$eval('.form-attachment-item', nodes => nodes.length), 2);
      await page.$eval('.form-attachment-remove', node => node.click());
      assert.equal(await page.$$eval('.form-attachment-item', nodes => nodes.length), 1);
      assert.equal(await page.$eval('#hiddenOtCameraInput', node => node.getAttribute('capture')), 'environment');
      await page.evaluate(() => { document.querySelector('.main-content').scrollTop = 0; });
      await page.screenshot({ path: path.join(__dirname, `attendance_overtime_form_${theme}_top.png`) });
      await page.evaluate(() => { const main = document.querySelector('.main-content'); main.scrollTop = main.scrollHeight; });
      await page.screenshot({ path: path.join(__dirname, `attendance_overtime_form_${theme}_bottom.png`) });
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
        const layout = await page.evaluate(() => {
          const main = document.querySelector('.main-content');
          main.scrollTop = main.scrollHeight;
          const footer = document.getElementById('request-actions').getBoundingClientRect();
          const nav = document.querySelector('phone-bottom-nav .bottom-nav').getBoundingClientRect();
          return {
            overflow: main.scrollWidth - main.clientWidth,
            fieldsFit: [...document.querySelectorAll('.modern-input')].every(node => node.scrollWidth <= node.clientWidth + 1),
            footerVisible: footer.top >= main.getBoundingClientRect().top && footer.bottom <= nav.top,
            footerOutsideCard: !document.querySelector('.ot-form-card #request-actions')
          };
        });
        assert.equal(layout.overflow, 0);
        assert.ok(layout.fieldsFit && layout.footerVisible && layout.footerOutsideCard, `${theme} ${width}px form fits`);
        await page.click('#request-actions .form-cancel-btn');
        assert.equal(await page.$eval('#view-dashboard', node => getComputedStyle(node).display), 'block');
        assert.equal(await page.$eval('#headerTitle', node => node.textContent), 'Overtime');
        const cardsFit = await page.$$eval('.ot-record-card', nodes => nodes.every(node => {
          const card = node.getBoundingClientRect();
          return [...node.querySelectorAll('.ot-record-heading, .ot-record-status, .ot-record-detail strong')].every(child => {
            const rect = child.getBoundingClientRect();
            return child.scrollWidth <= child.clientWidth + 1 && rect.right <= card.right && rect.left >= card.left;
          });
        }));
        assert.ok(cardsFit, `${theme} ${width}px cards fit`);
        await page.click('#overtimeAddRequest');
        console.log(JSON.stringify({ theme, width, layout, cardsFit }));
      }
      assert.deepEqual(await page.$$eval('#request-actions button', nodes => nodes.map(node => node.textContent.trim())), ['Cancel', 'Submit']);
      await page.$eval('#request-actions [type="submit"]', node => node.click());
      await page.waitForFunction(() => getComputedStyle(document.getElementById('view-dashboard')).display === 'block');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Overtime card details, add/cancel/submit navigation, attachments, themes and mobile layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
