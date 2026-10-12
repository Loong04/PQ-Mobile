const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/manpower-stats.html')).href;

// Catch mismatched chart totals, ignored organization filters, and date boundary errors.
const fixture = [
  { company: 'Alpha', branch: 'HQ', department: 'Finance', jobType: 'ACCOUNT EXECUTIVE', headcount: 4, effectiveFrom: '2026-10-01' },
  { company: 'Alpha', branch: 'North', department: 'Finance', jobType: 'ACCOUNT EXECUTIVE', headcount: 2, effectiveFrom: '2026-10-05' },
  { company: 'Beta', branch: 'HQ', department: 'Administration', jobType: 'ADMIN MANAGER', headcount: 3, effectiveFrom: '2026-09-01', effectiveTo: '2026-10-04' },
  { company: 'Beta', branch: 'South', department: 'Operations', jobType: 'TECHNICIAN', headcount: 7, effectiveFrom: '2026-10-05' }
];
const statisticsLabels = [
  'Description', 'Headcount', 'Average Age', 'Average Service Years',
  'Average Competency Points', 'Average Competency Match %', 'Average Basic Pay',
  'Median Basic Pay', 'Minimum Basic Pay', 'Maximum Basic Pay',
  'Average Increment %', 'Average Bonus Factor', 'Attendance %',
  'Average Monthly OT Hours', 'Average Training Cost',
  'Average Performance Score', 'Annual Attrition %'
];
const employeeDetailLabels = [
  'Employee #', 'Name', 'Position', 'Superior', 'Job', 'Company', 'Branch',
  'Base', 'Division', 'Department', 'Section', 'Cost Center', 'Line', 'Service Years'
];
const controlledAggregate = [
  { company: 'Alpha', branch: 'HQ', department: 'Finance', jobType: 'ACCOUNT EXECUTIVE', headcount: 2, effectiveFrom: '2026-01-01' }
];
const controlledStaff = [
  {
    empNo: '000001', name: 'Aina', position: 'ACCOUNT EXECUTIVE', superior: 'FINANCE MANAGER',
    job: 'ACCOUNT EXECUTIVE', jobType: 'ACCOUNT EXECUTIVE', company: 'Alpha', branch: 'HQ',
    base: 'KUALA LUMPUR', division: 'CORPORATE SERVICES', department: 'Finance', section: 'ACCOUNTS',
    costCenter: 'FINANCE', line: 'GENERAL', hireDate: '2016-10-05', birthDate: '1996-10-05',
    competencyPoints: 6, competencyMatchPercent: 80, basicPay: 2000, incrementPercent: 2,
    bonusFactor: 1, attendancePercent: 90, monthlyOtHours: 2, trainingCost: 200,
    performanceScore: 80, annualAttritionPercent: 1, effectiveFrom: '2026-01-01'
  },
  {
    empNo: '000002', name: 'Ben', position: 'ACCOUNT EXECUTIVE', superior: 'FINANCE MANAGER',
    job: 'ACCOUNT EXECUTIVE', jobType: 'ACCOUNT EXECUTIVE', company: 'Alpha', branch: 'HQ',
    base: 'KUALA LUMPUR', division: 'CORPORATE SERVICES', department: 'Finance', section: 'ACCOUNTS',
    costCenter: 'FINANCE', line: 'GENERAL', hireDate: '2021-10-05', birthDate: '1986-10-05',
    competencyPoints: 8, competencyMatchPercent: 90, basicPay: 4000, incrementPercent: 4,
    bonusFactor: 2, attendancePercent: 100, monthlyOtHours: 4, trainingCost: 400,
    performanceScore: 90, annualAttritionPercent: 3, effectiveFrom: '2026-01-01'
  }
];
const missingValueAggregate = [
  { company: 'Alpha', branch: 'HQ', department: 'Finance', jobType: 'ACCOUNT EXECUTIVE', headcount: 1, effectiveFrom: '2026-01-01' }
];
const missingValueStaff = [{
  ...controlledStaff[0],
  base: '',
  line: null,
  photo: ''
}];

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const table = () => page.$$eval('#manpowerTable tbody tr', rows => rows.map(row => [...row.cells].map(cell => cell.textContent)));
    const apply = async values => {
      await page.click('#manpowerFilterTrigger');
      for (const [id, value] of Object.entries(values)) {
        await page.$eval('#' + id, (element, next) => { element.value = next; element.dispatchEvent(new Event('change', { bubbles: true })); }, value);
      }
      await page.click('#manpowerApplyFilter');
    };
    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url + '?theme=' + theme, { waitUntil: 'load' });
      assert.equal(await page.$eval('#manpowerTotalRecords', n => n.textContent), '34');
      assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '282');
      assert.equal(await page.$('#manpowerDateSummary'), null, 'Effective Date is not repeated in the summary card');
      assert.equal(await page.$eval('.staff-list-action-summary', n => n.textContent.includes('Effective Date')), false);
      assert.deepEqual((await table()).slice(0, 6), [
        ['ACCOUNT EXECUTIVE', '48'], ['ACCOUNT MANAGER', '12'], ['ADMIN EXECUTIVE', '17'],
        ['ADMIN MANAGER', '10'], ['BANK TELLER OFFICER', '10'], ['BARISTA', '12']
      ]);
      assert.equal(await page.$$eval('#manpowerTable tbody td:first-child button', buttons => buttons.length), 34);
      assert.equal(await page.$eval('#manpowerTable tbody td:first-child button', button => button.getAttribute('aria-label')), 'View statistics for ACCOUNT EXECUTIVE');
      await page.click('#manpowerTable tbody td:first-child button');
      assert.ok(await page.$eval('#manpowerStatisticsOverlay', overlay => !overlay.hidden));
      assert.equal(await page.$eval('#manpowerStatisticsDialogTitle', title => title.textContent), 'Manpower Statistics');
      assert.deepEqual(await page.$$eval('#manpowerStatisticsDetails th', cells => cells.map(cell => cell.textContent)), statisticsLabels);
      await page.click('#manpowerStatisticsClose');
      assert.equal(await page.$$eval('#manpowerTable tbody td:last-child button', buttons => buttons.length), 34);
      assert.equal(await page.$eval('#manpowerTable tbody td:last-child button', button => button.getAttribute('aria-label')), 'View 48 staff records for ACCOUNT EXECUTIVE');
      const tableScroll = await page.$eval('main', main => {
        main.scrollTop = 240;
        return main.scrollTop;
      });
      await page.click('#manpowerTable tbody td:last-child button');
      assert.ok(await page.$eval('#manpowerStaffView', section => !section.hidden));
      assert.ok(await page.$eval('#manpowerTableView', section => section.hidden));
      assert.ok(await page.$eval('#manpowerChartView', section => section.hidden));
      assert.equal(await page.$eval('#manpowerTitle', title => title.textContent), 'ACCOUNT EXECUTIVE Staff Records');
      assert.equal(await page.$eval('#manpowerStaffTotalRecords', value => value.textContent), '48');
      assert.equal(await page.$$eval('#manpowerStaffList .manpower-employee-card', cards => cards.length), 48);
      assert.ok(await page.$$eval('#manpowerStaffList .manpower-employee-card', cards => cards.every(card => {
        const name = card.querySelector('.employee-name');
        const id = card.querySelector('.employee-id');
        return name && name.nextElementSibling === id && /^#\S+/.test(id.textContent)
          && card.textContent.includes('Position') && card.textContent.includes('Department')
          && !card.querySelector('.fa-chevron-right');
      })));
      const employeeCardVisuals = await page.$eval('#manpowerStaffList .manpower-employee-card', card => {
        const cardStyle = getComputedStyle(card);
        const detailsStyle = getComputedStyle(card.querySelector('.manpower-employee-card-details'));
        return {
          borderLeft: cardStyle.borderLeft,
          borderRadius: cardStyle.borderRadius,
          padding: cardStyle.padding,
          hasPurpleTint: cardStyle.backgroundImage.includes('rgba(124, 58, 237, 0.06)'),
          detailsBorder: detailsStyle.border,
          detailsRadius: detailsStyle.borderRadius,
          detailsPadding: detailsStyle.padding,
          detailsHasPurpleTint: detailsStyle.backgroundColor === 'rgba(124, 58, 237, 0.05)'
        };
      });
      assert.deepEqual(employeeCardVisuals, {
        borderLeft: '5px solid rgb(124, 58, 237)',
        borderRadius: '20px',
        padding: '16px 18px',
        hasPurpleTint: true,
        detailsBorder: '1px solid rgba(124, 58, 237, 0.18)',
        detailsRadius: '14px',
        detailsPadding: '12px',
        detailsHasPurpleTint: true
      }, 'Staff records reuse the Leave History card surface and inner details treatment');
      await page.click('#manpowerStaffList .manpower-employee-card[data-emp-no="000031"]');
      assert.ok(await page.$eval('#manpowerEmployeeOverlay', overlay => !overlay.hidden));
      assert.deepEqual(await page.$$eval('#manpowerEmployeeDetails th', cells => cells.map(cell => cell.textContent)), employeeDetailLabels);
      const employeeDetails = await page.$$eval('#manpowerEmployeeDetails tr', rows => Object.fromEntries(rows.map(row => [
        row.querySelector('th').textContent,
        row.querySelector('td').textContent
      ])));
      assert.equal(employeeDetails['Employee #'], '#000031');
      assert.equal(employeeDetails.Name, 'Navin');
      assert.equal(employeeDetails.Position, 'ACCOUNT EXECUTIVE');
      assert.equal(employeeDetails.Job, 'ACCOUNT EXECUTIVE');
      assert.match(employeeDetails['Service Years'], /^\d+\.\d{2}$/);
      assert.equal(await page.$eval('#manpowerEmployeeAvatar', avatar => avatar.textContent), 'N');
      assert.equal(await page.$('#manpowerEmployeeOverlay img'), null);
      await page.keyboard.press('Escape');
      assert.ok(await page.$eval('#manpowerEmployeeOverlay', overlay => overlay.hidden));
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.empNo), '000031');
      await page.click('#manpowerBack');
      assert.ok(await page.$eval('#manpowerTableView', section => !section.hidden));
      assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'View 48 staff records for ACCOUNT EXECUTIVE');
      assert.equal(await page.$eval('main', main => main.scrollTop), tableScroll);
      await page.screenshot({ path: path.join(__dirname, 'employee_career_manpower_statistics_' + theme + '.png') });
      await page.click('#manpowerViewChart');
      assert.equal(await page.$eval('#manpowerChartTotal', n => n.textContent), '282');
      assert.equal(await page.$$eval('#manpowerChartLegend [data-count]', nodes => nodes.reduce((total, n) => total + Number(n.dataset.count), 0)), 282);
      assert.equal(await page.$$eval('#manpowerChartLegend .staff-list-legend-row', nodes => nodes.length), 6);
      await page.screenshot({ path: path.join(__dirname, 'employee_career_manpower_statistics_chart_' + theme + '.png') });
      await page.click('#manpowerChartViewAll');
      assert.equal(await page.$$eval('#manpowerChartLegend .staff-list-legend-row', nodes => nodes.length), 34);
      assert.equal(await page.$$eval('#manpowerChartLegend [data-count]', nodes => nodes.reduce((total, n) => total + Number(n.dataset.count), 0)), 282);
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1));
      }
      await page.click('#manpowerBack');
      assert.ok(await page.$eval('#manpowerTableView', n => !n.hidden));
      assert.ok(!(await page.$eval('main', n => n.textContent)).includes('View Trend'));
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 950 });
        assert.ok(await page.$eval('main', n => n.scrollWidth <= n.clientWidth + 1));
        assert.ok(await page.$eval('#manpowerTable th:last-child', n => n.scrollWidth <= n.clientWidth + 1), 'Headcount heading fits');
      }
      await page.setViewport({ width: 390, height: 950 });
      await page.click('#manpowerFilterTrigger');
      assert.equal(await page.$$eval('#manpowerFilterForm label', nodes => nodes.length), 6);
      assert.equal(await page.$eval('#manpowerEffectiveDate', n => n.value), '2026-10-05', 'Effective Date remains available as a filter');
      await page.screenshot({ path: path.join(__dirname, 'employee_career_manpower_statistics_filter_' + theme + '.png') });
      await page.$eval('#manpowerApplyFilter', n => n.focus());
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'manpowerResetFilter');
      await page.$eval('#manpowerEffectiveDate', n => { n.value = ''; });
      await page.click('#manpowerApplyFilter');
      assert.ok(await page.$eval('#manpowerFilterOverlay', n => !n.hidden));
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('main', n => n.inert), false);
    }
    await page.evaluateOnNewDocument(records => { window.MANPOWER_STATISTICS_DATA = records; }, fixture);
    await page.goto(url, { waitUntil: 'load' });
    assert.deepEqual(await table(), [['ACCOUNT EXECUTIVE', '6'], ['TECHNICIAN', '7']]);
    assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '13');
    await page.click('button[aria-label="View 6 staff records for ACCOUNT EXECUTIVE"]');
    assert.equal(await page.$eval('#manpowerStaffTotalRecords', node => node.textContent), '6');
    assert.equal(await page.$$eval('#manpowerStaffList .manpower-employee-card', nodes => nodes.length), 6);
    await page.click('#manpowerBack');
    await page.click('#manpowerViewChart');
    await page.select('#manpowerChartMetric', 'branch');
    assert.deepEqual(await page.$$eval('#manpowerChartLegend .staff-list-legend-row', rows => rows.map(row => [row.querySelector('.staff-list-legend-name span').textContent, row.querySelector('strong').textContent])), [['South', '7'], ['HQ', '4'], ['North', '2']]);
    await page.click('#manpowerBack');
    await apply({ manpowerCompany: 'Alpha', manpowerBranch: 'North', manpowerDepartment: 'Finance' });
    assert.deepEqual(await table(), [['ACCOUNT EXECUTIVE', '2']]);
    await page.click('button[aria-label="View 2 staff records for ACCOUNT EXECUTIVE"]');
    assert.equal(await page.$$eval('#manpowerStaffList .manpower-employee-card', nodes => nodes.length), 2);
    await page.click('#manpowerBack');
    await page.click('#manpowerViewChart');
    assert.equal(await page.$eval('#manpowerChartTotal', n => n.textContent), '2');
    await page.click('#manpowerBack');
    await page.click('#manpowerFilterTrigger');
    await page.click('#manpowerResetFilter');
    assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '13');
    await apply({ manpowerSummaryBy: 'company' });
    assert.deepEqual(await table(), [['Alpha', '6'], ['Beta', '7']]);
    await page.click('button[aria-label="View 6 staff records for Alpha"]');
    assert.equal(await page.$eval('#manpowerStaffTotalRecords', node => node.textContent), '6');
    await page.click('#manpowerBack');
    await apply({ manpowerSummaryBy: 'branch' });
    assert.deepEqual(await table(), [['HQ', '4'], ['North', '2'], ['South', '7']]);
    await page.click('button[aria-label="View 4 staff records for HQ"]');
    assert.equal(await page.$$eval('#manpowerStaffList .manpower-employee-card', nodes => nodes.length), 4);
    await page.click('#manpowerBack');
    await apply({ manpowerSummaryBy: 'department' });
    assert.deepEqual(await table(), [['Finance', '6'], ['Operations', '7']]);
    await page.click('button[aria-label="View 6 staff records for Finance"]');
    assert.equal(await page.$$eval('#manpowerStaffList .manpower-employee-card', nodes => nodes.length), 6);
    await page.click('#manpowerBack');
    await apply({ manpowerSummaryBy: 'jobType', manpowerEffectiveDate: '2026-10-04' });
    assert.deepEqual(await table(), [['ACCOUNT EXECUTIVE', '4'], ['ADMIN MANAGER', '3']]);
    assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '7');
    await page.click('button[aria-label="View 3 staff records for ADMIN MANAGER"]');
    assert.equal(await page.$$eval('#manpowerStaffList .manpower-employee-card', nodes => nodes.length), 3);
    await page.click('#manpowerBack');
    await apply({ manpowerEffectiveDate: '2026-08-31' });
    assert.deepEqual(await table(), []);
    assert.equal(await page.$eval('#manpowerTotalHeadcount', n => n.textContent), '0');
    assert.ok(await page.$eval('#manpowerEmpty', n => !n.hidden));
    assert.equal(await page.$$eval('#manpowerTable tbody button', buttons => buttons.length), 0);
    assert.ok(await page.$eval('#manpowerStaffView', section => section.hidden));
    await page.click('#manpowerViewChart');
    assert.equal(await page.$$eval('#manpowerChartSegments circle', nodes => nodes.length), 0);
    assert.ok(await page.$eval('#manpowerChartNote', n => n.textContent.includes('No records')));
    await page.evaluateOnNewDocument(({ aggregates, staff }) => {
      window.MANPOWER_STATISTICS_DATA = aggregates;
      window.MANPOWER_STATISTICS_STAFF = staff;
    }, { aggregates: controlledAggregate, staff: controlledStaff });
    await page.goto(url, { waitUntil: 'load' });
    await page.click('#manpowerTable tbody td:first-child button');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'manpowerStatisticsClose');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'manpowerStatisticsClose');
    const statistics = await page.$$eval('#manpowerStatisticsDetails tr', rows => Object.fromEntries(rows.map(row => [
      row.querySelector('th').textContent,
      row.querySelector('td').textContent
    ])));
    assert.deepEqual(statistics, {
      Description: 'ACCOUNT EXECUTIVE',
      Headcount: '2',
      'Average Age': '35.00',
      'Average Service Years': '7.50',
      'Average Competency Points': '7.00',
      'Average Competency Match %': '85.00',
      'Average Basic Pay': '3,000.00',
      'Median Basic Pay': '3,000.00',
      'Minimum Basic Pay': '2,000.00',
      'Maximum Basic Pay': '4,000.00',
      'Average Increment %': '3.00',
      'Average Bonus Factor': '1.50',
      'Attendance %': '95.00',
      'Average Monthly OT Hours': '3.00',
      'Average Training Cost': '300.00',
      'Average Performance Score': '85.00',
      'Annual Attrition %': '2.00'
    });
    await page.$eval('#manpowerTable tbody td:first-child button', button => button.remove());
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'manpowerFilterTrigger');
    await page.evaluate(() => { window.MANPOWER_STATISTICS_STAFF.length = 0; });
    await page.click('#manpowerFilterTrigger');
    await page.click('#manpowerApplyFilter');
    await page.click('#manpowerTable tbody td:last-child button');
    assert.ok(await page.$eval('#manpowerTableView', section => !section.hidden));
    assert.ok(await page.$eval('#manpowerStaffView', section => section.hidden));
    assert.match(await page.$eval('#manpowerDrilldownStatus', status => status.textContent), /unavailable|refresh/i);
    await page.evaluateOnNewDocument(({ aggregates, staff }) => {
      window.MANPOWER_STATISTICS_DATA = aggregates;
      window.MANPOWER_STATISTICS_STAFF = staff;
    }, { aggregates: missingValueAggregate, staff: missingValueStaff });
    await page.goto(url, { waitUntil: 'load' });
    await page.click('button[aria-label="View 1 staff records for ACCOUNT EXECUTIVE"]');
    await page.click('#manpowerStaffList .manpower-employee-card');
    const missingDetails = await page.$$eval('#manpowerEmployeeDetails tr', rows => Object.fromEntries(rows.map(row => [
      row.querySelector('th').textContent,
      row.querySelector('td').textContent
    ])));
    assert.equal(missingDetails.Base, '—');
    assert.equal(missingDetails.Line, '—');
    assert.equal(await page.$eval('#manpowerEmployeeAvatar', avatar => avatar.textContent), 'A');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'manpowerEmployeeClose');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'manpowerEmployeeClose');
    await page.evaluate(() => document.getElementById('manpowerFilterForm').requestSubmit());
    assert.ok(await page.$eval('#manpowerEmployeeOverlay', overlay => overlay.hidden));
    assert.ok(await page.$eval('#manpowerTableView', section => !section.hidden));
    for (const width of [360, 390, 420]) {
      await page.setViewport({ width, height: 950 });
      assert.ok(await page.$eval('main', main => main.scrollWidth <= main.clientWidth + 1));
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Manpower table, 34/282 sample, organization filters, inclusive effective dates, grouping, chart conservation, empty state, navigation, themes and mobile widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
