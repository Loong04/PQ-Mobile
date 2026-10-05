const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    const root = path.resolve(__dirname, '..');
    if (process.argv.includes('--forms')) {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      for (const theme of ['light', 'dark']) {
        await page.setViewport({ width: 600, height: 1000, deviceScaleFactor: 1 });
        await page.goto(pathToFileURL(path.join(root, 'modules/project-task/options/work-plan.html')).href + `?theme=${theme}`, { waitUntil: 'networkidle0' });
        const measure = async selectors => page.evaluate(selectors => selectors.map(selector => {
          const node = document.querySelector(selector);
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return { selector, width: rect.width, height: rect.height, radius: style.borderRadius, font: style.fontSize, weight: style.fontWeight, color: style.color, padding: style.padding, background: style.backgroundImage };
        }), selectors);
        console.log(JSON.stringify({ reference: 'Work Plan', theme, styles: await measure(['.field-label', '.form-ctrl', '.project-upload-icon', '.form-cancel-btn', '.btn-submit-primary']) }));
        for (const name of ['feedback', 'whereabout']) {
          await page.goto(pathToFileURL(path.join(root, `modules/employee-career/options/individual/${name}.html`)).href + `?theme=${theme}`, { waitUntil: 'networkidle0' });
          await page.evaluate(() => document.fonts.ready);
          console.log(JSON.stringify({ form: name, theme, styles: await measure(['.employee-career-field label', '.employee-career-control', '.form-cancel-btn', '.employee-career-button.primary', ...(name === 'feedback' ? ['.employee-career-upload-icon'] : [])]) }));
          await page.screenshot({ path: path.join(__dirname, `employee_career_${name}_${theme}_top.png`) });
          await page.evaluate(() => { const main = document.querySelector('.main-content'); main.scrollTop = main.scrollHeight; });
          await page.screenshot({ path: path.join(__dirname, `employee_career_${name}_${theme}_bottom.png`) });
          for (const width of [360, 390, 450]) {
            await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
            console.log(JSON.stringify({ form: name, theme, width, layout: await page.evaluate(() => {
              const main = document.querySelector('.main-content');
              main.scrollTop = main.scrollHeight;
              const submit = document.querySelector('[type="submit"]').getBoundingClientRect();
              const nav = document.querySelector('phone-bottom-nav').getBoundingClientRect();
              return {
                overflow: main.scrollWidth - main.clientWidth,
                fieldsFit: [...document.querySelectorAll('.employee-career-control')].every(node => node.scrollWidth <= node.clientWidth + 1),
                actionsOutsideCard: !document.querySelector('.employee-career-form-card .employee-career-form-actions'),
                submitVisible: submit.bottom <= nav.top && submit.top >= main.getBoundingClientRect().top
              };
            }) }));
          }
          await page.setViewport({ width: 600, height: 1000, deviceScaleFactor: 1 });
        }
      }
      console.log(JSON.stringify({ pageErrors: errors }));
      return;
    }
    const definitions = [
      ['leave.html', ['#viewLeaveHub .view-mode-switcher', '#tabHubIndividual', '.leave-dashboard-quick-title', '.leave-dashboard-quick-card', '.leave-dashboard-quick-icon', '.leave-dashboard-quick-label']],
      ['modules/employee-career/index.html', ['.employee-career-scope', '.employee-career-scope-tab.active', '#employeeCareerQuickTitle', '.employee-career-option', '.employee-career-option-icon', '.employee-career-option-title']]
    ];
    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 600, height: 1000, deviceScaleFactor: 1 });
      for (const [file, selectors] of definitions) {
        await page.goto(pathToFileURL(path.join(root, file)).href + `?theme=${theme}`, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);
        console.log(JSON.stringify({ file, theme, dimensions: await page.evaluate(selectors => selectors.map(selector => {
          const node = document.querySelector(selector);
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return { selector, width: rect.width, height: rect.height, radius: style.borderRadius, font: style.fontSize, padding: style.padding, gap: style.gap, background: style.backgroundImage };
        }), selectors) }));
        if (file.includes('employee-career')) {
          await page.screenshot({ path: path.join(__dirname, `employee_career_individual_${theme}.png`) });
          await page.click('#employeeCareerTabTeam');
          await page.screenshot({ path: path.join(__dirname, `employee_career_team_${theme}.png`) });
          for (const width of [360, 390, 450]) {
            await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
            console.log(JSON.stringify({ theme, width, cards: await page.$$eval('#employeeCareerOptions .employee-career-option', nodes => nodes.map(node => {
              const rect = node.getBoundingClientRect();
              const title = node.querySelector('.employee-career-option-title');
              return { title: title.textContent, height: rect.height, fits: title.scrollWidth <= title.clientWidth && title.getBoundingClientRect().bottom <= rect.bottom };
            })) }));
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
