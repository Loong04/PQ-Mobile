const path = require('path');
const puppeteer = require('puppeteer');

const dashboardUrl = 'file://' + path.resolve(__dirname, '../modules/claims/index.html');

async function openBreakdown(page, scope, category) {
  await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ scope, category }) => {
    window.ClaimsEngine.switchClaimScope(scope);
    window.ClaimsEngine.toggleBreakdownCategory(scope, category);
  }, { scope, category });

  await page.click(`#scope${scope === 'team' ? 'Team' : 'Individual'}Section .btn-view-chart-pill`);
  await new Promise(resolve => setTimeout(resolve, 30));
  const animatedFromBottom = await page.evaluate(() => {
    const sheet = document.querySelector('.chart-breakdown-sheet');
    if (!sheet) return false;
    return new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42 > 0;
  });
  await new Promise(resolve => setTimeout(resolve, 320));

  return page.evaluate(animatedFromBottom => {
    const overlay = document.getElementById('chartBreakdownModalOverlay');
    const sheet = overlay?.querySelector('.chart-breakdown-sheet');
    const rows = [...document.querySelectorAll('.chart-breakdown-row')];
    return {
      stayedOnDashboard: location.pathname.endsWith('/modules/claims/index.html'),
      isOpen: overlay?.classList.contains('active') || false,
      title: document.getElementById('chartBreakdownTitle')?.textContent.trim() || '',
      context: document.getElementById('chartBreakdownContext')?.textContent.trim() || '',
      headers: [...document.querySelectorAll('.chart-breakdown-column')].map(el => el.textContent.trim()),
      rows: rows.map(row => row.textContent.replace(/\s+/g, ' ').trim()),
      sheetAlignedToBottom: sheet ? getComputedStyle(overlay).alignItems === 'flex-end' : false,
      hasDonutChart: Boolean(sheet?.querySelector('svg, canvas')),
      animatedFromBottom
    };
  }, animatedFromBottom);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 450, height: 950 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  try {
    const individualBenefits = await openBreakdown(page, 'individual', 'benefits');
    const individualClaims = await openBreakdown(page, 'individual', 'claims');
    const teamBenefits = await openBreakdown(page, 'team', 'benefits');
    const teamClaims = await openBreakdown(page, 'team', 'claims');

    const closeButtonExists = await page.evaluate(() => {
      const button = document.getElementById('chartBreakdownCloseButton');
      if (button) button.click();
      return Boolean(button);
    });
    await new Promise(resolve => setTimeout(resolve, 50));
    const closes = await page.evaluate(closeButtonExists =>
      closeButtonExists && !document.getElementById('chartBreakdownModalOverlay')?.classList.contains('active')
    , closeButtonExists);

    const commonChecks = result =>
      result.stayedOnDashboard &&
      result.isOpen &&
      result.title === 'Chart breakdown' &&
      JSON.stringify(result.headers) === JSON.stringify(['Category', 'Amount', 'Share']) &&
      result.sheetAlignedToBottom &&
      result.animatedFromBottom &&
      !result.hasDonutChart;

    const result = {
      individualBenefits,
      individualClaims,
      teamBenefits,
      teamClaims,
      closes,
      pageErrors
    };

    result.passed =
      commonChecks(individualBenefits) &&
      individualBenefits.context === 'Individual • Benefits' &&
      individualBenefits.rows.length === 6 &&
      individualBenefits.rows[0] === 'Consultation RM600 40%' &&
      commonChecks(individualClaims) &&
      individualClaims.context === 'Individual • Claims' &&
      individualClaims.rows.length === 5 &&
      individualClaims.rows[0] === 'Travel Mileage RM750 40.5%' &&
      commonChecks(teamBenefits) &&
      teamBenefits.context === 'Team • Benefits' &&
      teamBenefits.rows.length === 6 &&
      teamBenefits.rows[0] === 'Consultation RM3,000 42.3%' &&
      commonChecks(teamClaims) &&
      teamClaims.context === 'Team • Claims' &&
      teamClaims.rows.length === 5 &&
      teamClaims.rows[0] === 'Overseas Travel RM5,200 41.8%' &&
      closes &&
      pageErrors.length === 0;

    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
