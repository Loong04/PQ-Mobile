/** Native document + workflow regression suite; no iframe is accepted. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.WEB_URL || process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const reportPath = resolve(project, 'docs/web-native-validation.md');
const red = process.argv.includes('--red-baseline');
const sourcePage = process.argv.find(argument => argument.startsWith('--source-page='))?.slice('--source-page='.length);
const previousReport = sourcePage ? await readFile(reportPath, 'utf8').catch(() => '') : '';
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox', '--disable-gpu'],
});
const checks = [];
const errors = [];
const context = await browser.createBrowserContext();
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
await page.setViewport({ width: 1440, height: 900 });
await page.setRequestInterception(true);
page.on('request', request => request.url().startsWith(base) || request.url().startsWith('data:') ? request.continue() : request.abort());
async function check(name, run) {
  try { const evidence = await run(); checks.push({ name, passed: true, evidence }); console.log('PASS ' + name); }
  catch (error) { checks.push({ name, passed: false, error: error.message }); console.log('FAIL ' + name + ': ' + error.message); }
}
const pause = ms => new Promise(resolvePause => setTimeout(resolvePause, ms));
async function clickLabel(label, within = 'body') {
  const found = await page.evaluate(({ label, within }) => {
    const nodes = [...document.querySelectorAll(within + ' button,' + within + ' a')];
    const target = nodes.find(node => node.getBoundingClientRect().height > 0 && node.textContent.trim().replace(/\s+/g, ' ') === label);
    target?.click();
    return !!target;
  }, { label, within });
  assert(found, `No visible ${label} action in ${within}`);
}
async function nativeReady() {
  await page.waitForSelector('#web-business-shell', { timeout: 10000 });
  await page.waitForSelector('.business-outlet', { timeout: 10000 });
  assert.equal(page.frames().length, 1, 'A business page must have only its top window frame');
  assert.equal(await page.$$eval('iframe', nodes => nodes.length), 0);
  assert(await page.$('html[data-web-native]'));
}
async function navigateBusiness(path) {
  await page.goto(base + '/workspace/' + path, { waitUntil: 'load' });
  await nativeReady();
  await pause(60);
}
async function pageGeometry(targetPage = page) {
  return targetPage.evaluate(() => {
    const outlet = document.querySelector('.business-outlet');
    const phone = document.querySelector('.phone-container');
    const main = document.querySelector('.main-content');
    const scrolling = [...document.querySelectorAll('body *')].filter(element => {
      if (element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') return false;
      if (element.closest('.sidebar,dialog,[role="dialog"],[role="menu"],.command-palette,.modal,.overlay,[class*="modal"],[class*="overlay"],.web-business-tools')) return false;
      const rectangle = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (rectangle.width < 20 || rectangle.height < 72 || style.visibility === 'hidden' || !['auto', 'scroll'].includes(style.overflowY)) return false;
      if (element.querySelector('table') && ['auto', 'scroll'].includes(style.overflowX)) return false;
      return element.scrollHeight > element.clientHeight + 3;
    }).map(element => ({ tag: element.tagName, id: element.id, className: String(element.className).slice(0, 120), height: element.clientHeight, scrollHeight: element.scrollHeight }));
    return {
      viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight,
      outletWidth: outlet?.getBoundingClientRect().width || null,
      phoneWidth: phone?.getBoundingClientRect().width || null,
      phoneHeight: phone?.getBoundingClientRect().height || null,
      mainHeight: main?.clientHeight || null, mainScrollHeight: main?.scrollHeight || null,
      mainOverflowY: main ? getComputedStyle(main).overflowY : null,
      internalVerticalScrollers: scrolling,
    };
  });
}
function assertNativeGeometry(geometry, pagePath) {
  assert(geometry.documentWidth <= geometry.viewportWidth + 2, `${pagePath}: document horizontal overflow`);
  assert.deepEqual(geometry.internalVerticalScrollers, [], `${pagePath}: business content has a nested vertical viewport`);
  if (geometry.phoneWidth) {
    assert(geometry.phoneWidth > 850, `${pagePath}: content remains a narrow mobile strip (${geometry.phoneWidth}px)`);
    assert(geometry.phoneWidth >= geometry.outletWidth * 0.88, `${pagePath}: source content does not fill the business outlet`);
  }
  if (geometry.mainHeight) assert(geometry.mainScrollHeight <= geometry.mainHeight + 3, `${pagePath}: source main content is clipped to its mobile viewport`);
}

async function sourceDifferential() {
  const snapshot = resolve(project, 'source-snapshot');
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
  const server = createServer((request, response) => {
    try {
      const file = resolve(snapshot, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
      if (!file.startsWith(snapshot + sep)) { response.writeHead(403).end(); return; }
      const content = readFileSync(file);
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' }); response.end(content);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(listen => server.listen(0, '127.0.0.1', listen));
  const sourceURL = 'http://127.0.0.1:' + server.address().port;
  const catalogue = JSON.parse(await readFile(resolve(project, 'src/generated/pages.json'), 'utf8'));
  const entries = sourcePage ? catalogue.filter(entry => entry.path === sourcePage) : catalogue;
  assert(entries.length, 'Requested source page must exist in the catalogue');
  const rows = [];
  const failed = [];
  let index = 0;
  async function inspect(target, url, native) {
    const localErrors = [];
    const onError = error => localErrors.push(error.message);
    target.on('pageerror', onError);
    try {
      await target.goto(url, { waitUntil: 'load', timeout: 20000 });
      if (native) await target.waitForSelector('#web-business-shell', { timeout: 10000 });
      let deferredQueueReady = null;
      if (new URL(url).pathname.endsWith('/modules/claims/options/pending-approval.html')) {
        // The original page schedules its queue 100 ms after DOMContentLoaded.
        // Await actual source controls rather than racing that original timer.
        await target.waitForFunction(() => {
          const fixture = window.MOCK_TEAM_APPROVALS;
          const queue = document.getElementById('teamApprovalsQueue');
          if (!Array.isArray(fixture) || !queue || !queue.children.length) return false;
          const cards = [...queue.querySelectorAll('pending-approval-card')];
          return cards.length === fixture.length && cards.every(card => card.querySelector('input.approval-card-checkbox'));
        }, { timeout: 10000 });
        deferredQueueReady = await target.evaluate(() => ({
          expectedRows: window.MOCK_TEAM_APPROVALS.length,
          renderedRows: document.querySelectorAll('#teamApprovalsQueue pending-approval-card').length,
          checkboxControls: document.querySelectorAll('#teamApprovalsQueue input.approval-card-checkbox').length,
        }));
      }
      await pause(80);
      const state = await target.evaluate(native => {
        const controls = [...document.querySelectorAll('input,select,textarea')]
          .filter(element => !native || element.closest('.business-outlet') || !element.closest('#web-business-shell'))
          .map(element => ({
            tag: element.tagName, id: element.id, name: element.name, type: element.type,
            required: !!element.required, disabled: !!element.disabled, min: element.getAttribute('min'), max: element.getAttribute('max'),
            maxlength: element.getAttribute('maxlength'), multiple: !!element.multiple,
            options: element.tagName === 'SELECT' ? [...element.options].map(option => option.value) : [],
          }));
        return { controls, iframeCount: document.querySelectorAll('iframe').length, native: document.documentElement.hasAttribute('data-web-native'), title: document.title };
      }, native);
      return { ...state, deferredQueueReady, errors: localErrors, frames: target.frames().length, ...(native ? { geometry: await pageGeometry(target) } : {}) };
    } finally { target.off('pageerror', onError); }
  }
  async function worker() {
    const isolated = await browser.createBrowserContext();
    const original = await isolated.newPage();
    const desktop = await isolated.newPage();
    for (const target of [original, desktop]) {
      await target.setViewport({ width: 1440, height: 900 });
      await target.setRequestInterception(true);
      target.on('request', request => request.url().startsWith(base) || request.url().startsWith(sourceURL) || request.url().startsWith('data:') ? request.continue() : request.abort());
    }
    try {
      while (index < entries.length) {
        const entry = entries[index++];
        try {
          const before = await inspect(original, sourceURL + '/' + entry.path + '?webView=details', false);
          const after = await inspect(desktop, base + '/workspace/' + entry.path + '?webView=details', true);
          const novelErrors = after.errors.filter(message => !before.errors.includes(message));
          const row = { path: entry.path, sourceControls: before.controls.length, nativeControls: after.controls.length, fieldsPreserved: JSON.stringify(before.controls) === JSON.stringify(after.controls), deferredQueueReady: before.deferredQueueReady ? { source: before.deferredQueueReady, native: after.deferredQueueReady } : null, novelErrors, frames: after.frames, ...after.geometry };
          rows.push(row);
          const changes = before.controls.map((control, position) => ({ position, before: control, after: after.controls[position] })).filter(change => JSON.stringify(change.before) !== JSON.stringify(change.after));
          if (after.controls.length > before.controls.length) changes.push({ extraControls: after.controls.slice(before.controls.length) });
          assert(row.fieldsPreserved, `${entry.path}: original controls, constraints or select values changed: ${JSON.stringify(changes.slice(0, 5))}`);
          assert(after.native && after.iframeCount === 0 && after.frames === 1, `${entry.path}: not a native top document`);
          assert.deepEqual(novelErrors, [], `${entry.path}: new script errors`);
          assertNativeGeometry(after.geometry, entry.path);
        } catch (error) { failed.push({ path: entry.path, error: error.message }); }
        if (rows.length && rows.length % 20 === 0) console.log(`Inspected ${rows.length}/${entries.length} native documents.`);
      }
    } finally { await isolated.close(); }
  }
  try { await Promise.all([worker(), worker()]); }
  finally { await new Promise(close => server.close(close)); }
  assert.equal(catalogue.length, 118, 'All original active source pages must be covered');
  assert.equal(rows.length, entries.length, 'Every selected source page must complete inspection');
  assert.deepEqual(failed, [], `Native document differential failed: ${failed.map(item => item.path).join(', ')}`);
  return { pages: rows.length, sourceControls: rows.reduce((sum, row) => sum + row.sourceControls, 0), nativeControls: rows.reduce((sum, row) => sum + row.nativeControls, 0), novelErrors: rows.reduce((sum, row) => sum + row.novelErrors.length, 0), everyPageHasOneFrame: rows.every(row => row.frames === 1), fieldParity: rows.every(row => row.fieldsPreserved), deferredQueues: rows.filter(row => row.deferredQueueReady).map(row => ({ path: row.path, ...row.deferredQueueReady })), documentScroll: 'Single vertical document scroll; menus, dialogs, editing controls and horizontal tables excluded' };
}

try {
  if (red) {
    await check('business content belongs to the top document with one page scroll', async () => {
      await page.goto(base + '/#/page/' + encodeURIComponent('modules/project-task/options/work-plan.html'), { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('iframe', { timeout: 4000 });
      const observation = await page.evaluate(() => {
        const frame = document.querySelector('iframe');
        const main = frame?.contentDocument?.querySelector('.main-content');
        return { iframeCount: document.querySelectorAll('iframe').length, path: location.pathname, sourceMainClientHeight: main?.clientHeight || null, sourceMainScrollHeight: main?.scrollHeight || null };
      });
      checks.push({ name: 'red baseline observation', passed: false, evidence: observation });
      assert.equal(observation.iframeCount, 0, 'Work Plan is currently embedded in an iframe; the business content must be in the top window document');
    });
  } else if (sourcePage) {
    await check('focused native source document differential', sourceDifferential);
  } else {
    const navigation = await import('../src/config/moduleNavigation.ts');
    const modules = await import('../src/config/modules.ts');
    await check('native sidebar opens attendance options and expands live submenu actions', async () => {
      await page.goto(base + '/#/dashboard', { waitUntil: 'load' });
      await page.waitForSelector('.sidebar');
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()), '#435875');
      await clickLabel('Time & Attendance', '.sidebar');
      await page.waitForFunction(() => location.hash.startsWith('#/module/attendance'));
      await page.waitForSelector('.module-option');
      assert.equal(page.frames().length, 1);
      const toggle = await page.$('.nav-module-toggle');
      assert(toggle, 'Module sidebar requires a separate expandable feature menu');
      if (await toggle.evaluate(element => element.getAttribute('aria-expanded')) !== 'true') await toggle.click();
      assert.equal(await toggle.evaluate(element => element.getAttribute('aria-expanded')), 'true');
      assert((await page.$$eval('.nav-submenu-item', nodes => nodes.filter(node => node.getBoundingClientRect().height > 0).length)) > 0);
      return { route: await page.evaluate(() => location.hash), iframeCount: await page.$$eval('iframe', nodes => nodes.length) };
    });
    await check('all native module landings show their original individual and team options', async () => {
      const coverage = [];
      for (const module of modules.modules) {
        await page.goto(base + '/#/module/' + module.id, { waitUntil: 'load' });
        await page.waitForSelector('.module-option');
        const available = navigation.getModuleOptions(module.id);
        for (const scope of ['individual', 'team']) {
          const expected = navigation.getModuleOptions(module.id, scope);
          if (!expected.length) continue;
          const label = scope === 'individual' ? 'Individual' : 'Team';
          const switcherExists = await page.evaluate(label => [...document.querySelectorAll('main button')].some(node => node.getBoundingClientRect().height > 0 && node.textContent.trim() === label), label);
          if (switcherExists) await clickLabel(label, 'main');
          const visible = await page.$$eval('.module-option[data-option-id]', nodes => nodes.filter(node => node.getBoundingClientRect().height > 0).map(node => node.dataset.optionId));
          for (const option of expected) assert(visible.includes(option.id), `${module.id}/${scope}: ${option.title} is not reachable in native options`);
          coverage.push({ module: module.id, scope, options: visible.length });
        }
        assert(available.length, `${module.id}: empty option metadata`);
      }
      return coverage;
    });
    await check('Work Plan opens a full-width top document with all 21 original fields', async () => {
      await page.goto(base + '/#/module/project-task', { waitUntil: 'load' });
      await page.waitForSelector('.module-option');
      const plan = navigation.getModuleOptions('project-task').find(option => option.path.split(/[?#]/)[0] === 'modules/project-task/options/work-plan.html');
      assert(plan);
      await page.click(`.module-option[data-option-id="${plan.id}"]`);
      await nativeReady();
      assert.equal(new URL(page.url()).pathname, '/workspace/modules/project-task/options/work-plan.html');
      assert.equal(await page.$$eval('input,select,textarea', nodes => nodes.filter(element => element.closest('.business-outlet') || !element.closest('#web-business-shell')).length), 21);
      assert(await page.$('#workPlanDescription'));
      const geometry = await pageGeometry();
      assertNativeGeometry(geometry, 'Work Plan');
      assert(geometry.documentHeight > geometry.viewportHeight, 'Long forms must grow the document instead of scrolling a phone viewport');
      const formWidth = await page.$eval('#workPlanForm', element => element.getBoundingClientRect().width);
      assert(formWidth >= 850, `Work Plan still uses a narrow mobile form strip (${formWidth}px)`);
      const sourceHeader = await page.$eval('.project-header', element => ({ height: element.getBoundingClientRect().height, display: getComputedStyle(element).display }));
      assert(sourceHeader.display === 'none' || sourceHeader.height <= 120, 'A mobile hero header must not dominate the desktop business document');
      return { ...geometry, formWidth, sourceHeader };
    });
    await check('language and theme switches keep the current source form draft intact', async () => {
      await page.type('#workPlanDescription', 'Native enterprise draft 004177');
      const draft = await page.$eval('#workPlanDescription', node => node.value);
      const url = page.url();
      await page.click('.language-button');
      await page.waitForFunction(() => document.documentElement.lang === 'zh-CN');
      assert.equal(await page.$eval('#workPlanDescription', node => node.value), draft);
      const themeButton = await page.$('.topbar-tools > .icon-button');
      assert(themeButton, 'Theme controls must remain available in business chrome');
      await themeButton.click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
      assert.equal(await page.$eval('#workPlanDescription', node => node.value), draft);
      assert.equal(page.url(), url);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('peoplehcm:web:preferences:v1')));
      assert.equal(saved.locale, 'zh'); assert.equal(saved.mode, 'dark');
      await navigateBusiness('modules/admin/options/book-resource.html');
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'zh-CN');
      assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
      await page.click('.language-button');
      await page.click('.topbar-tools > .icon-button');
      await page.waitForFunction(() => document.documentElement.lang === 'en' && document.documentElement.dataset.theme === 'light');
      return { saved, draftPreserved: true };
    });
    await check('resource booking validates, saves, confirms and survives a document reload', async () => {
      await navigateBusiness('modules/admin/options/book-resource.html');
      const before = await page.$$eval('#bookingRecords .history-card-item', nodes => nodes.length);
      await page.click('#bookingAdd'); await page.click('#bookingPlan');
      assert.equal(await page.$$eval('#bookingRecords .history-card-item', nodes => nodes.length), before);
      await page.evaluate(() => { document.getElementById('bookingStartTime').value = '10:00'; document.getElementById('bookingEndTime').value = '09:00'; });
      await page.select('#bookingResource', 'selangor-room'); await page.select('#bookingTask', 'meeting'); await page.click('#bookingPlan');
      assert.match(await page.$eval('#bookingFormFeedback', node => node.textContent), /End Time/);
      await page.$eval('#bookingEndTime', node => { node.value = '11:00'; node.dispatchEvent(new Event('input', { bubbles: true })); });
      await page.type('#bookingPurpose', 'Native web quarterly planning'); await page.type('#bookingMeetingRef', 'NATIVE-WEB-001'); await page.type('#bookingRemarks', 'Original booking workflow.');
      assertNativeGeometry(await pageGeometry(), 'Resource Booking editor');
      await page.click('#bookingPlan');
      assert.equal(await page.$$eval('#bookingRecords .history-card-item', nodes => nodes.length), before + 1);
      assert.equal(await page.$$eval('[data-booking-status="plan"]', nodes => nodes.length), 1);
      await page.click('[data-booking-action="confirm"]');
      assert.equal(await page.$$eval('[data-booking-status="plan"]', nodes => nodes.length), 0);
      await page.reload({ waitUntil: 'load' }); await nativeReady();
      assert.match(await page.$eval('#bookingRecords', node => node.textContent), /NATIVE-WEB-001/);
      assert.equal(await page.$$eval('#bookingRecords .history-card-item', nodes => nodes.length), before + 1);
      return { originalRecords: before, persistedRecords: before + 1 };
    });
    await check('original form cancel returns to native module options with the original scope', async () => {
      await navigateBusiness('modules/project-task/options/work-plan.html');
      await page.click('[data-page-form-cancel]');
      await page.waitForFunction(() => location.pathname === '/' && location.hash.startsWith('#/module/project-task'));
      await page.waitForSelector('.module-option');
      const plan = navigation.getModuleOptions('project-task', 'individual').find(option => option.path.includes('work-plan.html'));
      assert(await page.$(`.module-option[data-option-id="${plan.id}"]`));
      return { route: await page.evaluate(() => location.hash) };
    });
    await check('employee IDs remain below names with their leading hash', async () => {
      await navigateBusiness('me.html?webView=details');
      const employee = await page.$eval('.me-emp-code', node => {
        const previous = node.previousElementSibling;
        const id = node.getBoundingClientRect(); const name = previous.getBoundingClientRect();
        return { text: node.textContent.trim(), name: previous.textContent.trim(), idTop: id.top, nameBottom: name.bottom, idLeft: id.left, nameLeft: name.left, idHeight: id.height, nameHeight: name.height, fontSize: parseFloat(getComputedStyle(node).fontSize) };
      });
      assert.equal(employee.text, '#EBB01'); assert.equal(employee.name, 'Sarah Jenkins');
      assert(employee.idHeight > 0 && employee.nameHeight > 0, 'The original profile identity must remain visible');
      assert(employee.idTop >= employee.nameBottom - 2, 'Employee ID must be directly below the employee name');
      assert(Math.abs(employee.idLeft - employee.nameLeft) < 4); assert(employee.fontSize <= 13);
      return employee;
    });
    await check('Leave Apply query opens the functional source form and entitlement filtering still works', async () => {
      await navigateBusiness('leave.html?webAction=leave-apply');
      assert(await page.$eval('#viewApplyLeave', node => getComputedStyle(node).display !== 'none' && node.getBoundingClientRect().height > 0));
      assert(await page.$eval('#viewLeaveHub', node => getComputedStyle(node).display === 'none'));
      assert(await page.$('#viewApplyLeaveForm input[type="date"]'));
      assertNativeGeometry(await pageGeometry(), 'Leave Apply');
      await navigateBusiness('leave.html?view=entitlement');
      const records = await page.evaluate(() => { applyStaffEntitlementFilter('', 'Annual Leave'); return document.getElementById('seStatTotalRecords').textContent; });
      await page.click('.language-button');
      await page.waitForFunction(() => document.documentElement.lang === 'zh-CN');
      const translated = await page.evaluate(() => { applyStaffEntitlementFilter('', 'Annual Leave'); return document.getElementById('seStatTotalRecords').textContent; });
      assert.equal(records, '2'); assert.equal(translated, records);
      await page.click('.language-button');
      return { entitlementRecords: records, afterLanguageSwitch: translated };
    });
    await check('native toolbar Back respects both module navigation and the original Leave form step', async () => {
      await navigateBusiness('modules/project-task/options/work-plan.html');
      await page.click('#web-business-shell .business-title > button');
      await page.waitForFunction(() => location.pathname === '/' && location.hash.startsWith('#/module/project-task'));
      await page.waitForSelector('.module-option');
      const moduleRoute = await page.evaluate(() => location.hash);
      await navigateBusiness('leave.html?webAction=leave-apply');
      await page.click('#viewApplyLeave .leave-list-item[data-type="annual"] .btn-apply-sm');
      await page.waitForFunction(() => document.getElementById('viewApplyLeaveForm').getBoundingClientRect().height > 0);
      assert(await page.$eval('#mainFromDateInput', element => element.getBoundingClientRect().height > 0), 'The original Leave detail form must be visible');
      await page.click('#web-business-shell .business-title > button');
      await page.waitForFunction(() => document.getElementById('viewApplyLeave').getBoundingClientRect().height > 0 && getComputedStyle(document.getElementById('viewApplyLeaveForm')).display === 'none');
      assert.equal(new URL(page.url()).pathname, '/workspace/leave.html', 'Inner Leave Back must return to its original prior view in the same business document');
      assert.equal(await page.$eval('#viewLeaveHub', element => getComputedStyle(element).display), 'none');
      assert.equal(page.frames().length, 1);
      return { moduleRoute, leavePriorView: 'viewApplyLeave', innerFormClosed: true };
    });
    await check('all 118 original documents retain source fields and use a native full-width document layout', sourceDifferential);
    await check('tested native workflows introduce no JavaScript runtime errors', async () => { assert.deepEqual(errors, []); return { runtimeErrors: errors.length }; });
  }
} finally {
  await browser.close();
  const passed = checks.filter(item => item.passed).length;
  const failures = checks.filter(item => !item.passed);
  const report = '# Native web validation\n\n' + (red ? '## Red baseline\n\nThe original delivery fails the native-document requirement. This test checks iframe presence directly; it does not infer the defect from a timeout.\n\n' : '## Native regression results\n\nThe initial red test observed one iframe and an inner Work Plan viewport of 469 px with 1,274 px of content. The regression suite requires source business content to belong to the top document and grow its page.\n\n') + `URL: ${base}. Checks passed: ${passed}/${checks.length}.\n\n` + checks.map(item => `- ${item.passed ? 'PASS' : 'FAIL'} ${item.name}${item.error ? ': ' + item.error : ''}${item.evidence ? '\n\n  ```json\n  ' + JSON.stringify(item.evidence) + '\n  ```' : ''}`).join('\n\n') + '\n';
  if (sourcePage) {
    const detail = `\n\n## Focused source initialization check\n\nPage: ${sourcePage}. URL: ${base}. Checks passed: ${passed}/${checks.length}.\n\nThe original Claims pending approval page schedules queue rendering 100 ms after DOMContentLoaded. Both source and native inspection now wait for all original approval cards and checkbox controls before capturing strict field signatures.\n\n` + checks.map(item => `- ${item.passed ? 'PASS' : 'FAIL'} ${item.name}${item.error ? ': ' + item.error : ''}${item.evidence ? '\n\n  ```json\n  ' + JSON.stringify(item.evidence) + '\n  ```' : ''}`).join('\n\n') + '\n';
    await writeFile(reportPath, (previousReport.trim() || '# Native web validation') + detail);
  } else await writeFile(reportPath, report);
  if (failures.length) process.exitCode = 1;
}
