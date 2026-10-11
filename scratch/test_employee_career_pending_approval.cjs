const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const fixtures = [
  { id: 'TEST-001', employeeName: 'Approval Test Employee', empNo: 'TEST01', position: 'Test Position', type: 'Feedback', submitDate: '2026-10-10', status: 'pending', summary: [['Title', 'Test feedback']], details: [['Remarks', 'Test request details']], workflow: [{ title: 'Manager Approval', name: 'Test Manager', empNo: 'TEST99', status: 'Pending' }], audit: [{ title: 'Request Submitted', date: '2026-10-10', description: 'Submitted for review' }] },
  { id: 'TEST-002', employeeName: 'Second Test Employee', empNo: 'TEST02', type: 'Whereabout', submitDate: '2026-10-09', status: 'pending', details: [['Location', 'Test Office']] }
];

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: 1000 });
      const dashboard = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/index.html')).href;
      await page.goto(`${dashboard}?scope=team&theme=${theme}`, { waitUntil: 'domcontentloaded' });
      const target = await page.$eval('#employeeCareerPendingApproval', node => node.href);
      await page.goto(target, { waitUntil: 'domcontentloaded' }).catch(error => assert.fail(`Pending Approval needs a working independent page: ${error.message}`));
      assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Pending Approval');
      assert.equal(await page.$eval('#careerPendingCount', node => node.textContent), '0', 'No fabricated approval data');
      assert.equal(await page.$eval('#careerPendingSelectAll', node => node.disabled), true);
      assert.equal(await page.$eval('#careerPendingEmpty', node => node.hidden), false);
      await page.click('#careerPendingFilterTrigger');
      await page.waitForSelector('#careerPendingFilter', { visible: true });
      assert.deepEqual(await page.$$eval('#careerPendingFilter label', nodes => nodes.map(node => node.textContent.trim())), ['Search keyword', 'Start date', 'End date', 'Outstanding days', 'Min days', 'Max days']);
      await page.$eval('#careerPendingFilter-startDate', node => { node.value = '2026-10-15'; });
      await page.$eval('#careerPendingFilter-endDate', node => { node.value = '2026-10-10'; });
      await page.click('#careerPendingFilter [type="submit"]');
      assert.equal(await page.$eval('#careerPendingFilter .approval-filter-error', node => node.hidden), false);
      await page.click('#careerPendingFilter [data-action="reset"]');
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-pending-empty-${theme}-${width}.png`) });
      await page.click('#careerPendingBack');
      await page.waitForSelector('#employeeCareerTabTeam');
      assert.equal(new URL(page.url()).searchParams.get('scope'), 'team');
      assert.equal(new URL(page.url()).searchParams.get('theme'), theme);

      // Controlled data exercises the real UI without adding records to the product.
      await page.setRequestInterception(true);
      page.on('request', request => {
        if (request.url().split('?')[0].endsWith('/employee-career-pending-data.js')) return request.respond({ status: 200, contentType: 'application/javascript', body: `window.EMPLOYEE_CAREER_PENDING_DATA = ${JSON.stringify(fixtures)}; window.EMPLOYEE_CAREER_BACKUP_APPROVERS = [{name:'Test Backup',empNo:'TEST88',role:'Manager'}];` });
        return request.continue();
      });
      await page.goto(target, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#careerPendingCount', node => node.textContent), '2');
      assert.ok(await page.$$eval('.approval-request-card .payroll-employee-copy', nodes => nodes.every(node => {
        const name = node.querySelector('.employee-name');
        const id = node.querySelector('.employee-id');
        return id.textContent.startsWith('#') && id.getBoundingClientRect().top >= name.getBoundingClientRect().bottom - 1;
      })));
      assert.deepEqual(await page.$$eval('.approval-request-card:first-child [data-career-approval-action]', nodes => nodes.map(node => node.textContent.trim())), ['Approve', 'Backup', 'Resubmit', 'Reject']);
      await page.click('#careerPendingSelectAll');
      assert.equal(await page.$eval('#careerPendingSelectedCount', node => node.textContent), '2');
      await page.click('[data-career-pending-tab="Feedback"]');
      assert.equal(await page.$eval('#careerPendingCount', node => node.textContent), '1');
      assert.equal(await page.$eval('#careerPendingSelectedCount', node => node.textContent), '1', 'Filtering clears hidden selections');
      await page.click('.approval-request-card [data-career-approval-action="backup"]');
      await page.waitForSelector('#careerPendingBackup', { visible: true });
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.careerApprovalAction), 'backup', 'Closing Backup restores focus to its trigger');
      await page.click('.three-dots-btn');
      await page.waitForSelector('#careerPendingMenu', { visible: true });
      await page.click('#careerPendingViewWorkflow');
      await page.waitForSelector('#careerPendingWorkflow', { visible: true });
      assert.ok(await page.$eval('#careerPendingWorkflowSteps', node => node.textContent.includes('Manager Approval')));
      await page.keyboard.press('Escape');
      await page.click('.three-dots-btn');
      await page.click('#careerPendingViewDetails');
      await page.waitForSelector('#careerPendingDetails', { visible: true });
      assert.ok(await page.$eval('#careerPendingDetailsTable', node => node.textContent.includes('Test request details')));
      await page.type('#careerPendingComments', 'Reviewed in test');
      await page.click('#careerPendingDetails [data-career-approval-action="backup"]');
      await page.waitForSelector('#careerPendingBackup', { visible: true });
      await page.click('[data-career-backup-index="0"]');
      assert.ok(await page.$eval('.approval-request-card', node => node.textContent.includes('Test Backup')));
      assert.equal(await page.evaluate(() => document.activeElement.classList.contains('three-dots-btn')), true, 'Assigning Backup preserves focus on the refreshed request');
      await page.click('.approval-request-card [data-career-approval-action="approve"]');
      assert.equal(await page.$eval('#careerPendingCount', node => node.textContent), '0');
      await page.click('[data-career-pending-tab=""]');
      assert.equal(await page.$eval('#careerPendingCount', node => node.textContent), '1');
      await page.click('#careerPendingSelectAll');
      await page.click('#careerPendingBulk [data-career-bulk-action="reject"]');
      assert.equal(await page.$eval('#careerPendingCount', node => node.textContent), '0');
      assert.equal(await page.$eval('#careerPendingBulk', node => node.hidden), true);
      assert.equal(await page.$eval('#careerPendingSelectAll', node => node.disabled), true);
      assert.ok(await page.$eval('main', node => node.scrollWidth <= node.clientWidth));
      assert.deepEqual(errors, []);
      console.log(`PASS ${theme} ${width}: empty data, filter validation, Team return, card/menu/workflow, backup and single/bulk decisions`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
