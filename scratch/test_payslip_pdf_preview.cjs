const assert = require('assert');
const path = require('path');
const puppeteer = require('puppeteer');

function fileUrl(relativePath) {
  return `file:///${path.resolve(__dirname, relativePath).replace(/\\/g, '/')}`;
}

async function openPreview(page) {
  await page.click('#payslipPdfTrigger');
  await page.waitForFunction(() => document.querySelector('#payslipPdfModal')?.classList.contains('is-open'));
}

async function previewState(page) {
  return page.evaluate(() => {
    const modal = document.querySelector('#payslipPdfModal');
    const panel = document.querySelector('.payslip-pdf-dialog');
    const pageSheet = document.querySelector('.payslip-pdf-page');
    const panelRect = panel?.getBoundingClientRect();
    const phoneRect = document.querySelector('.phone-container')?.getBoundingClientRect();
    const visibleActions = [...modal.querySelectorAll('button')]
      .filter(button => button.getClientRects().length)
      .map(button => button.textContent.replace(/\s+/g, ' ').trim());
    return {
      isOpen: modal?.classList.contains('is-open') || false,
      ariaHidden: modal?.getAttribute('aria-hidden'),
      title: document.querySelector('#payslipPdfTitle')?.textContent.trim(),
      fileName: document.querySelector('#payslipPdfFileName')?.textContent.trim(),
      period: document.querySelector('#payslipPdfPeriod')?.textContent.trim(),
      netPay: document.querySelector('#payslipPdfNetPay')?.textContent.trim(),
      activeElement: document.activeElement?.id,
      visibleActions,
      pageBackground: pageSheet ? getComputedStyle(pageSheet).backgroundColor : '',
      panelWithinPhone: !!panelRect && !!phoneRect
        && panelRect.left >= phoneRect.left
        && panelRect.right <= phoneRect.right
        && panelRect.top >= phoneRect.top
        && panelRect.bottom <= phoneRect.bottom,
      bodyInert: [...document.querySelectorAll('.phone-container > :not(#payslipPdfModal)')]
        .every(node => node.inert)
    };
  });
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
    await page.goto(fileUrl('../modules/payroll/options/payslip.html'), { waitUntil: 'domcontentloaded' });

    const trigger = await page.evaluate(() => ({
      text: document.querySelector('#payslipPdfTrigger')?.textContent.replace(/\s+/g, ' ').trim(),
      hasPdfIcon: !!document.querySelector('#payslipPdfTrigger .fa-file-pdf'),
      modalHidden: document.querySelector('#payslipPdfModal')?.getAttribute('aria-hidden')
    }));
    assert.equal(trigger.text, 'View Payslip PDF');
    assert.equal(trigger.hasPdfIcon, true);
    assert.equal(trigger.modalHidden, 'true');

    await openPreview(page);
    const darkState = await previewState(page);
    assert.equal(darkState.isOpen, true);
    assert.equal(darkState.ariaHidden, 'false');
    assert.equal(darkState.title, 'Payslip PDF');
    assert.equal(darkState.fileName, 'Payslip_Dec_2025_Farhan_Binti_Rahmat.pdf');
    assert.equal(darkState.period, 'December 2025');
    assert.equal(darkState.netPay, 'RM 8,895.15');
    assert.equal(darkState.activeElement, 'payslipPdfClose');
    assert.equal(darkState.visibleActions.some(action => /print|download/i.test(action)), false);
    assert.equal(darkState.panelWithinPhone, true);
    assert.equal(darkState.bodyInert, true);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#payslipPdfModal')?.classList.contains('is-open'));

    await page.click('#payrollFilterTrigger');
    await page.select('#payslipPeriodSelect', '2026-09');
    await page.click('#payslipFilterModal .standard-filter-apply');
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await openPreview(page);
    const lightState = await previewState(page);
    assert.equal(lightState.fileName, 'Payslip_Sep_2026_Sarah_Jenkins.pdf');
    assert.equal(lightState.period, 'September 2026');
    assert.equal(lightState.netPay, 'RM 6,482.50');
    assert.equal(lightState.pageBackground, 'rgb(255, 255, 255)');
    assert.equal(lightState.visibleActions.some(action => /print|download/i.test(action)), false);
    assert.equal(lightState.panelWithinPhone, true);
    assert.deepEqual(pageErrors, []);
    console.log('PASS: Payslip PDF preview button, current-period document, modal accessibility, themes and mobile layout.');
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
