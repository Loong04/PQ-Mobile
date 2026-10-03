const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};
const near = (actual, expected, tolerance = 0.6) => Math.abs(actual - expected) <= tolerance;

const dashboards = [
  {
    name: 'Attendance',
    file: 'modules/attendance/index.html',
    title: '.cal-top-header h1',
    subtitle: '.cal-top-header h1 + div',
    tabs: '.view-mode-switcher',
    activeTab: '.view-mode-tab.active',
    statusTitle: '#attendanceWorkStatusTitle',
    statusCards: '.work-status-card',
    quickTitle: '.attendance-quick-title',
    quickGrid: '.attendance-quick-grid',
    quickCards: '.attendance-quick-card',
    quickIcons: '.attendance-quick-icon',
    quickCount: 5
  },
  {
    name: 'Claims',
    file: 'modules/claims/index.html',
    title: '#globalTopTitle',
    subtitle: '#headerSubtitleText',
    tabs: '#mainScopeSwitcher',
    activeTab: '#tabClaimIndividual',
    statusTitle: '#claimWorkStatusTitle',
    statusCards: '#scopeIndividualSection .work-status-card',
    quickTitle: '#claimQuickOptionsTitle',
    quickGrid: '#claimOptionsHubGrid',
    quickCards: '#claimOptionsHubGrid > .claim-square-card',
    quickIcons: '#claimOptionsHubGrid .claim-square-icon-wrap',
    quickCount: 6
  },
  {
    name: 'Leave',
    file: 'leave.html',
    title: '#headerTitleText',
    subtitle: '#headerSubtitleText',
    tabs: '#viewLeaveHub .view-mode-switcher',
    activeTab: '#tabHubIndividual',
    statusTitle: '#leaveWorkStatusTitle',
    statusCards: '#hubSectionIndividual .work-status-card',
    quickTitle: '.leave-dashboard-quick-title',
    quickGrid: '.leave-dashboard-quick-grid',
    quickCards: '.leave-dashboard-quick-card',
    quickIcons: '.leave-dashboard-quick-icon',
    quickCount: 4
  },
  {
    name: 'Payroll',
    file: 'modules/payroll/index.html',
    title: '#globalTopTitle',
    subtitle: '#headerSubtitleText',
    tabs: '#mainScopeSwitcher',
    activeTab: '#tabPayrollIndividual',
    statusTitle: '#myWorkStatusTitle',
    statusCards: '#scopeIndividualSection .request-metric',
    quickTitle: '.payroll-quick-options-heading',
    quickGrid: '#individualPayrollOptionsGrid',
    quickCards: '#individualPayrollOptionsGrid > .payroll-option-card',
    quickIcons: '#individualPayrollOptionsGrid .opt-icon-wrap',
    quickCount: 6
  },
  {
    name: 'Project & Task',
    file: 'modules/project-task/index.html',
    title: '.project-header h1',
    subtitle: '.project-header-scope',
    tabs: '.project-scope-tabs',
    activeTab: '#projectTab-individual',
    statusTitle: '#projectWorkStatusTitle',
    statusCards: '#projectPanel-individual .project-dashboard-status-card',
    quickTitle: '#projectQuickOptionsTitle',
    quickGrid: '#projectPanel-individual .project-dashboard-quick-grid',
    quickCards: '#projectPanel-individual .project-option',
    quickIcons: '#projectPanel-individual .project-option-icon',
    quickCount: 3
  }
];

const styleOf = (element) => {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    text: element.textContent.replace(/\s+/g, ' ').trim(),
    width: rect.width,
    height: rect.height,
    fontSize: parseFloat(style.fontSize),
    fontWeight: style.fontWeight,
    marginBottom: parseFloat(style.marginBottom),
    paddingTop: parseFloat(style.paddingTop),
    paddingRight: parseFloat(style.paddingRight),
    radius: parseFloat(style.borderTopLeftRadius),
    gap: parseFloat(style.gap),
    backgroundImage: style.backgroundImage
  };
};

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    for (const dashboard of dashboards) {
      const page = await browser.newPage();
      await page.setViewport({ width: 600, height: 1000, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(path.join(root, dashboard.file)).href + '?theme=dark', {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      await new Promise(resolve => setTimeout(resolve, 250));

      const result = await page.evaluate((dashboard, styleSource) => {
        const styleOf = new Function('element', `return (${styleSource})(element)`);
        const one = selector => {
          const element = document.querySelector(selector);
          return element ? styleOf(element) : null;
        };
        const many = selector => [...document.querySelectorAll(selector)].map(styleOf);
        return {
          title: one(dashboard.title),
          subtitle: one(dashboard.subtitle),
          tabs: one(dashboard.tabs),
          activeTab: one(dashboard.activeTab),
          statusTitle: one(dashboard.statusTitle),
          statusCards: many(dashboard.statusCards),
          quickTitle: one(dashboard.quickTitle),
          quickGrid: one(dashboard.quickGrid),
          quickCards: many(dashboard.quickCards),
          quickIcons: many(dashboard.quickIcons)
        };
      }, dashboard, styleOf.toString());

      expect(result.title?.fontSize === 17, `${dashboard.name}: header title must be 17px`);
      expect(result.subtitle?.text === 'Individual', `${dashboard.name}: header subtitle must show Individual`);
      expect(result.subtitle?.fontSize === 12, `${dashboard.name}: header subtitle must be 12px`);
      expect(near(result.tabs?.width || 0, 384), `${dashboard.name}: scope tabs must be 384px wide`);
      expect(near(result.tabs?.height || 0, 47), `${dashboard.name}: scope tabs must be 47px high`);
      expect(result.tabs?.radius === 20, `${dashboard.name}: scope tabs must use a 20px radius`);
      expect(result.activeTab?.radius === 16, `${dashboard.name}: active tab must use a 16px radius`);
      expect(result.activeTab?.backgroundImage.includes('linear-gradient'), `${dashboard.name}: active tab must use the purple gradient`);

      expect(result.statusTitle?.fontSize === 11.5, `${dashboard.name}: status heading must be 11.5px`);
      expect(result.statusTitle?.marginBottom === 10, `${dashboard.name}: status heading spacing must be 10px`);
      expect(result.statusCards.length === 3, `${dashboard.name}: must show three status cards`);
      for (const card of result.statusCards) {
        expect(near(card.height, 80), `${dashboard.name}: status cards must be 80px high`);
        expect(card.radius === 16, `${dashboard.name}: status cards must use a 16px radius`);
        expect(card.paddingTop === 6 && card.paddingRight === 8, `${dashboard.name}: status card padding must be 6px 8px`);
      }

      expect(result.quickTitle?.fontSize === 11.5, `${dashboard.name}: Quick Options heading must be 11.5px`);
      expect(result.quickTitle?.marginBottom === 10, `${dashboard.name}: Quick Options heading spacing must be 10px`);
      expect(near(result.quickGrid?.width || 0, 384), `${dashboard.name}: Quick Options grid must be 384px wide`);
      expect(result.quickGrid?.gap === 10, `${dashboard.name}: Quick Options grid gap must be 10px`);
      expect(result.quickCards.length === dashboard.quickCount, `${dashboard.name}: Quick Options count changed`);
      for (const card of result.quickCards) {
        expect(card.height >= 90, `${dashboard.name}: Quick Options cards must be at least 90px high`);
        expect(card.radius === 16, `${dashboard.name}: Quick Options cards must use a 16px radius`);
        expect(card.paddingTop === 14 && card.paddingRight === 6, `${dashboard.name}: Quick Options card padding must be 14px 6px`);
      }
      for (const icon of result.quickIcons) {
        expect(near(icon.width, 38) && near(icon.height, 38), `${dashboard.name}: Quick Options icons must be 38px square`);
      }

      if (dashboard.name === 'Attendance') {
        expect(result.statusCards[0].text.startsWith('2 Submitted'), 'Attendance: first status must read Submitted');
      }
      if (dashboard.name === 'Payroll') {
        expect(result.statusCards[1].text.endsWith('Confirmed'), 'Payroll: approved helper must read Confirmed');
        expect(result.statusCards[2].text.endsWith('Declined'), 'Payroll: rejected helper must read Declined');
      }
      await page.close();
    }

    const appJs = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
    expect(appJs.includes("'apply_leave': 'leave.html'"), 'Apply Leave route must use the unified dashboard');
    expect(appJs.includes("'leave_holidays': 'leave.html'"), 'Leave & Holidays route must use the unified dashboard');
    console.log('All Individual dashboard consistency checks passed.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
