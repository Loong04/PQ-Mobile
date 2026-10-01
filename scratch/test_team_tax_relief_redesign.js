const puppeteer = require('puppeteer');
const path = require('path');

const pageUrl = `file:///${path.resolve(__dirname, '../modules/payroll/options/tax-relief.html').replace(/\\/g, '/')}`;

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewport({ width: 450, height: 950 });
    await page.goto(pageUrl, { waitUntil: 'networkidle0' });

    const initial = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.tax-relief-record-card')];
      const firstCard = cards[0];
      const name = firstCard?.querySelector('.tax-relief-employee-name');
      const employeeId = firstCard?.querySelector('.tax-relief-employee-id');
      return {
        title: document.querySelector('h1')?.textContent.trim() || '',
        filterSummary: document.querySelector('#taxReliefFilterSummary')?.textContent.replace(/\s+/g, ' ').trim() || '',
        cardCount: cards.length,
        firstCardText: firstCard?.innerText.replace(/\s+/g, ' ').trim() || '',
        idDirectlyAfterName: name?.nextElementSibling === employeeId,
        employeeId: employeeId?.textContent.trim() || '',
        headerBackground: document.querySelector('.tax-relief-header')
          ? getComputedStyle(document.querySelector('.tax-relief-header')).backgroundImage
          : ''
      };
    });

    await page.click('#taxReliefFilterTrigger');
    await new Promise(resolve => setTimeout(resolve, 250));
    const filter = await page.evaluate(() => ({
      open: document.querySelector('#taxReliefFilterModal')?.classList.contains('is-open') || false,
      fields: ['taxReliefSearch', 'taxReliefStartDate', 'taxReliefEndDate', 'taxReliefItem', 'taxReliefStatus', 'taxReliefDescription']
        .filter(id => document.getElementById(id)).length,
      reset: !!document.querySelector('#taxReliefFilterModal [data-filter-reset]'),
      close: !!document.querySelector('#taxReliefFilterModal [data-filter-close]'),
      apply: !!document.querySelector('#taxReliefFilterModal .standard-filter-apply')
    }));
    await page.click('#taxReliefFilterModal [data-filter-close]');

    await page.click('.tax-relief-record-card');
    await new Promise(resolve => setTimeout(resolve, 250));
    const details = await page.evaluate(() => {
      const sheet = document.querySelector('#taxReliefDetailModal');
      const rows = [...sheet.querySelectorAll('[data-detail-key]')].map(row => row.getAttribute('data-detail-key'));
      const employeeName = sheet.querySelector('.tax-relief-detail-name');
      const employeeId = sheet.querySelector('.tax-relief-detail-id');
      return {
        open: sheet?.classList.contains('is-open') || false,
        title: sheet?.querySelector('h2')?.textContent.trim() || '',
        rows,
        idDirectlyAfterName: employeeName?.nextElementSibling === employeeId,
        employeeId: employeeId?.textContent.trim() || '',
        attachmentInsideTable: !!sheet.querySelector('.tax-relief-detail-table [data-detail-key="Attachment"]'),
        text: sheet?.innerText.replace(/\s+/g, ' ').trim() || ''
      };
    });
    await page.click('#taxReliefDetailModal [data-detail-close]');

    await page.click('#taxReliefFilterTrigger');
    await page.type('#taxReliefSearch', 'Aisha');
    await page.click('#taxReliefFilterModal .standard-filter-apply');
    await new Promise(resolve => setTimeout(resolve, 150));
    const filtered = await page.evaluate(() => ({
      count: document.querySelectorAll('.tax-relief-record-card').length,
      text: document.querySelector('#taxReliefRecords')?.innerText || ''
    }));

    const requiredRows = [
      'Reference #', 'Status', 'Submit Date', 'Rebate Item', 'Transaction Date',
      'Description', 'Receipt #', 'Amount', 'Attachment', 'Process', 'Period',
      'Cycle', 'Approval Date', 'Approver Remarks'
    ];
    const passed = initial.title === 'Team Tax Relief'
      && initial.cardCount > 0
      && initial.firstCardText.includes('Position')
      && initial.firstCardText.includes('Transaction Date')
      && initial.firstCardText.includes('Rebate Item')
      && initial.firstCardText.includes('Amount')
      && initial.firstCardText.includes('Status')
      && initial.firstCardText.includes('Period / Cycle')
      && initial.idDirectlyAfterName
      && initial.employeeId.startsWith('#')
      && /linear-gradient/.test(initial.headerBackground)
      && filter.open && filter.fields === 6 && filter.reset && filter.close && filter.apply
      && details.open && details.title === 'Tax Relief Detail'
      && requiredRows.every(row => details.rows.includes(row))
      && details.idDirectlyAfterName && details.employeeId.startsWith('#')
      && details.attachmentInsideTable
      && filtered.count === 1 && filtered.text.includes('Aisha')
      && pageErrors.length === 0;

    await page.screenshot({ path: path.join(__dirname, 'team_tax_relief_redesign_dark.png'), fullPage: false });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await new Promise(resolve => setTimeout(resolve, 150));
    await page.screenshot({ path: path.join(__dirname, 'team_tax_relief_redesign_light.png'), fullPage: false });

    console.log(JSON.stringify({ initial, filter, details, filtered, pageErrors, passed }, null, 2));
    if (!passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exit(1); });
