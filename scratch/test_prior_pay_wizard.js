const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const puppeteer = require('puppeteer');

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' })[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 420, height: 900 });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    const url = `http://127.0.0.1:${server.address().port}/modules/payroll/options/prior-pay-data.html`;
    const open = async () => {
      await page.waitForSelector('[data-record="1"]');
      await page.click('[data-record="1"] .prior-record-open');
      assert.equal(await page.$eval('#priorListView', el => el.hidden), false, 'Card clicks must keep the records behind a details modal');
      assert.equal(await page.$eval('#priorDetailView', el => el.hidden), true, 'Card clicks must not open the form');
      await page.waitForSelector('#priorRecordDetails.active');
      assert.equal(await page.$eval('#priorRecordDetails [data-detail="company"]', el => el.textContent), 'PETRONAS BHD');
      assert.equal(await page.$$eval('#priorRecordDetails input, #priorRecordDetails select, #priorRecordDetails textarea', els => els.length), 0);
      await page.click('#priorRecordDetailsClose');
      await page.click('[data-record="1"] .prior-ytd');
      assert.equal(await selected(), 'tab-general', 'YTD must start the full details flow at General');
    };
    const fill = async (name, value) => page.$eval(`[name="${name}"]`, (el, text) => {
      el.value = text; el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    const click = async selector => {
      await page.$eval(selector, el => el.scrollIntoView({ block: 'center' }));
      await page.click(selector);
    };
    const selected = () => page.$eval('[role="tab"][aria-selected="true"]', el => el.id);
    const capture = async (theme, name, bottom = false) => {
      await page.evaluate(async ({ theme, bottom }) => {
        setTheme(theme);
        document.querySelector('#appToast')?.classList.remove('show');
        const main = document.querySelector('#priorMain');
        main.scrollTop = bottom ? main.scrollHeight : 0;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})));
      }, { theme, bottom });
      await page.screenshot({ path: path.join(__dirname, `prior_pay_${name}_${theme}.png`) });
    };
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('[data-record="1"]');
    assert.equal(await page.$eval('#priorInfo', el => el.hidden), true, 'Prior Pay Data header must not show the right-side info icon');
    assert.equal(await page.$$eval('[data-record="1"] .prior-audit', elements => {
      const tops = elements.map(element => Math.round(element.getBoundingClientRect().top));
      return tops.length === 2 && tops[0] === tops[1] && elements.every(element => element.closest('.prior-record-dl') && element.classList.contains('claim-summary-stat'));
    }), true, 'Last Update and Last Verify must share a row of data tiles inside the card body');
    assert.deepEqual(await page.$eval('[data-record="1"] .prior-record-footer', element => {
      const style = getComputedStyle(element);
      return { borderTopWidth: style.borderTopWidth, paddingTop: style.paddingTop };
    }), { borderTopWidth: '0px', paddingTop: '0px' }, 'The YTD action must remain directly below the data tiles without a separate divider');
    await page.click('[data-record="1"] .prior-record-open');
    assert.equal(await page.$eval('#priorListView', el => el.hidden), false, 'Card clicks must display a modal, not navigate to the form');
    await page.waitForSelector('#priorRecordDetails.active');
    assert.equal(await page.$eval('#priorRecordDetails [data-detail="dateFrom"]', el => el.textContent), '30 Jul 1984');
    assert.equal(await page.$eval('#priorRecordDetails [data-detail="lastPay"]', el => el.textContent), '12,000.00');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'priorRecordDetailsClose');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'priorRecordDetailsClose', 'The read-only details modal must keep keyboard focus on its only action: Close');
    for (const theme of ['dark', 'light']) {
      await page.evaluate(async theme => {
        setTheme(theme);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})));
      }, theme);
      await page.screenshot({ path: path.join(__dirname, `prior_pay_details_${theme}.png`) });
    }
    for (const width of [360, 390, 420]) {
      await page.setViewport({ width, height: 640 });
      assert.ok(await page.$eval('.prior-record-modal', el => {
        const rect = el.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight && el.scrollWidth <= el.clientWidth + 1;
      }), 'The details modal must fit small phone screens');
    }
    await page.setViewport({ width: 420, height: 900 });
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#priorRecordDetails', el => el.classList.contains('active')), false);
    assert.equal(await page.evaluate(() => document.activeElement.matches('[data-record="1"] .prior-record-open')), true);
    await page.click('[data-record="2"] .prior-record-footer');
    await page.waitForSelector('#priorRecordDetails.active');
    assert.equal(await page.$eval('#priorRecordDetails [data-detail="company"]', el => el.textContent), 'EASTMAN CHEMICALS SDN BHD');
    await page.click('#priorRecordDetailsClose');
    assert.equal(await page.$eval('#priorRecordDetails', el => el.classList.contains('active')), false);
    await page.click('[data-record="2"] .prior-record-open');
    await page.click('#priorRecordDetails', { offset: { x: 5, y: 5 } });
    assert.equal(await page.$eval('#priorRecordDetails', el => el.classList.contains('active')), false);
    await page.click('[data-record="1"] .prior-ytd');
    assert.equal(await selected(), 'tab-general', 'YTD must open General before YTD Earning Detail');
    assert.equal(await page.$eval('#priorRecordDetails', el => el.classList.contains('active')), false);
    await page.click('#priorBack');
    await open();
    assert.equal(await page.$eval('label[for="priorDateFrom"]', el => el.textContent.trim()), 'Start Date');
    assert.equal(await page.$eval('label[for="priorDateTo"]', el => el.textContent.trim()), 'End Date');
    assert.deepEqual(await page.$$eval('#panel-general label', labels => labels.map(label => label.textContent.replace('*', '').trim())), [
      'Employee ID', 'SN', 'Start Date', 'End Date', 'Company', 'Position', 'Reason Leaving',
      'Last Pay', 'Year Experience', 'Industry', 'Pay Rate', 'Job Experience', 'Address', 'Notes'
    ], 'General fields must follow the supplied Prior Pay Data Details order');
    assert.equal(await page.$('.prior-detail-company'), null, 'Details must start with the 1 / 2 / 3 stepper, without a company summary');
    assert.equal(await page.$eval('.prior-tabs', el => el.hidden), false);
    assert.equal(await page.$eval('#prior-general-empNo', el => el.value), 'EBB12', 'Employee ID fields must not add a # prefix');
    assert.equal(await page.$$eval('#panel-general .prior-employee-field', els => els.length), 1, 'Employee ID belongs only in General');
    assert.equal(await page.$$eval('#panel-general .prior-money > span', els => els.length), 0, 'Prior Pay amount fields must not add an RM currency prefix');
    assert.equal(await page.$eval('#priorSerialNo', el => el.value), '1', 'General details must show the selected record SN');
    assert.equal(await page.$eval('label[for="priorSerialNo"]', el => el.textContent.trim()), 'SN');
    assert.equal(await page.$eval('#priorInfo', el => el.hidden), true, 'The details header must not show the info icon');
    assert.deepEqual(await page.$$eval('#priorIndustry option', options => options.map(option => option.value)), [
      '', 'HOSPITALITY', 'OIL AND GAS', 'MANUFACTURING', 'RETAIL', 'TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION'
    ]);
    assert.deepEqual(await page.$$eval('#priorJob option', options => options.map(option => option.value)), [
      '', 'MARKETING', 'HUMAN RESOURCES', 'OPERATIONS', 'FINANCE', 'INFORMATION TECHNOLOGY', 'SALES', 'ADMINISTRATION'
    ]);
    assert.deepEqual(await page.$$eval('#priorPayRate option', options => options.map(option => option.value)), [
      '', 'Monthly', 'Fortnightly', 'Weekly', 'Daily', 'Hourly', 'Annual'
    ]);
    assert.ok(await page.$('#priorNext'), 'The form needs a Next button like Travel Mileage');
    assert.equal(await page.$eval('#priorUpdate', el => el.hidden), true);
    assert.equal(await page.$eval('#priorDraft', el => el.hidden), false);
    assert.equal(await page.$eval('#priorSaveStatus', el => el.hidden), true, 'The unchanged form must not show All changes saved');
    assert.equal(await page.$eval('#priorSaveStatus', el => el.textContent.trim()), '');
    assert.ok(await page.$eval('#priorSaveBar', el => document.querySelector('#priorMain').contains(el)), 'Actions belong after the form inside scrolling content');
    for (const theme of ['dark', 'light']) {
      await capture(theme, 'general');
      await capture(theme, 'general_bottom', true);
    }
    await fill('notes', 'Whole form update');
    assert.equal(await page.$eval('#priorSaveStatus', el => el.hidden), false);
    assert.equal(await page.$eval('#priorSaveStatus', el => el.textContent.trim()), 'Unsaved changes');
    await click('#priorNext');
    assert.equal(await selected(), 'tab-earnings');
    assert.equal(await page.$eval('#earningsFields .prior-field:first-child label', el => el.textContent.trim()), 'Tax Year');
    assert.deepEqual(await page.$eval('[name="taxYear"]', el => ({
      tagName: el.tagName,
      value: el.value,
      firstOption: el.options?.[0]?.textContent.trim() || '',
      years: el.options ? [...el.options].slice(1, 4).map(option => option.value) : []
    })), { tagName: 'SELECT', value: '', firstOption: 'Select Tax Year', years: ['2026', '2025', '2024'] }, 'Tax Year must be the first YTD Earning Detail dropdown');
    assert.equal(await page.$$eval('#panel-earnings .prior-employee-field', els => els.length), 0, 'YTD Earning Detail must not repeat Employee ID');
    assert.equal(await page.$$eval('#panel-earnings .prior-unit, #panel-earnings .prior-money > span', els => els.length), 0, 'YTD Earning Detail must not show MYR or RM currency text');
    assert.equal(await page.$eval('#earningsAttachmentTitle', el => el.textContent.trim()), 'Upload Attachment');
    assert.deepEqual(await page.$eval('#earningsAttachments .prior-file', el => {
      const style = getComputedStyle(el);
      return {
        name: el.querySelector('.prior-file-name')?.textContent.trim() || '',
        hasSecondaryCopy: !!el.querySelector('small'),
        hasPaperclipTile: !!el.querySelector('.prior-file-icon .fa-paperclip'),
        hasCloseAction: !!el.querySelector('button .fa-xmark'),
        bordered: style.borderStyle === 'solid' && style.borderWidth === '1px',
        rounded: style.borderRadius === '12px',
        filled: style.backgroundColor !== 'rgba(0, 0, 0, 0)'
      };
    }), {
      name: 'screenshot_20251231-152106.jpg', hasSecondaryCopy: false,
      hasPaperclipTile: true, hasCloseAction: true,
      bordered: true, rounded: true, filled: true
    }, 'Prior Pay attachments must use the same single-row attachment design as claim forms');
    assert.equal(await page.$eval('#priorPrevious', el => el.hidden), false);
    for (const theme of ['dark', 'light']) await capture(theme, 'earnings_bottom', true);
    await fill('taxYear', '2025');
    await fill('normalEarning', '250.50');
    await page.evaluate(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['Wizard proof'], 'prior-proof.txt', { type: 'text/plain' }));
      const input = document.querySelector('#earningsFiles');
      input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await click('#priorPrevious');
    assert.equal(await selected(), 'tab-general');
    assert.equal(await page.$eval('[name="notes"]', el => el.value), 'Whole form update');
    await click('#priorNext');
    assert.equal(await page.$eval('[name="taxYear"]', el => el.value), '2025');
    assert.equal(await page.$eval('[name="normalEarning"]', el => el.value), '250.50');
    await click('#priorNext');
    assert.equal(await selected(), 'tab-reliefs');
    assert.equal(await page.$$eval('#panel-reliefs .prior-employee-field', els => els.length), 0, 'Tax Reliefs must not repeat Employee ID');
    assert.equal(await page.$$eval('#panel-reliefs .prior-unit, #panel-reliefs .prior-money > span', els => els.length), 0, 'Tax Reliefs must not show MYR or RM currency text');
    assert.equal(await page.$eval('#reliefsAttachmentTitle', el => el.textContent.trim()), 'Upload Attachment');
    assert.equal(await page.$eval('#priorNext', el => el.hidden), true);
    assert.equal(await page.$eval('#priorUpdate', el => el.hidden), false);
    assert.equal(await page.$$eval('#priorUpdate i', icons => icons.length), 0, 'Update must not show a check icon');
    assert.equal(await page.$$eval('#reliefsFields input', els => els.length), 23);
    await fill('gifts', '42');
    await click('#priorPrevious');
    await click('#priorPrevious');
    await click('#priorDraft');
    await page.waitForFunction(() => document.querySelector('#priorSaveStatus').textContent === 'Draft saved on this device');
    await page.reload({ waitUntil: 'networkidle0' });
    await open();
    assert.equal(await page.$eval('[name="notes"]', el => el.value), 'Whole form update');
    assert.equal(await page.$eval('[name="taxYear"]', el => el.value), '2025');
    assert.equal(await page.$eval('[name="normalEarning"]', el => el.value), '250.5');
    assert.equal(await page.$eval('[name="gifts"]', el => el.value), '42');
    await click('#priorNext');
    assert.equal(await page.$eval('[name="taxYear"]', el => el.value), '2025');
    assert.equal(await page.$eval('[name="normalEarning"]', el => el.value), '250.5');
    assert.equal(await page.$eval('#earningsAttachments a', async el => (await fetch(el.href)).text()), 'Wizard proof');
    await click('#priorNext');
    assert.equal(await page.$eval('[name="gifts"]', el => el.value), '42');
    for (const theme of ['dark', 'light']) await capture(theme, 'reliefs_bottom', true);
    await click('#priorUpdate');
    await page.waitForFunction(() => !document.querySelector('#priorListView').hidden);
    await page.reload({ waitUntil: 'networkidle0' });
    await open();
    assert.equal(await page.$eval('[name="notes"]', el => el.value), 'Whole form update');
    await fill('reasonLeaving', '   ');
    await click('#priorNext');
    await click('#priorNext');
    await click('#priorUpdate');
    assert.equal(await selected(), 'tab-general', 'Final Update must reveal invalid earlier fields');
    assert.equal(await page.$eval('[name="reasonLeaving"]', el => el.validity.valid), false);
    await fill('reasonLeaving', 'BETTER CAREER');
    await fill('dateTo', '1980-01-01');
    await click('#priorNext');
    await click('#priorNext');
    await click('#priorUpdate');
    assert.equal(await selected(), 'tab-general');
    assert.equal(await page.$eval('[name="dateTo"]', el => el.validity.valid), false);
    assert.equal(await page.$eval('[name="dateTo"]', el => el.validationMessage), 'End Date must be on or after Start Date.');
    await page.click('#priorBack');
    await page.click('#priorDialogConfirm');
    await open();
    assert.equal(await page.$eval('[name="dateTo"]', el => el.validity.valid), true);
    await click('#priorNext');
    await click('#earningsAttachments [aria-label="Remove prior-proof.txt"]');
    await click('#priorNext');
    await click('#priorUpdate');
    await page.waitForFunction(() => !document.querySelector('#priorListView').hidden);
    await page.reload({ waitUntil: 'networkidle0' });
    await open();
    for (const width of [360, 390, 420]) {
      await page.setViewport({ width, height: 780 });
      for (const tab of ['general', 'earnings', 'reliefs']) {
        await click('#tab-' + tab);
        await page.$eval('#priorSaveBar', el => el.scrollIntoView({ block: 'center' }));
        assert.ok(await page.$eval('.phone-container', el => el.scrollWidth <= el.clientWidth + 1));
        const button = tab === 'reliefs' ? '#priorUpdate' : '#priorNext';
        assert.ok(await page.$eval(button, el => {
          const r = el.getBoundingClientRect(), nav = document.querySelector('.bottom-nav').getBoundingClientRect();
          return r.bottom <= nav.top && r.left >= 0 && r.right <= innerWidth;
        }), 'Buttons must scroll into view above global navigation');
      }
    }
    assert.ok(await page.$eval('#earningsAttachments', el => !el.textContent.includes('prior-proof.txt')));
    await page.click('#priorBack');
    await page.click('[data-record="2"] .prior-ytd');
    assert.equal(await page.$eval('[name="normalEarning"]', el => el.value), '');
    assert.equal(await selected(), 'tab-general');
    await page.click('#priorBack');
    const secondPage = await browser.newPage();
    await secondPage.setViewport({ width: 420, height: 900 });
    await secondPage.goto(url, { waitUntil: 'networkidle0' });
    await secondPage.waitForSelector('[data-record="1"]');
    await secondPage.click('[data-record="1"] .prior-ytd');
    await page.bringToFront();
    await open();
    await fill('notes', 'Draft from another browser tab');
    await click('#priorDraft');
    await page.waitForFunction(() => document.querySelector('#priorSaveStatus').textContent === 'Draft saved on this device');
    await secondPage.bringToFront();
    await secondPage.click('#tab-reliefs');
    await secondPage.$eval('[name="gifts"]', el => { el.value = '55'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await secondPage.$eval('#priorUpdate', el => el.scrollIntoView({ block: 'center' }));
    await secondPage.click('#priorUpdate');
    await secondPage.waitForFunction(() => !document.querySelector('#priorListView').hidden);
    await secondPage.close();
    await page.bringToFront();
    await page.reload({ waitUntil: 'networkidle0' });
    await open();
    assert.equal(await page.$eval('[name="notes"]', el => el.value), 'Draft from another browser tab', 'Another view must not delete a draft it has not loaded');
    assert.equal(await page.$eval('[name="gifts"]', el => el.value), '55');
    await page.click('#priorBack');
    for (const theme of ['dark', 'light']) await capture(theme, 'list');
    assert.deepEqual(errors, []);
    console.log('PASS: read-only card details modal, YTD form routing, modal close/focus/phone layouts, Next/Back flow, final Update, persistent drafts, attachments, validation and responsive light/dark layouts.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
