const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const url = file => pathToFileURL(path.join(root, file)).href;
async function fill(page, selector, value) {
  await page.$eval(selector, (input, next) => {
    input.value = next;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}
async function snapshot(page, name) {
  await page.mouse.move(0, 0);
  await page.$eval('.payroll-pending-content', node => { node.scrollTop = 0; });
  await page.evaluate(async () => {
    await Promise.all(document.getAnimations().filter(animation => animation.constructor.name === 'CSSTransition').map(animation => animation.finished.catch(() => {})));
  });
  await page.screenshot({ path: path.join(__dirname, name + '.png') });
}
async function checkDetailsPopup(page, theme, category) {
  const selector = '#payrollPendingDetails';
  const before = await page.evaluate(() => ({ url: location.href, decisions: localStorage.getItem('pq_payroll_pending_decisions') }));
  assert.deepEqual(await page.$$eval(`${selector} footer button`, nodes => nodes.map(node => node.textContent.trim())), ['Approve', 'Resubmit', 'Cancel', 'Reject']);
  for (const width of [360, 390, 450]) {
    await page.setViewport({ width, height: 950 });
    await snapshot(page, `payroll_pending_${category}_popup_${theme}_${width}`);
    const layout = await page.$eval(`${selector} [role="dialog"]`, panel => {
      const rect = panel.getBoundingClientRect();
      const phone = panel.closest('.phone-container').getBoundingClientRect();
      return {
        centered: Math.abs((rect.top + rect.bottom) / 2 - (phone.top + phone.bottom) / 2) < 2,
        inset: rect.left > phone.left + 8 && rect.right < phone.right - 8 && rect.top > phone.top + 8 && rect.bottom < phone.bottom - 8,
        rounded: parseFloat(getComputedStyle(panel).borderBottomLeftRadius) > 0,
        buttonsFit: [...panel.querySelectorAll('footer button')].every(button => button.scrollWidth <= button.clientWidth + 1),
        colors: [...panel.querySelectorAll('footer button')].map(button => getComputedStyle(button).backgroundColor)
      };
    });
    assert.ok(layout.centered && layout.inset && layout.rounded, 'View Details must appear as a rounded, centered popup inside the phone');
    assert.ok(layout.buttonsFit, 'All four popup actions must fit on mobile');
    assert.deepEqual(layout.colors, Array(4).fill('rgb(124, 58, 237)'));
  }
  await page.setViewport({ width: 360, height: 720 });
  const scrollLayout = await page.$eval(`${selector} [role="dialog"]`, panel => {
    const body = panel.querySelector('.payroll-approval-details-body');
    body.scrollTop = body.scrollHeight;
    const bodyRect = body.getBoundingClientRect();
    const lastRow = body.querySelector('tr:last-child').getBoundingClientRect();
    const footer = panel.querySelector('footer').getBoundingClientRect();
    const phone = panel.closest('.phone-container').getBoundingClientRect();
    return { lastRowVisible: lastRow.top >= bodyRect.top && lastRow.bottom <= bodyRect.bottom + 1, footerVisible: footer.top >= bodyRect.bottom - 1 && footer.bottom <= phone.bottom - 8 };
  });
  assert.ok(scrollLayout.lastRowVisible && scrollLayout.footerVisible, 'Short screens must scroll to the final detail row while keeping all popup actions visible');
  await page.click(`${selector} .action-btn-cancel`);
  assert.equal(await page.$eval(selector, node => node.hidden), true);
  assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), 10, 'Cancel must keep the request pending');
  assert.deepEqual(await page.evaluate(() => ({ url: location.href, decisions: localStorage.getItem('pq_payroll_pending_decisions') })), before, 'Cancel must close details without navigating or saving an approval decision');
  assert.equal(await page.$eval('.payroll-pending-content', node => node.inert), false);
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('three-dots-btn')), true);
  await page.setViewport({ width: 450, height: 950 });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    for (const theme of ['dark', 'light']) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      const faults = [];
      page.on('pageerror', error => faults.push(error.message));
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url('modules/payroll/index.html') + '?scope=team&theme=' + theme, { waitUntil: 'domcontentloaded' });
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#teamPendingApprovalCard')]);
      assert.ok(page.url().includes('/payroll/options/pending-approval.html'), 'Payroll Team must open the new Pending Approval page');
      assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
      assert.deepEqual(await page.$$eval('[data-payroll-tab]', nodes => nodes.map(node => node.textContent.trim())), ['Tax Relief', 'Deduction Request']);
      assert.equal(await page.$$eval('#payrollPendingQueue .approval-request-card', nodes => nodes.length), 10);
      const firstTax = await page.$eval('#payrollPendingQueue .approval-request-card', node => node.textContent);
      for (const text of ['James yong xian', '#99104', 'RBT000000000032', 'TXR01', 'MEDICAL EXPENSES OF PARENTS', 'for parent', '06/09/2024', 'RM 500.00', 'Process', 'No']) assert.ok(firstTax.includes(text), text);
      assert.equal(await page.$eval('.employee-name', node => node.nextElementSibling.classList.contains('employee-id')), true);
      const actionColors = await page.$$eval('.approval-request-card:first-child .pending-action-grid button', nodes => nodes.map(node => getComputedStyle(node).backgroundColor));
      assert.equal(new Set(actionColors).size, 1);
      assert.equal(actionColors[0], 'rgb(124, 58, 237)');
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.equal(await page.$eval('.phone-container', node => node.scrollWidth > node.clientWidth + 1), false);
        assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.some(node => node.scrollWidth > node.clientWidth + 1)), false);
        await snapshot(page, `payroll_pending_tax_${theme}_${width}`);
      }
      await page.click('.approval-request-card .three-dots-btn');
      await page.click('#payrollPendingViewDetails');
      assert.equal(await page.$eval('#payrollPendingDetailsTitle', node => node.textContent), 'Tax Relief Approval');
      assert.equal(await page.$eval('#payrollPendingDetailsTable', node => /Payroll Period|Payroll Cycle/.test(node.textContent)), false);
      await checkDetailsPopup(page, theme, 'tax');
      await page.click('#payrollPendingFilterTrigger');
      assert.deepEqual(await page.$$eval('#payrollPendingFilter .approval-filter-fields > label, #payrollPendingFilter .approval-filter-date-row:not([data-custom-days]) label', nodes => nodes.map(node => node.textContent)), ['Search Keyword', 'Start Date', 'End Date', 'Outstanding Days']);
      await snapshot(page, `payroll_pending_filter_${theme}`);
      await fill(page, '#payrollPendingFilter-keyword', 'James');
      await page.click('#payrollPendingFilter .approval-filter-apply');
      assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), 1);
      await page.click('#payrollPendingFilterTrigger');
      await page.click('#payrollPendingFilter [data-action="reset"]');
      await fill(page, '#payrollPendingFilter-startDate', '2026-03-19');
      await fill(page, '#payrollPendingFilter-endDate', '2026-03-19');
      await page.click('#payrollPendingFilter .approval-filter-apply');
      assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), 2, 'Tax date filter uses transaction dates');
      await page.click('#payrollPendingFilterTrigger');
      await page.click('#payrollPendingFilter [data-action="reset"]');
      await fill(page, '#payrollPendingFilter-startDate', '2026-10-03');
      await fill(page, '#payrollPendingFilter-endDate', '2026-10-02');
      await page.click('#payrollPendingFilter .approval-filter-apply');
      assert.equal(await page.$eval('#payrollPendingFilter', node => node.hidden), false);
      assert.match(await page.$eval('#payrollPendingFilter .approval-filter-error', node => node.textContent), /End Date/);
      await page.click('#payrollPendingFilter [data-action="reset"]');
      await page.select('#payrollPendingFilter-days', 'custom');
      await fill(page, '#payrollPendingFilter-minDays', '0');
      await fill(page, '#payrollPendingFilter-maxDays', '0');
      await page.click('#payrollPendingFilter .approval-filter-apply');
      assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), 0);
      await page.click('#payrollPendingFilterTrigger');
      await page.click('#payrollPendingFilter [data-action="reset"]');
      await page.keyboard.press('Escape');

      await page.click('[data-payroll-tab="deduction"]');
      assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), 10);
      const firstDeduction = await page.$eval('.approval-request-card', node => node.textContent);
      for (const text of ['#EBB12', 'HUMAN RESOURCE', 'PDR000000000062', '+ UNIFORM ALLOWANCE', 'Start Allowance', '01/07/2025', '31/07/2025', '31.00', 'RM 0.00', '202507', 'MONTH END', '03/07/2025']) assert.ok(firstDeduction.includes(text), text);
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.equal(await page.$eval('.phone-container', node => node.scrollWidth > node.clientWidth + 1), false);
        await snapshot(page, `payroll_pending_deduction_${theme}_${width}`);
      }
      await page.click('.approval-request-card .three-dots-btn');
      await page.click('#payrollPendingViewDetails');
      assert.equal(await page.$eval('#payrollPendingDetailsTitle', node => node.textContent), 'Deduction Request Approval');
      const detail = await page.$eval('#payrollPendingDetailsTable', node => node.textContent);
      for (const text of ['Document Reference', 'PDR000000000062', 'Department', 'HUMAN RESOURCE', 'Days', '31.00', 'Amount', 'RM 0.00']) assert.ok(detail.includes(text), text);
      await snapshot(page, `payroll_pending_details_${theme}`);
      await checkDetailsPopup(page, theme, 'deduction');
      await page.click('.approval-request-card .three-dots-btn');
      await page.click('#payrollPendingViewDetails');
      await page.keyboard.press('Escape');
      await page.click('#payrollPendingFilterTrigger');
      await fill(page, '#payrollPendingFilter-startDate', '2025-07-08');
      await fill(page, '#payrollPendingFilter-endDate', '2025-07-08');
      await page.click('#payrollPendingFilter .approval-filter-apply');
      assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), 1, 'Deduction date filtering must overlap the requested date range');
      await page.click('#payrollPendingFilterTrigger');
      await page.click('#payrollPendingFilter [data-action="reset"]');
      await page.keyboard.press('Escape');
      for (const [action, count] of [['approve', 9], ['resubmit', 8], ['reject', 7]]) {
        await page.click(`.approval-request-card [data-payroll-action="${action}"]`);
        assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), count);
      }
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('[data-payroll-tab="deduction"]', node => node.getAttribute('aria-selected')), 'true');
      assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), 7);
      await page.click('[data-payroll-tab="tax"]');
      await page.click('#payrollPendingFilterTrigger');
      await fill(page, '#payrollPendingFilter-keyword', 'James');
      await page.click('#payrollPendingFilter .approval-filter-apply');
      await page.click('#payrollPendingSelectAll');
      assert.equal(await page.$$eval('.approval-card-checkbox:checked', nodes => nodes.length), 1);
      await page.click('#payrollPendingBulk [data-payroll-action="approve"]');
      assert.equal(await page.$$eval('.approval-request-card', nodes => nodes.length), 0);
      assert.equal(await page.$eval('#payrollPendingBulk', node => node.hidden), true);
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#payrollPendingBack')]);
      assert.equal(await page.$eval('#scopeTeamSection', node => getComputedStyle(node).display), 'block');
      assert.equal(await page.$eval('#teamPendingApprovalCount', node => node.textContent), '16');
      assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
      assert.deepEqual(faults, []);
      console.log(`${theme}: team entry, datasets, filters, centered popups, four purple actions, Cancel, short-screen scrolling, local actions and counts passed.`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
