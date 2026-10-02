const assert = require('node:assert/strict');
const path = require('node:path');
const puppeteer = require('puppeteer');

async function openPage(page, file) {
  await page.goto(`file:///${path.resolve(file).replace(/\\/g, '/')}`, { waitUntil: 'domcontentloaded' });
}

async function setShared(page, id, changes) {
  await page.evaluate(({ id, changes }) => {
    const form = document.querySelector(`#${id} form`);
    const defaults = { keyword: '', startDate: '', endDate: '', days: 'all', minDays: '', maxDays: '' };
    for (const [key, value] of Object.entries({ ...defaults, ...changes })) form.elements[key].value = value;
    form.elements.days.dispatchEvent(new Event('change'));
    form.requestSubmit();
  }, { id, changes });
}

async function countCards(page, selector) {
  return page.$$eval(selector, nodes => nodes.filter(node => getComputedStyle(node).display !== 'none').length);
}

async function checkSharedPanel(page, id, open) {
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => document.documentElement.setAttribute('data-theme', theme), theme);
    await open();
    const labels = await page.$$eval(`#${id} label`, nodes => nodes.filter(node => node.getClientRects().length).map(node => node.textContent.trim()));
    assert.deepEqual(labels, ['Search Keyword', 'Start Date', 'End Date', 'Outstanding Days']);
    const overflow = await page.$eval(`#${id} form`, node => node.scrollWidth > node.clientWidth + 1);
    assert.equal(overflow, false);
    await page.screenshot({ path: `scratch/${id}_${theme}.png` });
    await page.click(`#${id} [data-action="close"]`);
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 920 });
    const faults = [];
    page.on('pageerror', error => faults.push(error.message));
    await page.evaluateOnNewDocument(() => {
      const RealDate = Date;
      window.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : [2026, 9, 2, 12])); }
        static now() { return new RealDate(2026, 9, 2, 12).getTime(); }
      };
    });

    await openPage(page, 'modules/claims/options/pending-approval.html');
    await page.waitForSelector('pending-approval-card');
    const claimCards = '#teamApprovalsQueue pending-approval-card';
    assert.equal(await countCards(page, claimCards), 12);
    await page.click('[aria-label="Open pending approval filter"]');
    assert.equal(await page.$eval('#claimPendingFilter', node => node.hidden), false);
    await setShared(page, 'claimPendingFilter', { keyword: 'Sarah' });
    assert.equal(await countCards(page, claimCards), 1);
    assert.equal(await page.$eval('#teamPendingCountBadge', node => node.textContent), '1');
    await page.evaluate(() => window.ClaimsEngine.openPendingApprovalFilter());
    assert.equal(await page.$eval('#claimPendingFilter-keyword', node => node.value), 'Sarah');
    await setShared(page, 'claimPendingFilter', { startDate: '2016-03-09', endDate: '2016-03-09' });
    assert.equal(await countCards(page, claimCards), 1);
    await page.evaluate(() => window.ClaimsEngine.switchPendingTab('Benefit Claim'));
    assert.equal(await countCards(page, claimCards), 0);
    await page.evaluate(() => window.ClaimsEngine.switchPendingTab('all'));
    await page.evaluate(() => window.ClaimsEngine.openPendingApprovalFilter());
    await page.click('#claimPendingFilter [data-action="reset"]');
    assert.equal(await countCards(page, claimCards), 12);
    await setShared(page, 'claimPendingFilter', { days: 'custom', minDays: '6', maxDays: '6' });
    assert.equal(await countCards(page, claimCards), 1);
    await page.evaluate(() => window.ClaimsEngine.openPendingApprovalFilter());
    await setShared(page, 'claimPendingFilter', { startDate: '2026-10-02', endDate: '2026-09-01' });
    assert.equal(await page.$eval('#claimPendingFilter [role="alert"]', node => node.hidden), false);
    assert.equal(await countCards(page, claimCards), 1);
    await page.click('#claimPendingFilter [data-action="reset"]');
    await page.click('#claimPendingFilter [data-action="close"]');
    await checkSharedPanel(page, 'claimPendingFilter', () => page.evaluate(() => window.ClaimsEngine.openPendingApprovalFilter()));
    console.log('Claim: trigger, four fields, keyword, day-first dates, custom days, reset, validation and category persistence passed.');

    await openPage(page, 'modules/attendance/options/team.html');
    await page.evaluate(() => showPendingApprovalPage('ot_plan'));
    const attendanceCards = '#pendingApprovalListContent .approval-request-card';
    assert.equal(await countCards(page, attendanceCards), 4);
    await page.click('#viewPendingApprovalSection .staff-filter-summary-bar button');
    await setShared(page, 'attendancePendingFilter', { keyword: 'Michelle' });
    assert.equal(await countCards(page, attendanceCards), 1);
    await page.evaluate(() => getAttendancePendingFilter().open());
    await setShared(page, 'attendancePendingFilter', { startDate: '2026-02-27', endDate: '2026-02-27' });
    assert.equal(await countCards(page, attendanceCards), 1);
    await page.evaluate(() => switchStaffApprovalTab('feedback'));
    assert.equal(await countCards(page, attendanceCards), 0);
    await page.evaluate(() => getAttendancePendingFilter().reset());
    assert.equal(await countCards(page, attendanceCards), 4);
    for (const tab of ['final_ot', 'ot_plan', 'feedback']) {
      await page.evaluate(tab => switchStaffApprovalTab(tab), tab);
      await page.evaluate(() => getAttendancePendingFilter().open());
      await setShared(page, 'attendancePendingFilter', { days: '1' });
      assert.equal(await countCards(page, attendanceCards), 0);
      await page.evaluate(() => getAttendancePendingFilter().reset());
    }
    await checkSharedPanel(page, 'attendancePendingFilter', () => page.evaluate(() => getAttendancePendingFilter().open()));
    console.log('Attendance: all three approval categories, working keyword/date/day filters, reset and four fields passed.');

    await openPage(page, 'leave.html');
    await page.evaluate(() => { document.getElementById('teamApprovalsListContainer').parentElement.style.display = 'block'; switchApprovalCategory('leave'); });
    const leaveCards = '#teamApprovalsListContainer .approval-request-card';
    const setLeave = async (changes = {}) => page.evaluate(changes => {
      const controls = { taFilterKeyword: '', taFilterStartDate: '', taFilterEndDate: '', taFilterOutstandingDaysPreset: 'all', taFilterDaysMin: '', taFilterDaysMax: '', ...changes };
      Object.entries(controls).forEach(([id, value]) => { document.getElementById(id).value = value; });
      submitTeamApprovalsFilterModal(false);
    }, changes);
    assert.equal(await countCards(page, leaveCards), 4);
    await setLeave({ taFilterKeyword: 'Hailizam' });
    assert.equal(await countCards(page, leaveCards), 1);
    await setLeave({ taFilterStartDate: '2026-02-25', taFilterEndDate: '2026-02-25' });
    assert.equal(await countCards(page, leaveCards), 1);
    await setLeave({ taFilterOutstandingDaysPreset: '2-3' });
    assert.equal(await countCards(page, leaveCards), 1);
    assert.equal(await page.$eval('#approvalCard4', node => node.style.display), 'block');
    await page.evaluate(() => switchApprovalCategory('offtime'));
    assert.equal(await countCards(page, leaveCards), 0);
    await setLeave({ taFilterOutstandingDaysPreset: 'gt5' });
    assert.equal(await countCards(page, leaveCards), 3);
    for (const category of ['leave', 'credit', 'offtime']) {
      await page.evaluate(category => { switchApprovalCategory(category); openTeamApprovalsFilterModal(); }, category);
      assert.equal(await page.$eval('#taOutstandingDaysSection', node => node.style.display), 'block');
      const labels = await page.$$eval('#teamApprovalsFilterModalOverlay label', nodes => nodes.map(node => node.textContent.trim()));
      assert.deepEqual(labels, ['Search Keyword', 'Start Date', 'End Date', 'Outstanding Days']);
    }
    await page.evaluate(() => resetTeamApprovalsFilterModal());
    assert.equal(await countCards(page, leaveCards), 3);
    console.log('Leave: all three categories have four fields; keyword, inclusive dates, pending age, category persistence and reset passed.');

    await openPage(page, 'modules/payroll/options/tax-relief.html');
    await page.waitForSelector('.team-relief-card');
    await page.evaluate(() => switchStatusTab('pending'));
    const payrollCards = '#fullTaxReliefList .team-relief-card';
    assert.equal(await countCards(page, payrollCards), 4);
    await page.click('[aria-label="Open pending approval filter"]');
    await setShared(page, 'taxReliefPendingFilter', { keyword: '#0000101' });
    assert.equal(await countCards(page, payrollCards), 1);
    assert.equal(await page.$eval('#countTabPending', node => node.textContent), '(1)');
    await page.evaluate(() => getTaxReliefApprovalFilter().open());
    await setShared(page, 'taxReliefPendingFilter', { startDate: '2026-09-18', endDate: '2026-09-18' });
    assert.equal(await countCards(page, payrollCards), 1);
    await page.evaluate(() => getTaxReliefApprovalFilter().open());
    await setShared(page, 'taxReliefPendingFilter', { days: 'custom', minDays: '13', maxDays: '13' });
    assert.equal(await countCards(page, payrollCards), 1);
    await page.evaluate(() => getTaxReliefApprovalFilter().reset());
    assert.equal(await countCards(page, payrollCards), 4);
    await checkSharedPanel(page, 'taxReliefPendingFilter', () => page.evaluate(() => getTaxReliefApprovalFilter().open()));
    console.log('Payroll: four fields, employee-ID search, dates, custom days, accurate counts and reset passed.');
    assert.deepEqual(faults, []);
    console.log('No browser script errors. Mobile panels fit in dark and light themes.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
