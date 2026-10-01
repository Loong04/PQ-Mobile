const path = require('path');
const puppeteer = require('puppeteer');

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
    const url = 'file://' + path.resolve(__dirname, '../leave.html');
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const result = await page.evaluate(() => {
      const visible = id => {
        const element = document.getElementById(id);
        return Boolean(element && getComputedStyle(element).display !== 'none');
      };

      showLeaveSection('viewLeaveHighlight');
      const viewChartButton = [...document.querySelectorAll('#viewLeaveHighlight button')]
        .find(button => button.textContent.replace(/\s+/g, ' ').trim() === 'View Chart');
      viewChartButton?.click();
      const chartStep = {
        visible: visible('viewLeaveHighlightChart'),
        title: document.getElementById('headerTitleText')?.textContent.trim() || ''
      };

      const viewTrendButton = [...document.querySelectorAll('#viewLeaveHighlightChart button')]
        .find(button => /View Trend/.test(button.textContent));
      viewTrendButton?.click();
      const trendStep = {
        visible: visible('viewLeaveHighlightTrend'),
        title: document.getElementById('headerTitleText')?.textContent.trim() || ''
      };

      const firstBar = document.querySelector('#viewLeaveHighlightTrend [data-leave-trend-bar]');
      firstBar?.click();
      const analysis = document.getElementById('viewLeaveHighlightAnalysis');
      const selector = document.getElementById('leaveAnalysisMetricSelect');
      const analysisStep = {
        barExists: Boolean(firstBar),
        visible: visible('viewLeaveHighlightAnalysis'),
        title: document.getElementById('headerTitleText')?.textContent.trim() || '',
        directCardCount: analysis?.children.length || 0,
        selectorLabel: analysis?.querySelector('label')?.textContent.trim() || '',
        selectorValue: selector?.value || '',
        hasDonut: Boolean(document.getElementById('leaveAnalysisDonutSvg')),
        hasDetails: Boolean(document.getElementById('leaveAnalysisLegendList')),
        selectedPeriod: document.getElementById('leaveAnalysisSubtitle')?.textContent.trim() || '',
        selectedTotal: document.getElementById('leaveAnalysisCenterTotal')?.textContent.trim() || '',
        legacyOverlayVisible: visible('highlightTrendModalOverlay')
      };

      document.getElementById('headerBackButton')?.click();
      const backStep = {
        trendVisible: visible('viewLeaveHighlightTrend'),
        title: document.getElementById('headerTitleText')?.textContent.trim() || ''
      };

      return { chartStep, trendStep, analysisStep, backStep };
    });

    result.pageErrors = pageErrors;
    result.passed =
      result.chartStep.visible &&
      result.chartStep.title === 'Leave Days Analysis' &&
      result.trendStep.visible &&
      result.trendStep.title === 'Leave Days Trend Analysis' &&
      result.analysisStep.barExists &&
      result.analysisStep.visible &&
      result.analysisStep.title === 'Leave Days Analysis' &&
      result.analysisStep.directCardCount === 3 &&
      result.analysisStep.selectorLabel === 'BREAKDOWN BY' &&
      result.analysisStep.selectorValue === 'branch' &&
      result.analysisStep.hasDonut &&
      result.analysisStep.hasDetails &&
      result.analysisStep.selectedPeriod === 'As At Oct 2025' &&
      result.analysisStep.selectedTotal === '84.00' &&
      !result.analysisStep.legacyOverlayVisible &&
      result.backStep.trendVisible &&
      result.backStep.title === 'Leave Days Trend Analysis' &&
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
