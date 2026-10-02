const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const vm = require('node:vm');
const puppeteer = require('puppeteer');
(async () => {
  const files = ['css/project-task.css', 'js/project-task/project-task-app.js', 'modules/project-task/options/pending-approval.html'];
  const before = Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  new vm.Script(fs.readFileSync(files[1], 'utf8'));
  const browser = await puppeteer.launch({ headless: true });
  const result = { files: before, actions: [], pageErrors: [] };
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => result.pageErrors.push(error.message));
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(pathToFileURL(path.resolve(files[2])).href + '?theme=dark', { waitUntil: 'domcontentloaded' });
    for (const action of ['approve', 'resubmit', 'reject']) {
      const old = await page.$eval('.main-content', node => node.textContent);
      await page.click('[data-project-approval-action="' + action + '"]');
      result.actions.push({ action, changed: old !== await page.$eval('.main-content', node => node.textContent), visibleDialogs: await page.$$eval('[role="dialog"]', nodes => nodes.filter(node => node.getClientRects().length).length) });
    }
    await page.click('[data-project-approval-menu]');
    await page.click('#projectApprovalViewDetails');
    result.detailsOpen = await page.$eval('#projectApprovalDetails', node => !node.hidden);
    await page.click('#projectApprovalDetails [data-close-project-approval]');
    await page.click('[data-project-approval-menu]');
    await page.click('#projectApprovalViewWorkflow');
    result.workflowOpen = await page.$eval('#projectApprovalWorkflow', node => !node.hidden);
  } finally { await browser.close(); }
  result.stable = files.every(file => before[file] === crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
  fs.writeFileSync('scratch/app-consistency-project-current.json', JSON.stringify(result, null, 2));
  process.stdout.write(JSON.stringify(result, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
