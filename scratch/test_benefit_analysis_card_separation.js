const path = require('path');
const puppeteer = require('puppeteer');

function inspectView(page, viewId, chartSelector, detailsSelector) {
  return page.evaluate(({ viewId, chartSelector, detailsSelector }) => {
    const view = document.getElementById(viewId);
    const chart = document.querySelector(chartSelector);
    const details = document.querySelector(detailsSelector);
    const directCard = element => {
      let current = element;
      while (current && current.parentElement !== view) current = current.parentElement;
      return current;
    };
    const chartCard = directCard(chart);
    const detailsCard = directCard(details);

    return {
      directCardCount: view ? view.children.length : 0,
      chartAndDetailsAreSeparate: Boolean(chartCard && detailsCard && chartCard !== detailsCard),
      chartCardContainsDetails: Boolean(chartCard && details && chartCard.contains(details)),
      detailsCardContainsChart: Boolean(detailsCard && chart && detailsCard.contains(chart))
    };
  }, { viewId, chartSelector, detailsSelector });
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
    const url = 'file://' + path.resolve(__dirname, '../modules/claims/options/benefit-highlight.html');
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      showBenefitSection('chart');
      renderBenefitChart('category');
    });
    const categoryAnalysis = await inspectView(
      page,
      'viewBenefitHighlightChart',
      '#highlightDonutSvg',
      '#benefitChartLegendGrid'
    );
    const categoryFilter = await page.evaluate(() => {
      const view = document.getElementById('viewBenefitHighlightChart');
      const select = document.getElementById('highlightChartMetricSelect');
      let card = select;
      while (card && card.parentElement !== view) card = card.parentElement;
      return {
        label: card?.querySelector('label')?.textContent.trim() || '',
        selectedValue: select?.value || '',
        hasShareDescription: /share of/i.test(card?.textContent || '')
      };
    });

    await page.evaluate(() => openAnalysis('Dec 2025', 'RM 8,200'));
    const staffAnalysis = await inspectView(
      page,
      'viewBenefitAnalysis',
      '#benefitAnalysisDonutSvg',
      '#benefitAnalysisLegendList'
    );

    const analysisFilter = await page.evaluate(() => {
      const filterCard = document.getElementById('benefitAnalysisBreakdownCard');
      const select = document.getElementById('benefitAnalysisMetricSelect');
      return {
        exists: Boolean(filterCard && select),
        label: filterCard?.querySelector('label')?.textContent.trim() || '',
        selectedValue: select?.value || '',
        optionLabels: select ? [...select.options].map(option => option.textContent.trim()) : [],
        hasShareDescription: /share of/i.test(filterCard?.textContent || ''),
        initialTitle: document.getElementById('benefitAnalysisTitle')?.textContent.trim() || '',
        initialColumn: document.getElementById('benefitAnalysisColumnHeaderKey')?.textContent.trim() || '',
        initialFirstDetail: document.getElementById('benefitAnalysisLegendList')?.firstElementChild?.textContent.replace(/\s+/g, ' ').trim() || ''
      };
    });

    let branchSelection = null;
    if (analysisFilter.exists) {
      await page.select('#benefitAnalysisMetricSelect', 'branch');
      branchSelection = await page.evaluate(() => ({
        selectedValue: document.getElementById('benefitAnalysisMetricSelect')?.value || '',
        title: document.getElementById('benefitAnalysisTitle')?.textContent.trim() || '',
        column: document.getElementById('benefitAnalysisColumnHeaderKey')?.textContent.trim() || '',
        firstDetail: document.getElementById('benefitAnalysisLegendList')?.firstElementChild?.textContent.replace(/\s+/g, ' ').trim() || ''
      }));
    }

    const result = { categoryAnalysis, categoryFilter, staffAnalysis, analysisFilter, branchSelection, pageErrors };
    result.passed =
      categoryAnalysis.chartAndDetailsAreSeparate &&
      !categoryAnalysis.chartCardContainsDetails &&
      !categoryAnalysis.detailsCardContainsChart &&
      categoryFilter.label === 'BREAKDOWN BY' &&
      categoryFilter.selectedValue === 'category' &&
      !categoryFilter.hasShareDescription &&
      staffAnalysis.chartAndDetailsAreSeparate &&
      !staffAnalysis.chartCardContainsDetails &&
      !staffAnalysis.detailsCardContainsChart &&
      analysisFilter.exists &&
      analysisFilter.label === 'BREAKDOWN BY' &&
      analysisFilter.selectedValue === 'category' &&
      JSON.stringify(analysisFilter.optionLabels) === JSON.stringify([
        'Benefit Category',
        'Branch',
        'Department',
        'Section',
        'Grade',
        'Supervisor'
      ]) &&
      !analysisFilter.hasShareDescription &&
      analysisFilter.initialTitle === 'Benefit Spend by Category' &&
      analysisFilter.initialColumn === 'CATEGORY' &&
      analysisFilter.initialFirstDetail.includes('Car Maintenance') &&
      branchSelection?.selectedValue === 'branch' &&
      branchSelection?.title === 'Benefit Spend by Branch' &&
      branchSelection?.column === 'BRANCH' &&
      branchSelection?.firstDetail.includes('Headquarters (HQ)') &&
      pageErrors.length === 0;

    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
