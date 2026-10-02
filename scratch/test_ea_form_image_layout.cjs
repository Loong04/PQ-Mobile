const assert = require('node:assert/strict');
const path = require('node:path');
const puppeteer = require('puppeteer');

function eaFormUrl() {
  const target = path.resolve(__dirname, '../modules/payroll/options/ea-form.html').replace(/\\/g, '/');
  return `file:///${target}`;
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => [
    document.documentElement,
    document.body,
    document.querySelector('.phone-container'),
    document.querySelector('.payroll-document-content')
  ].filter(Boolean).map(node => ({
    name: node === document.documentElement ? 'html' : node === document.body ? 'body' : node.className,
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth
  })).filter(item => item.scrollWidth > item.clientWidth + 1));
  assert.deepEqual(overflow, [], `${label} must not overflow horizontally`);
}

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const faults = [];
    page.on('pageerror', error => faults.push(error.message));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(eaFormUrl(), { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#eaFilterTrigger');

    const initial = await page.evaluate(() => {
      const preview = document.querySelector('#eaFormPreview');
      const action = document.querySelector('.ea-open-print-action');
      const actionStyle = action ? getComputedStyle(action) : null;
      return {
        hasPreview: Boolean(preview),
        previewLoaded: Boolean(preview?.complete && preview.naturalWidth > 0),
        previewAlt: preview?.getAttribute('alt') || '',
        legacyPartCount: document.querySelectorAll('[data-ea-part]').length,
        actionCount: document.querySelectorAll('.ea-open-print-action').length,
        actionText: action?.textContent.replace(/\s+/g, ' ').trim() || '',
        actionBackground: actionStyle?.backgroundImage || '',
        hasPrintIcon: Boolean(action?.querySelector('.fa-print')),
        hasDownloadAction: [...document.querySelectorAll('button')].some(button => button.textContent.includes('Download PDF')),
        filterSummary: document.querySelector('#eaFilterSummary')?.textContent.trim() || ''
      };
    });

    assert.equal(initial.hasPreview, true, 'EA page must render a document image preview');
    assert.equal(initial.previewLoaded, true, 'EA document preview image must load successfully');
    assert.equal(initial.previewAlt, 'EA form preview');
    assert.equal(initial.legacyPartCount, 0, 'EA page must not render the old A-F data-card breakdown');
    assert.equal(initial.actionCount, 1, 'EA page must expose one Open + Print primary action');
    assert.match(initial.actionText, /Open \+ Print/, 'Primary action must use the requested Open + Print label');
    assert.match(initial.actionBackground, /linear-gradient/, 'Open + Print must use the premium purple gradient treatment');
    assert.equal(initial.hasPrintIcon, true, 'Open + Print must include the print icon');
    assert.equal(initial.hasDownloadAction, false, 'EA page must not render a separate Download PDF action');
    assert.match(initial.filterSummary, /^2024\s*[·•]\s*T01 \(TAX\)$/);

    await page.click('#eaFilterTrigger');
    await page.waitForFunction(() => document.querySelector('#eaFilterModal')?.classList.contains('is-open'));
    const filter = await page.evaluate(() => ({
      labels: [...document.querySelectorAll('#eaFilterModal .payroll-filter-body label')].map(label => label.textContent.trim()),
      year: document.querySelector('#eaYearSelect')?.value || '',
      taxRelief: document.querySelector('#eaTaxReliefSelect')?.value || ''
    }));
    assert.deepEqual(filter.labels, ['Year', 'Tax Relief']);
    assert.equal(filter.year, '2024');
    assert.equal(filter.taxRelief, 'T01 (TAX)');
    await page.keyboard.press('Escape');

    for (const theme of ['dark', 'light']) {
      await page.evaluate(value => window.setTheme?.(value), theme);
      await assertNoHorizontalOverflow(page, `${theme} EA form`);
      await page.screenshot({ path: path.join(__dirname, `ea_form_image_${theme}.png`) });
    }

    await page.click('.ea-open-print-action');
    assert.deepEqual(faults, [], 'EA form must not emit runtime errors');
    console.log(JSON.stringify({ passed: true, checked: ['image preview', 'year and tax relief filter', 'Open + Print action', 'themes', 'responsive overflow'] }, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
