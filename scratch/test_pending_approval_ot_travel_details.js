const puppeteer = require('puppeteer');
const path = require('path');

const EXPECTED_OT_LABELS = [
  'Document #', 'Status', 'Employee', 'Claim Period', 'Date', 'OT Type',
  'Start Time', 'End Time', 'OT Hours', 'Cross Day', 'Break Hours',
  'Break Minutes', 'Project', 'Reason', 'Meal Allowance Amount',
  'Meal Allowance', 'Transport', 'Distance', 'Way', 'Mileage Amount', 'Remarks'
];

const EXPECTED_TRAVEL_MILEAGE_SECTIONS = ['General', 'Mileage', 'Travel', 'Expense'];
const EXPECTED_TRAVEL_REQUEST_SECTIONS = ['General', 'Task', 'Traveling', 'Accommodation'];

async function selectTab(page, tabName) {
  await page.evaluate((name) => {
    const tab = [...document.querySelectorAll('.filter-pill')]
      .find(button => button.textContent.trim() === name);
    if (!tab) throw new Error(`Missing pending approval tab: ${name}`);
    tab.click();
  }, tabName);
  await page.waitForFunction((name) => (
    document.querySelector('.filter-pill.active')?.textContent.trim() === name
  ), {}, tabName);
}

async function openDetails(page, tabName, itemId) {
  await selectTab(page, tabName);
  await page.evaluate((id) => window.ClaimsEngine.triggerClaimViewDetails(id), itemId);
  await page.waitForSelector('#claimDetailsModalOverlay.active');
}

async function readDetails(page) {
  return page.evaluate(() => {
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
}

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

    await openDetails(page, 'OT', '3');
    const ot = await readDetails(page);
    await page.evaluate(() => window.ClaimsEngine.closeClaimDetailsModal());

    await openDetails(page, 'Travel Mileage', '6');
    const travelMileage = await readDetails(page);
    const travelMileageCards = await page.evaluate(() => (
      [...document.querySelectorAll('#teamApprovalsQueue pending-approval-card')]
        .map(card => card.getAttribute('claim-type'))
    ));
    await page.evaluate(() => window.ClaimsEngine.closeClaimDetailsModal());

    await openDetails(page, 'Travel Request', '12');
    const travelRequest = await readDetails(page);
    const travelRequestCards = await page.evaluate(() => (
      [...document.querySelectorAll('#teamApprovalsQueue pending-approval-card')]
        .map(card => card.getAttribute('claim-type'))
    ));

    const otRows = ot.sections[0]?.grids[0] || [];
    const otValues = values(otRows);
    const otPassed = ot.header === 'OT Claim Approval'
      && ot.sections.length === 1
      && ot.sections[0].title === ''
      && JSON.stringify(otRows.map(row => row.label)) === JSON.stringify(EXPECTED_OT_LABELS)
      && /Farhan binti rahmat\s+#EBB12/.test(otValues.Employee || '')
      && otValues['Break Minutes'] === '- Select Minute -'
      && otValues['Mileage Amount'] === '0';

    const travelMileageTitles = travelMileage.sections.map(section => section.title);
    const travelMileageGeneral = values(travelMileage.sections[0]?.grids[0] || []);
    const travelMileagePassed = travelMileage.header === 'Travel Mileage Approval'
      && JSON.stringify(travelMileageTitles) === JSON.stringify(EXPECTED_TRAVEL_MILEAGE_SECTIONS)
      && travelMileage.sections[1]?.grids.length === 3
      && travelMileage.sections[2]?.grids.length === 3
      && travelMileage.sections[3]?.grids.length === 3
      && JSON.stringify(travelMileageCards) === JSON.stringify(['Travel Claim'])
      && /Daniel Lee\s+#000582/.test(travelMileageGeneral.Employee || '')
      && travelMileageGeneral['Claim Currency'] === 'RINGGIT MALAYSIA';

    const travelRequestTitles = travelRequest.sections.map(section => section.title);
    const travelRequestGeneral = values(travelRequest.sections[0]?.grids[0] || []);
    const travelRequestTask = values(travelRequest.sections[1]?.grids[0] || []);
    const travelRequestTraveling = values(travelRequest.sections[2]?.grids[0] || []);
    const travelRequestAccommodation = values(travelRequest.sections[3]?.grids[0] || []);
    const travelRequestPassed = travelRequest.header === 'Travel Request Approval'
      && JSON.stringify(travelRequestTitles) === JSON.stringify(EXPECTED_TRAVEL_REQUEST_SECTIONS)
      && JSON.stringify(travelRequestCards) === JSON.stringify(['Travel Request'])
      && /Low chin hao\s+#EBB05/.test(travelRequestGeneral.Employee || '')
      && travelRequestGeneral['Travel Date'] === '17/03/2024 - 20/03/2024'
      && travelRequestGeneral['Travel Type'] === '- Select Travel Type -'
      && travelRequestGeneral.Attachment === '42ffbd04-1b10-4bef-ac4d-47e2857c18f7.jpg'
      && travelRequestTask.Purpose === 'Testing submission'
      && travelRequestTask.Location === 'Ipoh'
      && travelRequestTask.Dates === '17/03/2024 - 20/03/2024'
      && travelRequestTraveling.Origin === 'KL OFFICE'
      && travelRequestTraveling.Destination === 'IPOH'
      && travelRequestTraveling['Est. Cost'] === '1,000.00'
      && travelRequestAccommodation.Hotel === 'WESTIN HOTEL'
      && travelRequestAccommodation['Check In'] === '17 Mar 2024'
      && travelRequestAccommodation['Check Out'] === '20 Mar 2024';

    const passed = otPassed && travelMileagePassed && travelRequestPassed && pageErrors.length === 0;
    console.log(JSON.stringify({
      ot: { header: ot.header, titles: ot.sections.map(section => section.title), labels: otRows.map(row => row.label) },
      travelMileage: { header: travelMileage.header, titles: travelMileageTitles, gridCounts: travelMileage.sections.map(section => section.grids.length), cards: travelMileageCards },
      travelRequest: { header: travelRequest.header, titles: travelRequestTitles, cards: travelRequestCards },
      pageErrors,
      otPassed,
      travelMileagePassed,
      travelRequestPassed,
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
