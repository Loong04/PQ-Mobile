const puppeteer = require('puppeteer');
const path = require('path');
const assert = require('node:assert/strict');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewport({ width: 450, height: 950 });

    const url = `file:///${path.resolve(__dirname, '../modules/payroll/index.html').replace(/\\/g, '/')}?scope=team`;
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#scopeTeamSection', { visible: true });
    assert.equal(await page.$('#dynamic-header .privacy-toggle-icon'), null, 'Payroll header must not show the salary eye icon');
    assert.equal(await page.$('#scopeTeamSection .team-month-nav'), null, 'Month arrows must be replaced by Filter');
    assert.ok(await page.$('#teamPayrollDashboardSearch'), 'Dashboard needs search below the selected period');
    const summaryNames = await page.$$eval('#teamPayrollSummaryItems .team-summary-item span', els => els.map(el => el.textContent.trim()));
    assert.deepEqual(summaryNames, ['Basic Pay', 'Hourly Pay', 'Employee EPF', 'Employee Tax', 'Employer EPF', 'Employer SOCSO']);
    assert.deepEqual(await page.$$eval('#teamPayrollSummaryItems .team-summary-group-title', els => els.map(el => el.textContent.trim())), ['Payments', 'Employee Deductions', 'Employer Contributions']);
    await page.screenshot({ path: path.resolve(__dirname, 'payroll_team_dashboard_dark.png') });
    await page.type('#teamPayrollDashboardSearch', 'no such component');
    assert.match(await page.$eval('#teamPayrollSummaryItems', el => el.textContent), /No payroll components found/);
    await page.$eval('#teamPayrollDashboardSearch', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.type('#teamPayrollDashboardSearch', 'employee');
    assert.deepEqual(await page.$$eval('#teamPayrollSummaryItems .team-summary-item span', els => els.map(el => el.textContent.trim())), ['Employee EPF', 'Employee Tax']);
    await page.$eval('#teamPayrollDashboardSearch', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('#teamPayrollDashboardFilter');
    await page.waitForSelector('#teamPayrollFilterSheet.active');
    await page.screenshot({ path: path.resolve(__dirname, 'payroll_team_filter_dark.png') });
    await page.$eval('#teamPayrollFilterApply', el => el.focus());
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'teamPayrollFilterReset');
    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'teamPayrollFilterApply');
    await page.select('#teamPayrollFilterMonth', '07');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'teamPayrollDashboardFilter');
    assert.match(await page.$eval('#scopeTeamSection .team-payroll-month-label', el => el.textContent), /September 2026/);
    await page.click('#teamPayrollDashboardFilter');
    assert.equal(await page.$eval('#teamPayrollFilterMonth', el => el.value), '09', 'Cancelled changes are discarded');
    await page.select('#teamPayrollFilterMonth', '08');
    await page.click('#teamPayrollFilterApply');
    assert.match(await page.$eval('#scopeTeamSection .team-payroll-month-label', el => el.textContent), /August 2026/);
    assert.match(await page.$eval('#teamPayrollSummaryItems', el => el.textContent), /No payroll data/);
    await page.click('#teamPayrollDashboardFilter');
    await page.click('#teamPayrollFilterReset');
    await page.click('#teamPayrollFilterApply');

    const dashboard = await page.evaluate(() => ({
      title: document.getElementById('globalTopTitle')?.textContent.trim(),
      subtitle: document.getElementById('headerSubtitleText')?.textContent.trim(),
      actionTitle: document.querySelector('#teamPendingApprovalCard .team-row-title')?.textContent.trim(),
      actionCount: document.getElementById('teamPendingApprovalCount')?.textContent.trim(),
      quickAction: document.querySelector('#teamTaxReliefQuickAction .team-row-title')?.textContent.trim(),
      quickActionIcon: document.querySelector('#teamTaxReliefQuickAction .team-row-icon i')?.className,
      summaryGroups: [...document.querySelectorAll('#teamPayrollSummaryCard .team-summary-group-title')].map(el => el.textContent.trim()),
      hasOldInlineQueue: Boolean(document.querySelector('#scopeTeamSection #teamTaxReliefQueue')),
      headerIsCentered: (() => {
        const title = document.getElementById('globalTopTitle').getBoundingClientRect();
        const phone = document.querySelector('.phone-container').getBoundingClientRect();
        return Math.abs(title.left + title.width / 2 - (phone.left + phone.width / 2)) < 2;
      })()
    }));

    await page.click('#teamViewFullBreakdown');
    await page.waitForSelector('#teamPayrollBreakdownSection.active');
    await page.waitForFunction(() => document.activeElement?.id === 'teamPayrollBreakdownClose');
    await page.evaluate(() => Promise.all(document.getElementById('teamPayrollBreakdownSection').getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))));

    const payments = await page.evaluate(() => ({
      title: document.getElementById('globalTopTitle')?.textContent.trim(),
      subtitle: document.getElementById('headerSubtitleText')?.textContent.trim(),
      scopeSwitcherDisplay: getComputedStyle(document.getElementById('mainScopeSwitcher')).display,
      sheetOpen: document.getElementById('teamPayrollBreakdownSection').getAttribute('aria-hidden') === 'false',
      teamDashboardVisible: getComputedStyle(document.getElementById('scopeTeamSection')).display !== 'none',
      dialogTitle: document.getElementById('teamPayrollBreakdownTitle')?.textContent.trim(),
      panelAnchoredToPhoneBottom: Math.abs(document.querySelector('.team-payroll-breakdown-panel').getBoundingClientRect().bottom - document.querySelector('.phone-container').getBoundingClientRect().bottom) < 2,
      tabs: [...document.querySelectorAll('.team-breakdown-tab')].map(el => el.textContent.trim()),
      rows: [...document.querySelectorAll('#teamBreakdownRows .team-breakdown-row')].map(row => ({
        name: row.querySelector('.team-breakdown-name')?.textContent.trim(),
        amount: row.querySelector('.team-breakdown-amount')?.textContent.trim()
      }))
    }));

    await page.click('[data-team-payroll-tab="deductions"]');
    const deductionNames = await page.$$eval('#teamBreakdownRows .team-breakdown-name', els => els.map(el => el.textContent.trim()));

    await page.click('[data-team-payroll-tab="payments"]');
    await page.type('#teamPayrollSearch', 'car');
    const filteredNames = await page.$$eval('#teamBreakdownRows .team-breakdown-name', els => els.map(el => el.textContent.trim()));

    await page.$eval('#teamPayrollSearch', input => {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.click('#teamShowZeroAmounts');
    const namesWithZeroAmounts = await page.$$eval('#teamBreakdownRows .team-breakdown-name', els => els.map(el => el.textContent.trim()));

    await page.click('#teamPayrollBreakdownClose');
    await page.waitForFunction(() => !document.getElementById('teamPayrollBreakdownSection').classList.contains('active'));
    const returned = await page.evaluate(() => ({
      title: document.getElementById('globalTopTitle')?.textContent.trim(),
      subtitle: document.getElementById('headerSubtitleText')?.textContent.trim(),
      switcherVisible: getComputedStyle(document.getElementById('mainScopeSwitcher')).display !== 'none',
      focusReturned: document.activeElement?.id === 'teamViewFullBreakdown'
    }));
    await page.click('#teamViewFullBreakdown');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#teamPayrollBreakdownSection', el => el.classList.contains('active')), false, 'Escape closes the breakdown sheet');

    await page.setViewport({ width: 360, height: 800 });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    assert.ok(await page.$eval('#scopeTeamSection', el => el.scrollWidth <= el.clientWidth), 'Dashboard must fit a small screen');
    const searchBelowMonth = await page.evaluate(() => {
      const period = document.querySelector('#scopeTeamSection .team-period-card').getBoundingClientRect();
      const search = document.getElementById('teamPayrollDashboardSearch').getBoundingClientRect();
      return search.top >= period.bottom;
    });
    assert.ok(searchBelowMonth, 'Search must sit below the month');
    await page.screenshot({ path: path.resolve(__dirname, 'payroll_team_dashboard_light_mobile.png') });
    await page.click('#teamPayrollDashboardFilter');
    assert.ok(await page.$eval('.claim-filter-panel', el => el.scrollWidth <= el.clientWidth), 'Filter must fit a small screen');
    await page.screenshot({ path: path.resolve(__dirname, 'payroll_team_filter_light_mobile.png') });
    await page.click('#teamPayrollFilterClose');

    const dashboardPassed = dashboard.title === 'Payroll'
      && dashboard.subtitle === 'Team'
      && dashboard.actionTitle === 'Pending Approval'
      && dashboard.actionCount === '6'
      && dashboard.quickAction === 'Tax Relief'
      && dashboard.quickActionIcon.includes('fa-file-invoice-dollar')
      && JSON.stringify(dashboard.summaryGroups) === JSON.stringify(['Payments', 'Employee Deductions', 'Employer Contributions'])
      && dashboard.hasOldInlineQueue === false
      && dashboard.headerIsCentered;

    const breakdownPassed = payments.title === 'Payroll'
      && payments.subtitle === 'Team'
      && payments.scopeSwitcherDisplay !== 'none'
      && payments.sheetOpen
      && payments.teamDashboardVisible
      && payments.dialogTitle === 'Payroll Breakdown'
      && payments.panelAnchoredToPhoneBottom
      && JSON.stringify(payments.tabs) === JSON.stringify(['Payments', 'Deductions', 'Employer'])
      && payments.rows.length === 10
      && payments.rows[0].name === 'Basic Pay'
      && payments.rows[0].amount === 'RM 392,136.02'
      && deductionNames.includes('Employee EPF')
      && JSON.stringify(filteredNames) === JSON.stringify(['Car Petrol Allowance'])
      && namesWithZeroAmounts.includes('Overtime Payment');

    const returnPassed = returned.title === 'Payroll'
      && returned.subtitle === 'Team'
      && returned.switcherVisible
      && returned.focusReturned;

    const passed = dashboardPassed && breakdownPassed && returnPassed && pageErrors.length === 0;
    console.log(JSON.stringify({ dashboard, payments, deductionNames, filteredNames, namesWithZeroAmounts, returned, pageErrors, dashboardPassed, breakdownPassed, returnPassed, passed }, null, 2));
    if (!passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
