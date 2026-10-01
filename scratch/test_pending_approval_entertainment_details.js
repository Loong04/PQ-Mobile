const puppeteer = require('puppeteer');
const path = require('path');

const EXPECTED_SECTIONS = ['General', 'Detail', 'Employees', 'Guest'];
const EXPECTED_GENERAL_LABELS = [
  'Document Reference', 'Status', 'Employee', 'Claim Period',
  'Travelling & Mileage Claim #', 'Benefit Type', 'Claim Date', 'Cost Centre',
  'Project', 'Entertained Person / Org', 'Place Entertained', 'Purpose',
  'Currency', 'Total Amount', 'No. of Internal Attendees',
  'No. of External Attendees', 'Avg Per Pax', 'Board Approve',
  'Gift / Ent', 'Trv / Hosp', 'Remarks'
];

function values(rows) {
  return Object.fromEntries(rows.map(row => [row.label, row.value]));
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

    await page.evaluate(() => {
      const tab = [...document.querySelectorAll('.filter-pill')]
        .find(button => button.textContent.trim() === 'Entertainment');
      if (!tab) throw new Error('Missing Entertainment tab');
      tab.click();
    });
    await page.waitForFunction(() => (
      document.querySelector('.filter-pill.active')?.textContent.trim() === 'Entertainment'
    ));

    const filteredCardTypes = await page.evaluate(() => (
      [...document.querySelectorAll('#teamApprovalsQueue pending-approval-card')]
        .map(card => card.getAttribute('claim-type'))
    ));

    await page.evaluate(() => window.ClaimsEngine.triggerClaimViewDetails(7));
    await page.waitForSelector('#claimDetailsModalOverlay.active');

    const details = await page.evaluate(() => {
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

    const generalRows = details.sections[0]?.grids[0] || [];
    const general = values(generalRows);
    const detail = values(details.sections[1]?.grids[0] || []);
    const employee = values(details.sections[2]?.grids[0] || []);
    const guest = values(details.sections[3]?.grids[0] || []);

    const passed = details.header === 'Entertainment Claim Approval'
      && JSON.stringify(filteredCardTypes) === JSON.stringify(['Entertainment Claim'])
      && JSON.stringify(details.sections.map(section => section.title)) === JSON.stringify(EXPECTED_SECTIONS)
      && JSON.stringify(generalRows.map(row => row.label)) === JSON.stringify(EXPECTED_GENERAL_LABELS)
      && /Farhan binti rahmat\s+#EBB12/.test(general.Employee || '')
      && general['Claim Period'] === '202501'
      && general['Claim Date'] === '16/09/2025 - 29/09/2025'
      && general['Board Approve'] === 'Yes'
      && general['Gift / Ent'] === 'No'
      && general['Trv / Hosp'] === 'No'
      && detail.Expense === 'ENTERTAINMENT'
      && detail.Date === '08/11/2024'
      && detail.Amount === '678.00'
      && employee.Position === 'BENEFITS & COMPENSATION EXECUTIVE'
      && employee.Company === 'PEOPLE QUEST SDN BHD'
      && employee.Department === 'HUMAN RESOURCE'
      && guest.Attendee === 'aidjcp;'
      && guest.Company === 'fdggsfdvg'
      && guest.Designation === 'sgvfc'
      && pageErrors.length === 0;

    console.log(JSON.stringify({
      header: details.header,
      sectionTitles: details.sections.map(section => section.title),
      gridCounts: details.sections.map(section => section.grids.length),
      generalLabels: generalRows.map(row => row.label),
      filteredCardTypes,
      pageErrors,
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
