const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'leave-baseline-audit-20261012');
const jobs = [
  ['Active Team page', 'team.html', ''],
  ['Team Tax Relief navigation', 'modules/payroll/options/tax-relief.html', ''],
  ['Project calendar timesheet detail', 'modules/project-task/index.html', "document.querySelector('.project-calendar-day[data-event-type=timesheet]').click();document.getElementById('projectCalendarDetails').click();"],
  ['Project Team pending task list', 'modules/project-task/index.html', "document.getElementById('projectTab-team').click();document.querySelector('#projectTeamProjectOverview tbody tr').click();"],
  ['Benefit balances', 'modules/claims/options/staff-entitlement.html', ''],
  ['Benefit period', 'modules/claims/options/benefit-highlight.html', "openBenefitDetailsModal('#EBB01','Sarah Jenkins');"],
  ['Expense period', 'modules/claims/options/expenses-highlight.html', "openExpenseDetailsModal('#004177','Marcus Tan');"],
  ['Leave period reference', 'leave.html', "showLeaveSection('viewLeaveHighlight');document.querySelector('#viewLeaveHighlight [onclick*=openLeaveHighlightDetailsModal]').click();"]
];
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  const rows = [];
  try {
    for (const [name,file,code] of jobs) {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('dialog', dialog => dialog.dismiss());
      await page.setViewport({ width: 390, height: 844 });
      await page.goto(pathToFileURL(path.join(root, file)).href + '?theme=dark', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 2500))]));
      await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation-duration:0s!important}' });
      if (code) await page.evaluate(code => (0,eval)(code), code);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const variants = [];
      for (const width of [360,420]) for (const theme of ['dark','light']) {
        await page.setViewport({ width, height: 844 });
        await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
        const data = await page.evaluate(() => {
          const take = node => { const s = getComputedStyle(node); const b=node.getBoundingClientRect(); return { id:node.id, cls:node.className, text:node.textContent.trim().slice(0,110), fontSize:s.fontSize, font:s.fontFamily, weight:s.fontWeight, radius:s.borderRadius, padding:s.padding, color:s.color, background:s.backgroundColor, width:b.width, height:b.height, scrollWidth:node.scrollWidth, clientWidth:node.clientWidth }; };
          const visible = node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden';
          return {
            body:take(document.body),
            definedPhoneNav:Boolean(customElements.get('phone-bottom-nav')),
            definedAppNav:Boolean(customElements.get('app-bottom-nav')),
            nav:[...document.querySelectorAll('phone-bottom-nav,app-bottom-nav,.bottom-nav,nav')].filter(visible).map(take),
            filters:[...document.querySelectorAll('#taxReliefFilterTrigger')].map(take),
            metrics:[...document.querySelectorAll('.entitlement-metric-value')].filter(visible).map(take),
            periods:[...document.querySelectorAll('.benefit-detail-period-value,.expense-detail-period-value,.leave-highlight-record-card > div:first-child, [class*=period-value]')].filter(visible).map(take),
            panels:[...document.querySelectorAll('[role=dialog]')].filter(visible).map(take),
            headers:[...document.querySelectorAll('[role=dialog] header,[role=dialog] h2,[role=dialog] button[aria-label*=Close]')].filter(visible).map(take),
            fontLoaded:document.fonts.check('700 13px "Plus Jakarta Sans"')
          };
        });
        variants.push({width,theme,...data});
      }
      await page.setViewport({ width:390,height:844 });
      await page.evaluate(() => document.documentElement.dataset.theme='dark');
      const screenshot='target-'+(rows.length+1)+'.png';
      await page.screenshot({path:path.join(out,screenshot)});
      rows.push({name,file,code,variants,screenshot,errors});
      await context.close();
    }
  } finally { await browser.close(); }
  await fs.writeFile(path.join(out,'targeted-observations.json'),JSON.stringify(rows,null,2));
  console.log(JSON.stringify(rows.map(row=>({name:row.name,errors:row.errors,nav:row.variants[0].nav.map(x=>({cls:x.cls,text:x.text,width:x.width,height:x.height})),undefinedAppNav:!row.variants[0].definedAppNav,overflowMetrics:row.variants[0].metrics.filter(x=>x.scrollWidth>x.clientWidth+1).slice(0,4),periods:row.variants[0].periods.slice(0,2),panels:row.variants[0].panels.map(x=>({cls:x.cls,radius:x.radius})),headers:row.variants[0].headers.map(x=>({text:x.text,fontSize:x.fontSize,height:x.height,width:x.width}))})),null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
