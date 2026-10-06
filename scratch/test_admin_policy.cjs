const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.resolve('modules/admin/options/policy-sop.html')).href;
    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url + '?theme=' + theme, { waitUntil: 'load' });
      assert.ok(await page.$('#policyList .policy-card'), 'Policy option must display the reference document');
      assert.match(await page.$eval('#policyList', n => n.textContent), /CHECK TITLE/);
      assert.match(await page.$eval('#policyList', n => n.textContent), /20 Dec 2024/);
      assert.ok(await page.$('.policy-card-title-link'), 'The policy title must open its document');
      // Wait for the shared 300ms theme transition before taking the initial screenshot.
      await page.evaluate(() => Promise.all([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 350))]));
      await page.screenshot({ path: `scratch/admin_policy_${theme}.png` });
      await page.click('#policyFilterTrigger');
      assert.equal(await page.$eval('#policyFilterModal', n => n.getAttribute('aria-hidden')), 'false');
      await page.type('#policyReference', 'not-a-reference');
      await page.click('#applyPolicyFilter');
      assert.ok(await page.$eval('#policyEmptyState', n => !n.hidden), 'Unmatched reference must show an empty state');
      await page.click('#policyFilterTrigger');
      await page.click('#resetPolicyFilter');
      await page.$eval('#policyFrom', n => { n.value = '2025-01-01'; });
      await page.$eval('#policyTo', n => { n.value = '2024-01-01'; });
      await page.click('#applyPolicyFilter');
      assert.ok(await page.$eval('#policyFilterError', n => !n.hidden), 'Reversed date range must be rejected');
      await page.click('#resetPolicyFilter');
      await page.$eval('#sopFrom', n => { n.value = '2024-01-01'; });
      await page.click('#applyPolicyFilter');
      assert.ok(await page.$eval('#policyEmptyState', n => !n.hidden), 'A document without SOP cannot match an explicit SOP date filter');
      await page.click('#policyFilterTrigger');
      await page.click('#resetPolicyFilter');
      await page.type('#policyTitle', 'check');
      await page.select('#policyDepartment', 'ADMINISTRATION');
      await page.$eval('#policyFrom', n => { n.value = '2024-12-20'; });
      await page.$eval('#policyTo', n => { n.value = '2024-12-20'; });
      await page.click('#applyPolicyFilter');
      assert.equal(await page.$$('#policyList .policy-card').then(n => n.length), 1, 'Title, department and inclusive WEF filters must match');
      await page.click('#policyFilterTrigger');
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'policyFilterTrigger');
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1), 'Policy list must fit mobile widths');
      }
      await page.setViewport({ width: 390, height: 950 });
      await page.screenshot({ path: `scratch/admin_policy_filtered_${theme}.png` });
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('.policy-card-title-link')]);
      assert.match(page.url(), /policy-document.html/);
      assert.equal(await page.$eval('html', n => n.dataset.theme), theme);
      assert.equal(await page.$eval('#policyDocumentFilename', n => n.textContent), 'PeopleTime_UserGuide_v2.pdf');
      await page.waitForFunction(() => { const img = document.querySelector('#policyDocumentImage'); return img && img.complete && img.naturalWidth > 0; });
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1), 'PDF preview must fit mobile widths');
      }
      await page.setViewport({ width: 390, height: 950 });
      await page.screenshot({ path: `scratch/admin_policy_pdf_${theme}.png` });
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('#policyDocumentBack')]);
      assert.equal(await page.$eval('html', n => n.dataset.theme), theme);
      await page.click('#policyFilterTrigger');
      assert.equal(await page.$eval('#policyTitle', n => n.value), 'check', 'Returning from PDF must preserve filters');
      await page.screenshot({ path: `scratch/admin_policy_filter_${theme}.png` });
      await page.keyboard.press('Escape');
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('.policy-document-link')]);
      assert.match(page.url(), /policy-document.html/, 'The Policy button must open the same document as the title');
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('#policyDocumentBack')]);
      await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('[data-admin-back]')]);
      assert.match(page.url(), /admin\/index.html/);
      assert.equal(await page.$eval('html', n => n.dataset.theme), theme);
    }
    await page.goto(pathToFileURL(path.resolve('modules/admin/options/policy-document.html')).href + '?document=missing', { waitUntil: 'load' });
    assert.ok(await page.$eval('#policyDocumentUnavailable', n => !n.hidden), 'Unknown document must show an unavailable state');
    assert.ok(await page.$eval('#policyDocumentPreview', n => n.hidden));
    assert.deepEqual(errors, []);
    console.log('PASS: Policy reference card, filters, date validation, missing SOP, PDF image navigation, preserved filters, unavailable document, both themes and mobile widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
