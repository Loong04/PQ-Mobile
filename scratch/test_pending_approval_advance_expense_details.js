const puppeteer = require('puppeteer');
const path = require('path');

const ADVANCE_LABELS = [
  'Document Reference', 'Status', 'Employee', 'Claim Period', 'Claim Date',
  'Cost Centre', 'Project', 'Claim Type', 'Benefit Type', 'Purpose',
  'Claim Currency', 'Claim Total', 'Remarks'
];

const EXPENSE_LABELS = [
  'Document Reference', 'Status', 'Employee', 'Claim Period', 'Start Date',
  'End Date', 'Benefit Year', 'Benefit Type', 'Purpose', 'Claim Currency',
  'Claim Total', 'Project', 'Cost Centre', 'Remarks'
];

function rowsToObject(rows) {
  return Object.fromEntries(rows.map(row => [row.label, row.value]));
}

async function readDetails(page, id) {
  await page.evaluate(claimId => window.ClaimsEngine.triggerClaimViewDetails(claimId), id);
  await page.waitForSelector('#claimDetailsModalOverlay.active');

  const result = await page.evaluate(() => {
    const body = document.getElementById('claimDetailsDynamicBody');
    return {
      header: document.getElementById('claimDetailHeaderTitle')?.textContent.trim() || '',
      sections: [...body.querySelectorAll(':scope > section[aria-label]')].map(section => ({
        title: section.querySelector(':scope > h4')?.textContent.trim() || '',
        grids: [...section.querySelectorAll(':scope > div > .claim-detail-table-grid')].map(grid => (
          [...grid.querySelectorAll('tr')].map(row => ({
            label: row.cells[0]?.textContent.trim() || '',
            value: row.cells[1]?.innerText.trim() || ''
          }))
        ))
      }))
    };
  });

  await page.evaluate(() => window.ClaimsEngine.closeClaimDetailsModal());
  await page.waitForFunction(() => !document.getElementById('claimDetailsModalOverlay')?.classList.contains('active'));
  return result;
}

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

    const pageUrl = `file:///${path.resolve(__dirname, '../modules/claims/options/pending-approval.html').replace(/\\/g, '/')}`;
    await page.goto(pageUrl, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#teamApprovalsQueue pending-approval-card');

    const advance = await readDetails(page, 8);
    const expense = await readDetails(page, 10);

    const advanceGeneralRows = advance.sections[0]?.grids[0] || [];
    const advanceGeneral = rowsToObject(advanceGeneralRows);
    const advanceExpenseRows = advance.sections[1]?.grids || [];

    const expenseGeneralRows = expense.sections[0]?.grids[0] || [];
    const expenseGeneral = rowsToObject(expenseGeneralRows);
    const itemizedRows = expense.sections[1]?.grids[0] || [];
    const itemized = rowsToObject(itemizedRows);

    const advancePassed = advance.header === 'Advance Request Approval'
      && JSON.stringify(advance.sections.map(section => section.title)) === JSON.stringify(['General', 'Expense'])
      && JSON.stringify(advanceGeneralRows.map(row => row.label)) === JSON.stringify(ADVANCE_LABELS)
      && /Farhan binti rahmat\s+#EBB12/.test(advanceGeneral.Employee || '')
      && advanceGeneral['Claim Period'] === '202404'
      && advanceGeneral['Claim Date'] === '26/04/2024 - 26/04/2024'
      && advanceGeneral['Claim Total'] === '180.00'
      && advanceExpenseRows.length === 6
      && rowsToObject(advanceExpenseRows[0]).Expense === 'EMPLOYEE WELFARE'
      && rowsToObject(advanceExpenseRows[0]).Description === 'ITEM A'
      && rowsToObject(advanceExpenseRows[5]).Description === 'Item F'
      && rowsToObject(advanceExpenseRows[5]).Amount === '23.00';

    const expensePassed = expense.header === 'Expense Claim Approval'
      && JSON.stringify(expense.sections.map(section => section.title)) === JSON.stringify(['', 'Itemized Details'])
      && JSON.stringify(expenseGeneralRows.map(row => row.label)) === JSON.stringify(EXPENSE_LABELS)
      && /Asmawi idris\s+#EBB15/.test(expenseGeneral.Employee || '')
      && expenseGeneral['Claim Period'] === '202211'
      && expenseGeneral['Start Date'] === '01/11/2022'
      && expenseGeneral['End Date'] === '01/11/2022'
      && expenseGeneral['Benefit Type'] === '-'
      && expenseGeneral.Project === '-'
      && expenseGeneral['Claim Total'] === '1,229.85'
      && itemized.Description === 'Entertainment for Staff'
      && itemized.Amount === '1,229.85';

    const passed = advancePassed && expensePassed && pageErrors.length === 0;

    console.log(JSON.stringify({
      advance: {
        header: advance.header,
        sectionTitles: advance.sections.map(section => section.title),
        labels: advanceGeneralRows.map(row => row.label),
        expenseGridCount: advanceExpenseRows.length
      },
      expense: {
        header: expense.header,
        sectionTitles: expense.sections.map(section => section.title),
        labels: expenseGeneralRows.map(row => row.label),
        itemizedLabels: itemizedRows.map(row => row.label)
      },
      pageErrors,
      advancePassed,
      expensePassed,
      passed
    }, null, 2));

    if (!passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
