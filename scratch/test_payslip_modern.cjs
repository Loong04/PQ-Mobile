const assert = require('node:assert/strict');
const path = require('node:path');
const puppeteer = require('puppeteer');

function payslipUrl(query = '') {
  const target = path.resolve(__dirname, '../modules/payroll/options/payslip.html').replace(/\\/g, '/');
  return `file:///${target}${query}`;
}

function collectPageFaults(page) {
  const faults = [];
  page.on('pageerror', error => faults.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      faults.push(`console: ${message.text()}`);
    }
  });
  return faults;
}

async function openPayslip(page, query = '') {
  await page.goto(payslipUrl(query), { waitUntil: 'networkidle0' });
  await page.waitForSelector('#earningsRows .payroll-data-row');
}

async function snapshot(page) {
  return page.evaluate(() => {
    const text = selector => document.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || '';
    const sectionStates = [...document.querySelectorAll('[data-payroll-section]')].map(section => {
      const toggle = section.querySelector('.payslip-section-toggle');
      const body = section.querySelector('.payslip-section-body');
      return {
        name: section.dataset.payrollSection,
        expanded: toggle?.getAttribute('aria-expanded') || '',
        bodyHidden: body?.getAttribute('aria-hidden') || ''
      };
    });

    return {
      hasPrivacyIcon: Boolean(document.querySelector('#privacyIcon')),
      hasOverview: Boolean(document.querySelector('.payslip-overview-card')),
      hasInfoCard: Boolean(document.querySelector('.payslip-info-card')),
      hasHeaderPeriod: Boolean(document.querySelector('#headerPayslipMonthText')),
      hasPayStatus: Boolean(document.querySelector('#payslipStatus')),
      hasPayDate: Boolean(document.querySelector('#payslipPayDate')),
      hasDocumentActions: Boolean(document.querySelector('.payslip-document-actions')),
      hasPrintAction: Boolean([...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Print')),
      hasDownloadAction: Boolean([...document.querySelectorAll('button')].some(button => button.textContent.trim() === 'Download PDF')),
      filterSummary: text('#payrollFilterSummary'),
      company: text('#payslipCompany'),
      netPay: text('#netPayMainDisplay'),
      earnings: text('#payslipEarningsTotal'),
      deductions: text('#payslipDeductionsTotal'),
      contributions: text('#payslipContributionsTotal'),
      sectionStates,
      pageText: document.body.innerText.replace(/\s+/g, ' ')
    };
  });
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const nodes = [document.documentElement, document.body, document.querySelector('.phone-container'), document.querySelector('.payroll-document-content')].filter(Boolean);
    return nodes.map(node => ({
      name: node === document.documentElement ? 'html' : node === document.body ? 'body' : node.className,
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth
    })).filter(item => item.scrollWidth > item.clientWidth + 1);
  });
  assert.deepEqual(overflow, [], `${label} must not overflow horizontally`);
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const faults = collectPageFaults(page);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });

    await openPayslip(page, '?month=2026-09');
    const september = await snapshot(page);

    await page.click('#payrollFilterTrigger');
    const filterFields = await page.$$eval('#payslipFilterModal .payroll-filter-body label', nodes => nodes.map(node => node.textContent.trim()));
    assert.deepEqual(filterFields, ['Company', 'Payroll Period', 'Payroll Cycle', 'Bank Branch', 'Account #'], 'Payslip filter must expose all five payroll fields');
    const metadata = await page.evaluate(() => ['payslipCompanySelect', 'payslipCycleSelect', 'payslipBankSelect', 'payslipAccountSelect'].map(id => document.getElementById(id)?.value));
    assert.deepEqual(metadata, ['PEOPLE QUEST SDN BHD', 'MONTH END', 'CIMB', '10447856855254'], 'Filters must select the current payslip metadata');
    await page.keyboard.press('Escape');

    assert.equal(september.hasPrivacyIcon, false, 'Payslip header must not include the removed eye/privacy action');
    assert.equal(september.hasOverview, true, 'Payslip must use one modern overview card');
    assert.equal(september.hasInfoCard, false, 'Payslip must not render the removed Payment Details card');
    assert.equal(september.hasHeaderPeriod, false, 'Payslip title must not repeat the selected payroll period');
    assert.equal(september.hasPayStatus, false, 'Net Pay card must not render a Paid status tag');
    assert.equal(september.hasPayDate, false, 'Net Pay card must not render a Paid on date');
    assert.equal(september.hasDocumentActions, false, 'Payslip must not render a document action bar');
    assert.equal(september.hasPrintAction, false, 'Payslip must not offer a Print action');
    assert.equal(september.hasDownloadAction, false, 'Payslip must not offer a Download PDF action');
    assert.equal(september.filterSummary, 'September 2026', 'month query must select the requested payslip');
    assert.equal(september.netPay, 'RM 6,482.50');
    assert.equal(september.earnings, 'RM 7,500.00');
    assert.equal(september.deductions, 'RM 1,017.50');
    assert.equal(september.company, 'PEOPLE QUEST SDN BHD', 'stable payroll metadata must not disappear on newer periods');
    assert.equal(september.sectionStates.length, 5);
    assert.deepEqual(september.sectionStates.map(section => section.name), [
      'Earnings',
      'Deductions',
      'Employer Contributions',
      'Statutory Base Details',
      'Other Information'
    ]);
    assert.equal(september.sectionStates[0].expanded, 'true', 'first breakdown section should be open initially');
    assert.equal(september.sectionStates[1].expanded, 'false', 'later breakdown sections should be compact initially');

    const purpleHeaders = await page.$$eval('.payslip-section-toggle', toggles => toggles.map(toggle => {
      const title = toggle.querySelector('.payslip-section-title strong');
      const subtitle = toggle.querySelector('.payslip-section-title small');
      const icon = toggle.querySelector('.payslip-section-icon');
      const amount = toggle.querySelector('.payslip-section-end strong');
      const chevron = toggle.querySelector('.payslip-section-end i');
      const toggleStyle = getComputedStyle(toggle);
      return {
        backgroundImage: toggleStyle.backgroundImage,
        titleColor: title ? getComputedStyle(title).color : '',
        subtitleColor: subtitle ? getComputedStyle(subtitle).color : '',
        iconBackground: icon ? getComputedStyle(icon).backgroundColor : '',
        iconColor: icon ? getComputedStyle(icon).color : '',
        amountColor: amount ? getComputedStyle(amount).color : '',
        chevronColor: chevron ? getComputedStyle(chevron).color : ''
      };
    }));
    assert.equal(purpleHeaders.length, 5, 'all five breakdown sections must use the shared header treatment');
    for (const header of purpleHeaders) {
      assert.match(header.backgroundImage, /linear-gradient/, 'each breakdown header must use the purple gradient');
      assert.equal(header.titleColor, 'rgb(255, 255, 255)', 'breakdown titles must stay white on purple');
      assert.match(header.subtitleColor, /rgba?\(255, 255, 255/, 'item counts must stay softly white on purple');
      assert.match(header.iconBackground, /rgba?\(255, 255, 255/, 'header icons must use a translucent white tile');
      assert.equal(header.iconColor, 'rgb(255, 255, 255)', 'header icons must stay white');
      if (header.amountColor) assert.equal(header.amountColor, 'rgb(255, 255, 255)', 'header amounts must stay white');
      assert.match(header.chevronColor, /rgba?\(255, 255, 255/, 'header chevrons must stay softly white');
    }

    await page.click('[data-payroll-section="Deductions"] .payslip-section-toggle');
    const deductionState = await page.$eval('[data-payroll-section="Deductions"]', section => ({
      expanded: section.querySelector('.payslip-section-toggle')?.getAttribute('aria-expanded'),
      hidden: section.querySelector('.payslip-section-body')?.getAttribute('aria-hidden')
    }));
    assert.deepEqual(deductionState, { expanded: 'true', hidden: 'false' }, 'section toggle must reveal its real rows');

    await page.click('#payrollFilterTrigger');
    await page.waitForFunction(() => document.querySelector('#payslipFilterModal')?.classList.contains('is-open'));
    await page.waitForFunction(() => document.activeElement === document.querySelector('#payslipFilterModal [data-filter-close]'));
    const openFilter = await page.evaluate(() => ({
      ariaHidden: document.querySelector('#payslipFilterModal')?.getAttribute('aria-hidden'),
      selected: document.querySelector('#payslipPeriodSelect')?.value,
      focusedClose: document.activeElement === document.querySelector('[data-filter-close]')
    }));
    assert.deepEqual(openFilter, { ariaHidden: 'false', selected: '2026-09', focusedClose: true }, 'filter sheet must expose state and focus its close action');

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#payslipFilterModal')?.classList.contains('is-open'));
    assert.equal(await page.$eval('#payslipFilterModal', modal => modal.getAttribute('aria-hidden')), 'true');

    await page.click('#payrollFilterTrigger');
    await page.click('[data-filter-reset]');
    assert.equal(await page.$eval('#payslipPeriodSelect', select => select.value), '2025-12');
    await page.click('.standard-filter-apply');
    await page.waitForFunction(() => document.querySelector('#payrollFilterSummary')?.textContent.trim() === 'December 2025');
    const december = await snapshot(page);

    assert.equal(december.netPay, 'RM 8,895.15');
    assert.equal(december.contributions, 'RM 1,358.65');
    assert.ok(december.pageText.includes('BASIC PAY RM 9,400.00'));
    assert.ok(december.pageText.includes('TOLL ALLOWANCE RM 200.00'));
    assert.ok(december.pageText.includes('HOUSING LOAN RM 500.00'));
    assert.ok(december.pageText.includes('EMPLOYER EPF RM 1,272.00'));
    assert.ok(december.pageText.includes('CP39 BASE RM 10,590.00'));
    assert.ok(december.pageText.includes('WORK DAYS 23.00'));
    assert.equal(new URL(page.url()).searchParams.get('month'), '2025-12', 'applied period must stay in the URL');

    // Exercise metadata filters with a second employer/account instead of only one-option selects.
    await page.evaluate(() => {
      window.PAYROLL_DATA.payslips['2026-10'] = {
        ...window.PAYROLL_DATA.payslips['2025-12'], monthLabel: 'October 2026', periodLabel: 'October 2026',
        company: 'SECOND COMPANY', payrollCycle: 'MID MONTH', bankBranch: 'Maybank', accountNumber: '00001234'
      };
    });
    await page.click('#payrollFilterTrigger');
    await page.select('#payslipCompanySelect', 'SECOND COMPANY');
    assert.equal(await page.$eval('#payslipPeriodSelect', select => select.options.length), 0, 'Mismatched metadata must not expose another payslip');
    assert.equal(await page.$eval('#payslipFilterModal .standard-filter-apply', button => button.disabled), true);
    await page.select('#payslipCycleSelect', 'MID MONTH');
    await page.select('#payslipBankSelect', 'Maybank');
    await page.select('#payslipAccountSelect', '00001234');
    assert.equal(await page.$eval('#payslipPeriodSelect', select => select.value), '2026-10');
    await page.click('.standard-filter-apply');
    const october = await snapshot(page);
    assert.equal(october.company, 'SECOND COMPANY');
    assert.equal(october.filterSummary, 'October 2026');
    await page.click('#payrollFilterTrigger');
    assert.equal(await page.$eval('#payslipAccountSelect', select => select.value), '00001234', 'Account filters must preserve leading zeros');
    await page.click('[data-filter-reset]');
    assert.equal(await page.$eval('#payslipCompanySelect', select => select.value), 'PEOPLE QUEST SDN BHD');
    await page.click('.standard-filter-apply');

    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => window.setTheme?.(value), theme);
      for (const width of [360, 390, 420]) {
        await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
        await assertNoHorizontalOverflow(page, `${theme} ${width}px page`);
        if (width === 390) {
          await page.screenshot({ path: path.join(__dirname, `payslip_purple_headers_${theme}.png`) });
          await page.$$eval('.payslip-section.is-expanded .payslip-section-toggle', toggles => toggles.forEach(toggle => toggle.click()));
          await new Promise(resolve => setTimeout(resolve, 320));
          await page.$eval('.payslip-section-label', label => label.scrollIntoView({ block: 'start' }));
          await page.screenshot({ path: path.join(__dirname, `payslip_purple_breakdown_${theme}.png`) });
        }
        await page.click('#payrollFilterTrigger');
        await assertNoHorizontalOverflow(page, `${theme} ${width}px filter`);
        if (width === 390) await page.screenshot({ path: path.join(__dirname, `payslip_five_filters_${theme}.png`) });
        await page.keyboard.press('Escape');
      }
    }

    assert.deepEqual(faults, [], 'Payslip must not emit runtime errors');
    console.log(JSON.stringify({ passed: true, checked: ['modern hierarchy', 'query period', 'accordion behavior', 'filter accessibility', 'legacy data', 'themes', 'responsive overflow'] }, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
