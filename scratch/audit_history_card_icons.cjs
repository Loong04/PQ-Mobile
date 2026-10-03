const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const jobs = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'scratch', '.agents', '.codex'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.html')) {
      const relative = path.relative(root, file).replaceAll('\\', '/');
      const source = fs.readFileSync(file, 'utf8');
      if (/history-card|history-item|change-history-item/.test(source) || /history\.html$/.test(relative)) {
        if (relative === 'leave.html') {
          for (const tab of ['leave', 'credit', 'offtime']) jobs.push({ file: relative, state: tab, code: `showLeaveSection('viewMyHistory'); switchHistoryTab('${tab}');` });
        } else if (relative === 'modules/claims/options/history.html') {
          for (const tab of ['benefit', 'medical', 'ot', 'travel', 'travelRequest', 'entertainment', 'advance', 'expense']) jobs.push({ file: relative, state: tab, code: `switchClaimTab('${tab}');` });
        } else if (relative === 'modules/payroll/options/history.html') {
          for (const tab of ['tax', 'deduction']) jobs.push({ file: relative, state: tab, search: '?category=' + tab });
        } else if (relative === 'modules/project-task/options/history.html') {
          for (const tab of ['workPlan', 'timesheet']) jobs.push({ file: relative, state: tab, code: `document.getElementById('historyTab-${tab}').click();` });
        } else if (/attendance\/options\/(history|clocking-history)\.html/.test(relative)) {
          for (const tab of ['clocking', 'ot', 'feedback']) jobs.push({ file: relative, state: tab, code: `switchMainTab('${tab}');` });
        } else jobs.push({ file: relative, state: 'all', code: relative === 'change-request.html' ? 'toggleHistoryModal(true);' : '' });
      }
    }
  }
}
walk(root);
jobs.push({ file: 'modules/payroll/options/prior-pay-data.html', state: 'all' });
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const results = [];
  let cursor = 0;
  try {
    await Promise.all(Array.from({ length: 3 }, async () => {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: 450, height: 950 });
      await page.setRequestInterception(true);
      page.on('request', req => /^(file:|data:|blob:|about:)/.test(req.url()) ? req.continue() : req.abort());
      while (cursor < jobs.length) {
        const job = jobs[cursor++];
        try {
          await page.goto(pathToFileURL(path.join(root, job.file)).href + (job.search || ''), { waitUntil: 'load' });
          if (job.file === 'modules/payroll/options/history.html') await page.waitForSelector('.history-card-main');
          if (job.file.includes('prior-pay-data')) await page.waitForSelector('.prior-record');
          if (job.code) await page.evaluate(code => eval(code), job.code);
          const cards = await page.evaluate(() => {
            const selector = '.history-card-item,.history-item-card,.project-history-card,.history-card,#historyOverlay .change-history-item,.main-content > .card[onclick*="attendanceDetailsModalOverlay"]';
            return [...document.querySelectorAll(selector)].map(card => {
              const title = card.querySelector('.history-card-title-row,.project-history-card-title-row,.history-time-row,.history-info,h3,h4') || (card.matches('.card') ? card.querySelector(':scope > div:first-child > div:first-child') : null);
              const heading = title?.textContent.replace(/\s+/g, ' ').trim() || '';
              return {
                heading,
                icons: title ? [...title.querySelectorAll('i,svg,img,[class*="type-icon"],.history-icon')].map(icon => icon.className) : [],
                emoji: /^\p{Extended_Pictographic}/u.test(heading),
                body: card.textContent.replace(/\s+/g, ' ').trim().replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, ''),
                actions: [...card.querySelectorAll('button,a')].map(button => button.textContent.trim()),
                status: card.dataset.status || ''
              };
            });
          });
          results.push({ file: job.file, state: job.state, cards });
        } catch (error) { results.push({ file: job.file, state: job.state, error: error.message }); }
      }
      await context.close();
    }));
  } finally { await browser.close(); }
  results.sort((a, b) => (a.file + a.state).localeCompare(b.file + b.state));
  const mode = process.argv[2] || 'before';
  fs.writeFileSync(path.join(__dirname, 'history-card-icons-' + mode + '.json'), JSON.stringify(results, null, 2));
  const offenders = results.flatMap(result => result.cards?.filter(card => card.icons.length || card.emoji).map(card => ({ file: result.file, state: result.state, heading: card.heading, icons: card.icons })) || []);
  const errors = results.filter(result => result.error);
  console.log(JSON.stringify({ views: results.length, pages: new Set(results.map(result => result.file)).size, cards: results.reduce((sum, result) => sum + (result.cards?.length || 0), 0), offenders: offenders.reduce((groups, item) => { groups[item.file] = (groups[item.file] || 0) + 1; return groups; }, {}), errors }, null, 2));
  if (mode === 'after') {
    const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'history-card-icons-before.json'), 'utf8'));
    const changed = results.filter((result, index) => JSON.stringify(result.cards?.map(({ body, actions, status }) => ({ body, actions, status }))) !== JSON.stringify(before[index].cards?.map(({ body, actions, status }) => ({ body, actions, status }))));
    console.log('Changed card content/actions/status: ' + changed.map(result => result.file + ':' + result.state).join(', '));
    if (offenders.length || errors.length || changed.length) process.exitCode = 1;
  }
})();
