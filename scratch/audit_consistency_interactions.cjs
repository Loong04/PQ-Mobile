const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const url = (file, query = '') => pathToFileURL(path.join(root, file)).href + query;
async function stable(page) {
  await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(animation => animation.constructor.name === 'CSSTransition').map(animation => animation.finished.catch(() => {}))); });
}
async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const results = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950 });
    let errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss());
    for (const file of ['modules/attendance/options/daily-manpower.html', 'modules/attendance/options/hours-costing.html']) {
      errors = [];
      await page.goto(url(file), { waitUntil: 'domcontentloaded' });
      const before = await page.$eval('.phone-container', node => node.textContent);
      await page.click('.view-chart-btn');
      await stable(page);
      results.push({ case: 'View Chart', file, chartFunction: await page.evaluate(() => typeof openChartModal), changed: before !== await page.$eval('.phone-container', node => node.textContent), errors: [...errors] });
    }
    errors = [];
    await page.goto(url('leave.html', '?view=approvals&mode=team&tab=offtime'), { waitUntil: 'domcontentloaded' });
    for (const action of ['backup', 'resubmit']) {
      errors = [];
      await page.click('#approvalCardOfftime3 .action-btn-' + action);
      results.push({ case: 'Leave Off Time ' + action, file: 'leave.html', errors: [...errors] });
    }
    errors = [];
    await page.goto(url('modules/attendance/options/team.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => triggerAttendanceViewWorkflow());
    await page.waitForFunction(() => getComputedStyle(document.getElementById('attendanceWorkflowModalOverlay')).opacity === '1');
    await page.click('#attendanceWorkflowModalOverlay button[onclick*="openSelectBackupApproverModal"]');
    results.push({ case: 'Attendance Workflow Assign Backup Approver', file: 'modules/attendance/options/team.html', errors: [...errors] });
    for (const [file, trigger, panel] of [
      ['modules/project-task/options/timesheet-highlight.html', '#timesheetFilterTrigger', '#timesheetFilterForm'],
      ['modules/payroll/options/pending-approval.html', '#payrollPendingFilterTrigger', '#payrollPendingFilter form'],
      ['modules/claims/options/pending-approval.html', '[onclick*="openPendingApprovalFilter"]', '#claimPendingFilter form'],
      ['leave.html', '[onclick="openTeamApprovalsFilterModal()"]', '#teamApprovalsFilterModalOverlay .standard-filter-panel']
    ]) {
      errors = [];
      await page.goto(url(file, '?theme=dark' + (file === 'leave.html' ? '&view=approvals&mode=team' : '')), { waitUntil: 'domcontentloaded' });
      await page.click(trigger);
      await stable(page);
      const controls = await page.$eval(panel, form => {
        const input = form.querySelector('input');
        const reset = [...form.querySelectorAll('button')].find(node => /reset/i.test(node.textContent));
        return { title: form.querySelector('h2,h3')?.textContent.trim(), resetIcon: Boolean(reset?.querySelector('i')), inputHeight: input.getBoundingClientRect().height, inputRadius: getComputedStyle(input).borderRadius,
          labels: [...form.querySelectorAll('label')].filter(node => node.getClientRects().length).map(node => node.textContent.trim()) };
      });
      results.push({ case: 'Filter style', file, controls, errors: [...errors] });
      await page.screenshot({ path: path.join(__dirname, 'audit_filter_' + (file.includes('project-task') ? 'timesheet' : file.includes('payroll') ? 'payroll' : file.includes('claims') ? 'claims' : 'leave') + '.png') });
    }
    for (const file of ['me.html', 'calendar.html']) {
      await page.goto(url(file, '?theme=dark'), { waitUntil: 'domcontentloaded' });
      await page.click('[data-set-theme="light"]');
      const afterSwitch = await page.$eval('html', node => node.dataset.theme);
      await page.reload({ waitUntil: 'domcontentloaded' });
      results.push({ case: 'Theme persistence', file, afterSwitch, afterReload: await page.$eval('html', node => node.dataset.theme), currentUrl: page.url() });
    }
    await page.goto(url('homedark.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => openApprovalDetailModal('notif_1'));
    await stable(page);
    results.push({ case: 'Notification approval button colors', file: 'js/components.js', buttons: await page.$$eval('#approvalActionBar button', nodes => nodes.map(node => ({ text: node.textContent.trim(), background: getComputedStyle(node).background, color: getComputedStyle(node).color }))) });
    await page.screenshot({ path: path.join(__dirname, 'audit_notification_approval.png') });
    await page.goto(url('modules/project-task/options/timesheet-highlight.html'), { waitUntil: 'domcontentloaded' });
    await page.click('#timesheetViewChart');
    results.push({ case: 'Timesheet highlight downstream flow', file: 'modules/project-task/options/timesheet-highlight.html', views: await page.$$eval('[data-timesheet-view]', nodes => nodes.map(node => node.dataset.timesheetView)), viewTrendPresent: Boolean(await page.$('#timesheetViewTrend')), employeeDetailsPresent: Boolean(await page.$('#timesheetEmployeeDetails')) });
    await page.goto(url('modules/attendance/options/shift-summary.html'), { waitUntil: 'domcontentloaded' });
    errors = [];
    await page.evaluate(() => document.querySelector('[onclick="resetShiftTypeFilter()"]').click());
    results.push({ case: 'Shift Summary clear shift-type filter', file: 'modules/attendance/options/shift-summary.html', errors: [...errors] });
    await page.goto(url('modules/project-task/options/history.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.setItem('pq_project_work_plans', JSON.stringify([
      { id: 'WP-AUDIT-OLDER', title: 'Audit older submitted plan', status: 'submitted', scheduleFrom: '2026-09-01', scheduleTo: '2026-09-02' },
      { id: 'WP-AUDIT-NEWER', title: 'Audit newer submitted plan', status: 'submitted', scheduleFrom: '2026-10-01', scheduleTo: '2026-10-02' }
    ])));
    await page.reload({ waitUntil: 'domcontentloaded' });
    results.push({ case: 'Project History same-status records', file: 'js/project-task/project-task-history.js', storedCount: 2,
      visibleTitles: await page.$$eval('#workPlanHistoryPanel .project-history-card h3', nodes => nodes.map(node => node.textContent)),
      olderPresent: await page.$eval('#workPlanHistoryPanel', node => node.textContent.includes('Audit older submitted plan')) });
    await page.goto(url('modules/project-task/options/pending-approval.html'), { waitUntil: 'domcontentloaded' });
    const beforeQueue = await page.$eval('.main-content', node => node.textContent);
    for (const action of ['approve', 'resubmit', 'reject']) await page.click(`[data-project-approval-action="${action}"]`);
    results.push({ case: 'Project pending approval actions', file: 'modules/project-task/options/pending-approval.html', changed: beforeQueue !== await page.$eval('.main-content', node => node.textContent) });
    await page.goto(url('modules/payroll/options/ea-form.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { window.auditPrintCalled = false; window.auditOpenCalled = false; window.print = () => { window.auditPrintCalled = true; }; window.open = () => { window.auditOpenCalled = true; }; });
    await page.click('[onclick="openAndPrintEA()"]');
    results.push({ case: 'EA Form Open and Print', file: 'modules/payroll/options/ea-form.html', printCalled: await page.evaluate(() => window.auditPrintCalled), openCalled: await page.evaluate(() => window.auditOpenCalled), toast: await page.$eval('#appToast', node => node.textContent) });
  } finally { await browser.close(); }
  await fs.writeFile(path.join(__dirname, 'app-consistency-interactions.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
