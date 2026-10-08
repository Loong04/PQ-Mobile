const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/shift-plan.html')).href;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(pageUrl + '?theme=light', { waitUntil: 'load' });
    await page.click('#tabSummaryBtn');

    assert.equal(await page.$('#kpiTotalHeadcount'), null);
    assert.equal(await page.$('#kpiShiftCount'), null);
    assert.ok(await page.$('#summaryChartInfoButton .fa-circle-info'));
    assert.equal(await page.$('#summaryLegendOff'), null);
    assert.equal(await page.$('#summaryLegendW02'), null);
    assert.equal(await page.$eval('#summaryChartCard', node => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)');
    assert.equal(await page.$('#tableRecordCountBadge'), null);
    assert.equal(await page.$('#summaryTabView .summary-table-footer'), null);
    assert.equal(await page.$eval('#summaryChartTotal', node => node.textContent.trim()), '287');
    assert.ok(await page.$('#summaryTabView .summary-table-card'));
    assert.equal(await page.$eval('#summaryChartCard', node => node.nextElementSibling?.classList.contains('summary-table-card')), true);
    assert.equal(await page.$eval('#summaryTabView', node => node.textContent.includes('Shift Breakdown Table')), false);
    assert.equal(await page.$$eval('#summaryTableRowsContainer .summary-table-row', rows => rows.length), 11);

    await page.click('#summaryChartInfoButton');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$eval('#chartModal', node => getComputedStyle(node).display), 'flex');
    assert.equal(await page.$eval('#chartModal', node => getComputedStyle(node).alignItems), 'flex-end');
    assert.ok(await page.$('#chartModal > .modal-sheet'));
    assert.equal(await page.$eval('#chartModal .sheet-title', node => node.textContent.trim()), 'Chart Details');
    assert.equal(await page.$eval('#chartInfoOffCount', node => node.textContent.trim()), '274 Staff');
    assert.equal(await page.$eval('#chartInfoOffPercent', node => node.textContent.trim()), '95.5%');
    assert.equal(await page.$eval('#chartInfoW02Count', node => node.textContent.trim()), '13 Staff');
    assert.equal(await page.$eval('#chartInfoW02Percent', node => node.textContent.trim()), '4.5%');
    await page.evaluate(() => closeModal('chartModal'));
    await new Promise(resolve => setTimeout(resolve, 320));

    await page.click('#summaryTableRowsContainer .headcount-detail-trigger');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$eval('#headcountDetailModal', node => getComputedStyle(node).display), 'flex');
    assert.equal(await page.$eval('#headcountDetailModal', node => getComputedStyle(node).alignItems), 'center');
    assert.ok(await page.$('#headcountDetailModal > .detail-popout-panel'));
    assert.equal(await page.$eval('#headcountDetailModal .sheet-title', node => node.textContent.trim()), 'Headcount Details');
    assert.equal(await page.$('#headcountDetailsTabButton'), null);
    assert.equal(await page.$('#headcountEmployeeTabButton'), null);
    assert.deepEqual(
      await page.$$eval('#headcountPrimaryDetailsTable tbody tr', rows => rows.map(row => Array.from(row.cells, cell => cell.textContent.trim()))),
      [['Shift', 'N/A'], ['Job Title', 'ACCOUNT EXECUTIVE'], ['Headcount', '3.00']]
    );
    assert.equal(await page.$eval('#headcountEmployeeSectionTitle', node => node.textContent.trim()), 'Employee');
    assert.deepEqual(
      await page.$$eval('#headcountEmployeeTable thead th', cells => cells.map(cell => cell.textContent.trim())),
      ['Emp #', 'Name']
    );
    assert.equal(await page.$eval('#headcountEmployeeTable thead th', cell => getComputedStyle(cell).backgroundColor), 'rgb(124, 58, 237)');
    assert.equal(await page.$eval('#headcountEmployeeTable thead th', cell => getComputedStyle(cell).color), 'rgb(255, 255, 255)');
    assert.equal(await page.$eval('.headcount-employee-table-wrap', node => getComputedStyle(node).borderLeftWidth), '1px');
    assert.equal(await page.$$eval('#headcountEmployeeTable tbody tr', rows => rows.length), 3);
    assert.equal(await page.$$eval('#headcountEmployeeTable tbody tr', rows => rows.every(row => row.cells[0].textContent.trim().startsWith('#') && row.cells[1].textContent.trim().length > 0)), true);
    await page.evaluate(() => closeModal('headcountDetailModal'));
    await new Promise(resolve => setTimeout(resolve, 320));

    await page.evaluate(() => openFilterModal());
    assert.equal(await page.$eval('#staffChangeFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#staffCopyFilterFields', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#calendarFilterFields', node => getComputedStyle(node).display), 'none');
    assert.notEqual(await page.$eval('#summaryFilterFields', node => getComputedStyle(node).display), 'none');
    assert.deepEqual(
      await page.$$eval('#summaryFilterFields .summary-filter-field > label', nodes => nodes.map(node => node.textContent.trim())),
      ['Date', 'Shift Type', 'Department', 'Branch', 'Section', 'Cost Centre']
    );
    assert.equal(
      await page.$$eval('#filterModal .standard-filter-reset', buttons => buttons.filter(button => getComputedStyle(button).display !== 'none').length),
      1
    );
    assert.equal(
      await page.$$eval('#filterModal .standard-filter-apply', buttons => buttons.filter(button => getComputedStyle(button).display !== 'none').length),
      1
    );

    await page.$eval('#summaryFilterDate', node => { node.value = '2026-09-25'; });
    await page.select('#summaryFilterShiftType', 'W02');
    await page.select('#summaryFilterDepartment', 'Finance');
    await page.select('#summaryFilterBranch', 'HQ');
    await page.select('#summaryFilterSection', 'Accounts');
    await page.select('#summaryFilterCostCenter', 'Management');
    await page.click('#applyFilterButton');
    await new Promise(resolve => setTimeout(resolve, 320));

    const filterText = await page.$eval('#currentFilterTextDisplay', node => node.textContent);
    assert.match(filterText, /25.*Sep.*2026/);
    assert.match(filterText, /W02/);
    assert.match(filterText, /Finance/);
    assert.match(filterText, /HQ/);
    assert.match(filterText, /Accounts/);
    assert.match(filterText, /Management/);
    assert.equal(await page.$eval('#summaryChartTotal', node => node.textContent.trim()), '3');
    assert.equal(await page.$$eval('#summaryTableRowsContainer .summary-table-row', rows => rows.length), 1);
    assert.match(await page.$eval('#summaryTableRowsContainer .summary-table-row', row => row.textContent), /ACCOUNT EXECUTIVE/);

    await page.click('#summaryChartInfoButton');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$eval('#chartInfoOffCount', node => node.textContent.trim()), '0 Staff');
    assert.equal(await page.$eval('#chartInfoOffPercent', node => node.textContent.trim()), '0.0%');
    assert.equal(await page.$eval('#chartInfoW02Count', node => node.textContent.trim()), '3 Staff');
    assert.equal(await page.$eval('#chartInfoW02Percent', node => node.textContent.trim()), '100.0%');
    await page.evaluate(() => closeModal('chartModal'));
    await new Promise(resolve => setTimeout(resolve, 320));

    await page.click('#summaryTableRowsContainer .headcount-detail-trigger');
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$eval('#headcountPrimaryDetailsTable tbody tr:nth-child(2) .detail-popout-value', node => node.textContent.trim()), 'ACCOUNT EXECUTIVE');
    assert.equal(await page.$eval('#headcountPrimaryDetailsTable tbody tr:nth-child(3) .detail-popout-value', node => node.textContent.trim()), '3.00');
    await page.evaluate(() => closeModal('headcountDetailModal'));
    await new Promise(resolve => setTimeout(resolve, 320));

    await page.evaluate(() => openFilterModal());
    await page.click('#resetFilterButton');
    assert.equal(await page.$eval('#summaryFilterShiftType', node => node.value), 'all');
    assert.equal(await page.$eval('#summaryFilterDepartment', node => node.value), 'all');
    assert.equal(await page.$eval('#summaryFilterBranch', node => node.value), 'all');
    assert.equal(await page.$eval('#summaryFilterSection', node => node.value), 'all');
    assert.equal(await page.$eval('#summaryFilterCostCenter', node => node.value), 'all');
    assert.equal(await page.$eval('#summaryChartTotal', node => node.textContent.trim()), '287');
    assert.equal(await page.$$eval('#summaryTableRowsContainer .summary-table-row', rows => rows.length), 11);

    await page.evaluate(() => {
      closeModal('filterModal');
      openFilterModal();
    });
    await new Promise(resolve => setTimeout(resolve, 320));
    assert.equal(await page.$eval('#filterModal', node => getComputedStyle(node).display), 'flex');
    assert.deepEqual(errors, []);
    console.log('PASS: Summary uses independent logical filters and synchronized chart, info, and table data.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
