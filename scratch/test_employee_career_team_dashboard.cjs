const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: 1000 });
      const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/index.html')).href;
      await page.goto(`${url}?scope=team&theme=${theme}`, { waitUntil: 'domcontentloaded' });
      assert.ok(await page.$('#employeeCareerTeamActions .team-pending-approval-action'), 'Team needs the shared Pending Approval action');
      assert.deepEqual(await page.$$eval('main > [data-career-scope="team"], main > .employee-career-quick', nodes => nodes.map(node => node.id)), ['employeeCareerTeamActions', 'employeeCareerQuickOptions', 'employeeCareerHeadcountActions', 'employeeCareerStaffEvents']);
      assert.equal(await page.$eval('#employeeCareerDocumentStatus', node => node.hidden), true);
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.hidden), true);
      assert.equal(await page.$$eval('#employeeCareerOptions .employee-career-option', nodes => nodes.length), 6);
      await page.click('[data-action="view-all"]');
      await page.waitForFunction(() => document.activeElement.id === 'employeeCareerCloseAll');
      assert.equal(await page.$$eval('#employeeCareerAllOptionsGrid .employee-career-option', nodes => nodes.length), 13);
      await page.keyboard.press('Escape');

      for (const [id, text] of [['employeeCareerActiveHeadcount', 'Active Headcount'], ['employeeCareerVacantPosition', 'Vacant Position']]) {
        const before = page.url();
        await page.click(`#${id}`);
        assert.equal(page.url(), before, `${text} displays a toast without navigation`);
        assert.ok(await page.$eval('#appToast', (node, text) => node.classList.contains('show') && node.textContent.includes(text), text));
      }
      assert.deepEqual(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.map(node => [node.cells[0].textContent.trim(), Number(node.cells[1].textContent)])), [
        ['Active', 282], ['Birthday', 44], ['Confirmation Due', 3], ['Retirement Due', 1], ['Medical Check', 6], ['Confirmation Past Due', 237], ['Retirement Past Due', 80], ['Contract Expiry Past Due', 29]
      ]);
      assert.ok(await page.$$eval('[data-career-event-chart]', nodes => nodes.every(node => node.querySelector('.fa-chart-pie') && node.textContent.trim() === 'View Chart' && getComputedStyle(node).whiteSpace === 'nowrap')));
      assert.ok(await page.$eval('main', node => node.scrollWidth <= node.clientWidth));
      assert.ok(await page.$$eval('#employeeCareerStaffEventRows td', nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1)), 'Event names, counts and buttons must fit');
      await page.waitForFunction(() => getComputedStyle(document.querySelector('#employeeCareerAllOptions')).visibility === 'hidden' && getComputedStyle(document.querySelector('#appToast')).opacity === '0');
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-team-dashboard-${theme}-${width}-overview.png`) });
      await page.$eval('main', node => { node.scrollTop = node.scrollHeight; });
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-team-dashboard-${theme}-${width}-events.png`) });

      await page.select('#employeeCareerEventFilter', 'birthday');
      assert.equal(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.length), 1);
      await page.click('[data-career-event-detail="birthday"]');
      await page.waitForSelector('#employeeCareerTeamEventOverlay', { visible: true });
      assert.equal(await page.$eval('#employeeCareerTeamEventTitle', node => node.textContent), 'Birthday');
      assert.equal(await page.$eval('#employeeCareerTeamEventTotal', node => node.textContent), '44');
      assert.ok(await page.$$eval('.career-event-person', nodes => nodes.length > 0 && nodes.every(node => {
        const name = node.querySelector('.career-event-person-name');
        const id = node.querySelector('.career-event-person-id');
        return id.textContent.startsWith('#') && id.getBoundingClientRect().top >= name.getBoundingClientRect().bottom - 1;
      })));
      assert.equal(await page.$eval('main', node => node.inert), true);
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.classList.contains('detail-popout-body')), true, 'Event content is reachable by keyboard');
      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'employeeCareerTeamEventClose');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('main', node => node.inert), false);
      assert.equal(await page.evaluate(() => document.activeElement.dataset.careerEventDetail), 'birthday');

      await page.select('#employeeCareerEventFilter', 'retirement-due');
      await page.click('[data-career-event-detail="retirement-due"]');
      assert.equal(await page.$eval('#employeeCareerTeamEventTotal', node => node.textContent), '1');
      assert.equal(await page.$eval('#employeeCareerTeamEventEmpty', node => node.hidden), false, 'Missing employee rows use an honest empty state');
      await page.keyboard.press('Escape');
      await page.select('#employeeCareerEventFilter', '');
      assert.equal(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.length), 8);
      await page.click('[data-career-event-chart="birthday"]');
      assert.equal(await page.$eval('#employeeCareerTeamEventChart', node => node.hidden), false);
      assert.equal(await page.$$eval('.career-event-chart-row', nodes => nodes.length), 8);
      assert.equal(await page.$eval('.career-event-chart-row.is-selected .career-event-chart-value', node => node.textContent), '44');
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-team-dashboard-${theme}-${width}-chart.png`) });
      await page.keyboard.press('Escape');

      await page.click('#employeeCareerTabIndividual');
      assert.equal(await page.$$eval('[data-career-scope="team"]', nodes => nodes.every(node => node.hidden)), true);
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.hidden), false);
      await page.click('#employeeCareerTabTeam');
      assert.equal(await page.$$eval('[data-career-scope="team"]', nodes => nodes.every(node => !node.hidden)), true);
      await page.setViewport({ width, height: 800 });
      await page.select('#employeeCareerEventFilter', '');
      await page.click('[data-career-event-detail="active"]');
      await page.waitForSelector('#employeeCareerTeamEventOverlay', { visible: true });
      await page.keyboard.press('Tab');
      assert.ok(await page.$eval('#employeeCareerTeamEventOverlay .detail-popout-body', node => node.scrollHeight > node.clientHeight), 'Short phones require scrolling through Active details');
      await page.keyboard.press('PageDown');
      await page.waitForFunction(() => document.querySelector('#employeeCareerTeamEventOverlay .detail-popout-body').scrollTop > 0);
      await page.keyboard.press('Escape');
      assert.deepEqual(errors, []);
      console.log(`PASS ${theme} ${width}: Team order, shared actions, toasts, event filter, details/chart, focus and scope`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
