const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const htmlFiles = [];

function collectHtml(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'scratch', 'no'].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectHtml(fullPath);
    else if (entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
}
collectHtml(root);

const filterPages = htmlFiles.filter(file => {
  const source = fs.readFileSync(file, 'utf8');
  return /current filter/i.test(source) || /class=["'][^"']*payroll-filter-trigger/.test(source);
});

(async () => {
  const browser = await puppeteer.launch({ headless: true, protocolTimeout: 60000 });
  const failures = [];
  let auditedCards = 0;

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 900 });

    for (const file of filterPages) {
      const relativePath = path.relative(root, file);
      try {
        await page.goto(pathToFileURL(file).href, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(() => typeof initStandardFilterSummaries === 'function', { timeout: 10000 });
        await page.evaluate(() => initStandardFilterSummaries());

        const audit = await page.evaluate(() => {
          const normalize = value => value.replace(/\\s+/g, ' ').trim().toLowerCase();
          const hasDuplicateLeftIcon = card => {
            const funnel = card.querySelector('.standard-filter-summary-value > .standard-filter-summary-icon.fa-filter');
            if (!funnel) return false;

            const value = funnel.parentElement;
            const extraInsideValue = value.querySelector(':scope > i:not(.standard-filter-summary-icon), :scope > svg');
            if (extraInsideValue) return true;

            const row = value.parentElement;
            if (!row) return false;
            return Array.from(row.children).some(element => {
              if (element === value || element.matches('button, [role="button"]')) return false;
              if (element.matches('i, svg')) return true;
              if (element.tagName !== 'SPAN' || element.id) return false;
              const glyph = element.textContent.replace(/\\s+/g, '');
              return glyph.length > 0 && glyph.length <= 3;
            });
          };
          const labels = Array.from(document.querySelectorAll('small, span, div'))
            .filter(element => normalize(element.textContent) === 'current filter');
          const labelCards = [...new Set(labels.map(label => label.closest('[data-standard-filter-summary="true"]')).filter(Boolean))];
          const payrollCards = Array.from(document.querySelectorAll('.payroll-filter-trigger'));
          const cards = [...new Set([
            ...document.querySelectorAll('[data-standard-filter-summary="true"]'),
            ...labelCards,
            ...payrollCards
          ])];

          return {
            exactLabels: labels.length,
            missingLabelCards: labels.filter(label => !label.closest('[data-standard-filter-summary="true"]')).length,
            cardCount: cards.length,
            missingFunnel: cards.filter(card => !card.querySelector('.standard-filter-summary-value > .standard-filter-summary-icon.fa-filter')).length,
            missingSliders: cards.filter(card => !card.querySelector('.standard-filter-summary-trigger-glyph.fa-sliders')).length,
            legacyCalendarIcons: cards.filter(card => card.querySelector('.standard-filter-summary-value > .fa-calendar-days')).length,
            duplicateLeftIcons: cards.filter(hasDuplicateLeftIcon).length
          };
        });

        if (audit.exactLabels > 0 || /payroll-filter-trigger/.test(fs.readFileSync(file, 'utf8'))) {
          assert.ok(audit.cardCount > 0, 'no normalized filter cards found');
        }
        assert.equal(audit.missingLabelCards, 0, `${audit.missingLabelCards} Current Filter labels were not normalized`);
        assert.equal(audit.missingFunnel, 0, `${audit.missingFunnel} filter cards are missing the left funnel icon`);
        assert.equal(audit.missingSliders, 0, `${audit.missingSliders} filter cards are missing the right sliders icon`);
        assert.equal(audit.legacyCalendarIcons, 0, 'legacy calendar icons remain in filter summaries');
        assert.equal(audit.duplicateLeftIcons, 0, `${audit.duplicateLeftIcons} filter cards show more than one left summary icon`);
        auditedCards += audit.cardCount;
      } catch (error) {
        failures.push(`${relativePath}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  assert.equal(failures.length, 0, failures.join('\n'));
  assert.ok(auditedCards >= 30, `Expected at least 30 filter cards, audited ${auditedCards}`);
  console.log(`PASS: Audited ${auditedCards} filter cards across ${filterPages.length} system pages.`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
