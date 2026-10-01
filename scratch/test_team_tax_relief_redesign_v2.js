const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 450, height: 950 });
    const url = `file:///${path.resolve(__dirname, '../modules/payroll/options/tax-relief.html').replace(/\\/g, '/')}`;
    await page.goto(url, { waitUntil: 'networkidle0' });

    const exists = async selector => !!(await page.$(selector));
    const filter = { open: false, fieldCount: 0, actions: 0 };
    if (await exists('#taxReliefFilterTrigger')) {
      await page.click('#taxReliefFilterTrigger');
      await new Promise(resolve => setTimeout(resolve, 200));
      Object.assign(filter, await page.evaluate(() => ({
        open: document.querySelector('#taxReliefFilterModal')?.classList.contains('is-open') || false,
        fieldCount: ['taxReliefSearch', 'taxReliefStartDate', 'taxReliefEndDate', 'taxReliefItem', 'taxReliefStatus', 'taxReliefDescription']
          .filter(id => document.getElementById(id)).length,
        actions: document.querySelectorAll('#taxReliefFilterModal [data-filter-reset], #taxReliefFilterModal [data-filter-close], #taxReliefFilterModal .standard-filter-apply').length
      })));
      if (await exists('#taxReliefFilterModal [data-filter-close]')) await page.click('#taxReliefFilterModal [data-filter-close]');
    }

    const detail = { open: false, title: '', keys: [], attachmentInsideTable: false };
    if (await exists('.tax-relief-record-card')) {
      await page.click('.tax-relief-record-card');
      await new Promise(resolve => setTimeout(resolve, 200));
      Object.assign(detail, await page.evaluate(() => {
        const modal = document.querySelector('#taxReliefDetailModal');
        return {
          open: modal?.classList.contains('is-open') || false,
          title: modal?.querySelector('h2')?.textContent.trim() || '',
          keys: [...(modal?.querySelectorAll('[data-detail-key]') || [])].map(row => row.dataset.detailKey),
          attachmentInsideTable: !!modal?.querySelector('.tax-relief-detail-table [data-detail-key="Attachment"]')
        };
      }));
      if (await exists('#taxReliefDetailModal [data-detail-close]')) await page.click('#taxReliefDetailModal [data-detail-close]');
    }

    const initial = await page.evaluate(() => {
      const card = document.querySelector('.tax-relief-record-card');
      const name = card?.querySelector('.tax-relief-employee-name');
      const employeeId = card?.querySelector('.tax-relief-employee-id');
      return {
        title: document.querySelector('h1')?.textContent.trim() || '',
        cards: document.querySelectorAll('.tax-relief-record-card').length,
        cardText: card?.innerText.replace(/\s+/g, ' ').trim() || '',
        employeeId: employeeId?.textContent.trim() || '',
        idBelowName: name?.nextElementSibling === employeeId,
        purpleHeader: document.querySelector('.tax-relief-header')
          ? getComputedStyle(document.querySelector('.tax-relief-header')).backgroundImage.includes('linear-gradient')
          : false
      };
    });

    let filtered = { count: 0, text: '' };
    if (await exists('#taxReliefFilterTrigger')) {
      await page.click('#taxReliefFilterTrigger');
      await page.type('#taxReliefSearch', 'Aisha');
      await page.click('#taxReliefFilterModal .standard-filter-apply');
      await new Promise(resolve => setTimeout(resolve, 120));
      filtered = await page.evaluate(() => ({
        count: document.querySelectorAll('.tax-relief-record-card').length,
        text: document.querySelector('#taxReliefRecords')?.innerText || ''
      }));
    }

    const requiredCardText = ['Position', 'Transaction Date', 'Rebate Item', 'Amount', 'Status', 'Period / Cycle'];
    const requiredDetailKeys = ['Reference #', 'Status', 'Submit Date', 'Rebate Item', 'Transaction Date', 'Description', 'Receipt #', 'Amount', 'Attachment', 'Process', 'Period', 'Cycle', 'Approval Date', 'Approver Remarks'];
    const passed = initial.title === 'Team Tax Relief'
      && initial.cards > 0 && initial.idBelowName && initial.employeeId.startsWith('#') && initial.purpleHeader
      && requiredCardText.every(label => initial.cardText.includes(label))
      && filter.open && filter.fieldCount === 6 && filter.actions === 3
      && detail.open && detail.title === 'Tax Relief Detail'
      && requiredDetailKeys.every(key => detail.keys.includes(key)) && detail.attachmentInsideTable
      && filtered.count === 1 && filtered.text.includes('Aisha') && errors.length === 0;

    await page.screenshot({ path: path.join(__dirname, 'team_tax_relief_redesign_dark.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await new Promise(resolve => setTimeout(resolve, 120));
    await page.screenshot({ path: path.join(__dirname, 'team_tax_relief_redesign_light.png') });
    console.log(JSON.stringify({ initial, filter, detail, filtered, errors, passed }, null, 2));
    if (!passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exit(1); });
