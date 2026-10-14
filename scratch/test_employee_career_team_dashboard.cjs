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
      assert.equal(await page.$$eval('#employeeCareerStaffEvents summary, #employeeCareerStaffEvents .employee-career-expiry-chevron', nodes => nodes.length), 0, 'Staff Events has no collapse control');
      await page.click('#employeeCareerStaffEvents .employee-career-expiry-header');
      assert.ok(await page.$eval('#employeeCareerStaffEvents table', node => node.getBoundingClientRect().height > 0), 'Clicking the title keeps staff events visible');
      assert.equal(await page.$$eval('#employeeCareerStaffEvents > .employee-career-event-filter', nodes => nodes.length), 0, 'The inline Event dropdown row is replaced by a filter summary');
      assert.equal(await page.$eval('#employeeCareerEventFilterSummary', node => node.textContent.trim()), 'All Events');
      assert.deepEqual(await page.$eval('#employeeCareerEventFilterTrigger', node => ({
        label: node.getAttribute('aria-label'),
        hasPopup: node.getAttribute('aria-haspopup'),
        controls: node.getAttribute('aria-controls'),
        expanded: node.getAttribute('aria-expanded'),
        icon: node.querySelector('i')?.classList.contains('fa-sliders')
      })), {
        label: 'Open Staff Events filter',
        hasPopup: 'dialog',
        controls: 'employeeCareerEventFilterOverlay',
        expanded: 'false',
        icon: true
      }, 'Staff Events exposes the standard filter trigger contract');
      assert.equal(await page.$$eval('#employeeCareerOptions .employee-career-option', nodes => nodes.length), 6);
      await page.click('[data-action="view-all"]');
      await page.waitForFunction(() => document.activeElement.id === 'employeeCareerCloseAll');
      assert.equal(await page.$$eval('#employeeCareerAllOptionsGrid .employee-career-option', nodes => nodes.length), 17);
      assert.equal(
        await page.$$eval('#employeeCareerAllOptionsGrid .employee-career-option-title', nodes => nodes.some(node => node.textContent.trim() === 'Key Staff Nomination')),
        false
      );
      await page.keyboard.press('Escape');

      const activeNavigation = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 1500 }).catch(() => null);
      await page.click('#employeeCareerActiveHeadcount');
      await activeNavigation;
      assert.ok(page.url().replace(/\\/g, '/').includes('/modules/employee-career/options/team/active-headcount.html'), 'Active Headcount opens its chart page');
      assert.equal(new URL(page.url()).searchParams.get('theme'), theme, 'Active Headcount preserves the selected theme');
      await page.goBack({ waitUntil: 'domcontentloaded' });

      const vacantNavigation = page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      await page.click('#employeeCareerVacantPosition');
      await vacantNavigation;
      assert.ok(page.url().includes('/vacant-position.html'), 'Vacant Position opens its chart page');
      assert.equal(new URL(page.url()).searchParams.get('theme'), theme);
      await page.goBack({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#employeeCareerActiveHeadcountTotal', node => node.textContent.trim()), '281');
      assert.deepEqual(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.map(node => [node.cells[0].textContent.trim(), Number(node.cells[1].textContent)])), [
        ['Active', 281], ['Birthday', 44], ['Confirmation Due', 3], ['Retirement Due', 1], ['Medical Check', 6], ['Confirmation Past Due', 237], ['Retirement Past Due', 80], ['Contract Expiry Past Due', 29]
      ]);
      assert.deepEqual(
        await page.$$eval('#employeeCareerStaffEvents thead th', nodes => nodes.map(node => node.textContent.trim())),
        ['Event', 'Count', 'Detail'],
        'Staff Events keeps only the three requested columns'
      );
      assert.equal(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.every(node => node.cells.length === 3)), true, 'Each Staff Events row has three cells');
      assert.equal(await page.$$eval('[data-career-event-chart], #employeeCareerTeamEventChart', nodes => nodes.length), 0, 'Staff Events exposes no chart control or chart view');
      assert.ok(await page.$eval('main', node => node.scrollWidth <= node.clientWidth));
      assert.ok(await page.$$eval('#employeeCareerStaffEventRows td', nodes => nodes.every(node => node.scrollWidth <= node.clientWidth + 1)), 'Event names, counts and buttons must fit');
      await page.waitForFunction(() => getComputedStyle(document.querySelector('#employeeCareerAllOptions')).visibility === 'hidden');
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-team-dashboard-${theme}-${width}-overview.png`) });
      await page.$eval('main', node => { node.scrollTop = node.scrollHeight; });
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-team-dashboard-${theme}-${width}-events.png`) });

      await page.click('#employeeCareerEventFilterTrigger');
      await page.waitForSelector('#employeeCareerEventFilterOverlay', { visible: true });
      assert.equal(await page.$eval('#employeeCareerEventFilterOverlay', node => node.getAttribute('aria-hidden')), 'false');
      assert.equal(await page.$eval('#employeeCareerEventFilterTrigger', node => node.getAttribute('aria-expanded')), 'true');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'employeeCareerEventFilter', 'Opening the filter focuses Event Type');
      assert.equal(await page.$eval('main', node => node.inert), true, 'Opening the filter makes dashboard content inert');
      assert.equal(await page.$eval('preview-top-bar', node => node.inert), true, 'Opening the modal filter also makes the outer preview toolbar inert');
      await page.select('#employeeCareerEventFilter', 'birthday');
      await page.click('#employeeCareerEventFilterClose');
      assert.equal(await page.$eval('#employeeCareerEventFilterOverlay', node => node.hidden), true, 'Close dismisses the filter sheet');
      assert.equal(await page.$eval('#employeeCareerEventFilterSummary', node => node.textContent.trim()), 'All Events', 'Close discards an unapplied event');
      assert.equal(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.length), 8, 'Close preserves the applied event filter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'employeeCareerEventFilterTrigger', 'Close restores focus to the filter trigger');
      assert.equal(await page.$eval('main', node => node.inert), false, 'Closing the filter restores dashboard interaction');
      assert.equal(await page.$eval('preview-top-bar', node => node.inert), false, 'Closing the filter restores the outer preview toolbar');

      await page.click('#employeeCareerEventFilterTrigger');
      assert.equal(await page.$eval('#employeeCareerEventFilter', node => node.value), '', 'Opening restores the applied event value');
      await page.select('#employeeCareerEventFilter', 'birthday');
      await page.click('#employeeCareerEventFilterApply');
      assert.equal(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.length), 1);
      assert.equal(await page.$eval('#employeeCareerEventFilterSummary', node => node.textContent.trim()), 'Birthday');
      assert.equal(await page.$eval('#employeeCareerEventFilterTrigger', node => node.getAttribute('aria-expanded')), 'false');
      await page.click('#employeeCareerEventFilterTrigger');
      await page.select('#employeeCareerEventFilter', 'retirement-due');
      await page.click('#employeeCareerEventFilterClose');
      assert.equal(await page.$eval('#employeeCareerEventFilterSummary', node => node.textContent.trim()), 'Birthday', 'Close preserves a previously applied non-default event');
      assert.deepEqual(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.map(node => node.cells[0].textContent.trim())), ['Birthday']);
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

      await page.click('#employeeCareerEventFilterTrigger');
      await page.select('#employeeCareerEventFilter', 'retirement-due');
      await page.click('#employeeCareerEventFilterApply');
      await page.click('[data-career-event-detail="retirement-due"]');
      assert.equal(await page.$eval('#employeeCareerTeamEventTotal', node => node.textContent), '1');
      assert.equal(await page.$eval('#employeeCareerTeamEventEmpty', node => node.hidden), false, 'Missing employee rows use an honest empty state');
      await page.keyboard.press('Escape');
      await page.click('#employeeCareerEventFilterTrigger');
      await page.click('#employeeCareerEventFilterReset');
      assert.equal(await page.$$eval('#employeeCareerStaffEventRows tr', nodes => nodes.length), 8);
      assert.equal(await page.$eval('#employeeCareerEventFilterSummary', node => node.textContent.trim()), 'All Events', 'Reset applies the default event filter');

      await page.click('#employeeCareerEventFilterTrigger');
      await page.select('#employeeCareerEventFilter', 'birthday');
      await page.$eval('#employeeCareerEventFilterOverlay', node => node.click());
      assert.equal(await page.$eval('#employeeCareerEventFilterSummary', node => node.textContent.trim()), 'All Events', 'Backdrop close discards an unapplied event');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'employeeCareerEventFilterTrigger');

      await page.click('#employeeCareerEventFilterTrigger');
      await page.focus('#employeeCareerEventFilterApply');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'employeeCareerEventFilterReset', 'Tab wraps from the final filter control to Reset');
      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'employeeCareerEventFilterApply', 'Shift+Tab wraps from Reset to the final filter control');
      await page.select('#employeeCareerEventFilter', 'birthday');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#employeeCareerEventFilterSummary', node => node.textContent.trim()), 'All Events', 'Escape discards an unapplied event');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'employeeCareerEventFilterTrigger');

      await page.click('#employeeCareerTabIndividual');
      assert.equal(await page.$$eval('[data-career-scope="team"]', nodes => nodes.every(node => node.hidden)), true);
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.hidden), false);
      await page.click('#employeeCareerTabTeam');
      assert.equal(await page.$$eval('[data-career-scope="team"]', nodes => nodes.every(node => !node.hidden)), true);
      await page.setViewport({ width, height: 800 });
      await page.click('[data-career-event-detail="active"]');
      await page.waitForSelector('#employeeCareerTeamEventOverlay', { visible: true });
      await page.keyboard.press('Tab');
      assert.ok(await page.$eval('#employeeCareerTeamEventOverlay .detail-popout-body', node => node.scrollHeight > node.clientHeight), 'Short phones require scrolling through Active details');
      await page.keyboard.press('PageDown');
      await page.waitForFunction(() => document.querySelector('#employeeCareerTeamEventOverlay .detail-popout-body').scrollTop > 0);
      await page.keyboard.press('Escape');
      assert.deepEqual(errors, []);
      console.log(`PASS ${theme} ${width}: Team order, shared actions, toasts, event filter, details, focus and scope`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
