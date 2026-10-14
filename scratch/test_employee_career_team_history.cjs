const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const historyPage = 'modules/employee-career/options/team/history.html';
const categories = [
  ['staff-confirmation', 'Staff Confirmation'],
  ['staff-exit', 'Staff Exit'],
  ['staff-request', 'Staff Request'],
  ['staff-engagement', 'Staff Engagement']
];

function fileUrl(relative, query = '') {
  return pathToFileURL(path.join(root, relative)).href + query;
}

async function open(page, relative, query = '') {
  await page.goto(fileUrl(relative, query), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.readyState !== 'loading');
}

async function assertEmployeeCards(page, category) {
  const cards = await page.$$eval('#teamHistoryList .history-card-item', nodes => nodes.map(node => ({
    id: node.querySelector('.team-history-employee-id')?.textContent.trim() || '',
    adjacent: Boolean(node.querySelector('.team-history-employee-name + .team-history-employee-id')),
    hasDetails: Boolean(node.querySelector('.history-card-details')),
    status: node.querySelector('.status-pill')?.textContent.trim() || ''
  })));
  assert.equal(cards.length, 2, `${category} has two provisional records`);
  cards.forEach(card => {
    assert.match(card.id, /^#[A-Z0-9-]+$/, `${category} employee number is prefixed with #`);
    assert.equal(card.adjacent, true, `${category} employee number sits directly below the name`);
    assert.equal(card.hasDetails, true, `${category} uses the bordered history detail block`);
    assert.notEqual(card.status, '', `${category} displays a status`);
  });
}

async function assertConfirmationCards(page) {
  const cards = await page.$$eval('#teamHistoryList .history-card-item', nodes => nodes.map(node => ({
    name: node.querySelector('.team-history-employee-name')?.textContent.trim() || '',
    id: node.querySelector('.team-history-employee-id')?.textContent.trim() || '',
    adjacent: Boolean(node.querySelector('.team-history-employee-name + .team-history-employee-id')),
    reference: node.querySelector('.team-history-record-ref')?.textContent.trim() || '',
    status: node.querySelector('.status-pill')?.textContent.trim() || '',
    tone: node.dataset.status || '',
    labels: [...node.querySelectorAll('.history-card-row > span')].map(label => label.textContent.trim()),
    values: [...node.querySelectorAll('.history-card-row > strong')].map(value => value.textContent.trim())
  })));

  assert.deepEqual(cards, [
    {
      name: 'Aina Rahman', id: '#EBB01', adjacent: true, reference: '',
      status: 'To Resubmit', tone: 'resubmit',
      labels: ['Recommendation', 'Submitted', 'Adjustment'],
      values: ['Confirm Employment', '4 Oct 2026', 'RM 300.00']
    },
    {
      name: 'Daniel Wong', id: '#EBB02', adjacent: true, reference: '',
      status: 'To Resubmit', tone: 'resubmit',
      labels: ['Recommendation', 'Submitted', 'Adjustment'],
      values: ['Further Review', '12 Oct 2026', 'No Adjustment']
    }
  ], 'Staff Confirmation cards use the approved fields, employee ID placement and To Resubmit status');
}

async function setDateRange(page, startDate, endDate) {
  await page.evaluate(({ startDate: start, endDate: end }) => {
    const startInput = document.getElementById('teamConfirmationStartDate');
    const endInput = document.getElementById('teamConfirmationEndDate');
    startInput.value = start;
    endInput.value = end;
    startInput.dispatchEvent(new Event('input', { bubbles: true }));
    endInput.dispatchEvent(new Event('input', { bubbles: true }));
  }, { startDate, endDate });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  const pageErrors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));

    await open(page, 'modules/employee-career/index.html', '?scope=team&theme=light');
    await page.click('[data-action=view-all]');
    const historyEntry = await page.$eval('#employeeCareerAllOptionsGrid [data-option-id=team-history]', node => ({
      tagName: node.tagName,
      disabled: node.disabled || false,
      href: node.getAttribute('href')
    }));
    assert.equal(historyEntry.tagName, 'A', 'Team History is an active navigation option');
    assert.equal(historyEntry.disabled, false);
    assert.match(historyEntry.href, /options\/team\/history\.html\?theme=light$/);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('#employeeCareerAllOptionsGrid [data-option-id=team-history]')
    ]);
    assert.ok(page.url().includes('/options/team/history.html'));
    const viewportContent = await page.$eval('meta[name=viewport]', node => node.content);
    assert.doesNotMatch(viewportContent, /user-scalable\s*=\s*no/i, 'Team History keeps browser zoom available');
    assert.doesNotMatch(viewportContent, /maximum-scale/i, 'Team History does not cap browser zoom');
    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'History');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
    assert.deepEqual(
      await page.$$eval('[data-team-history-kind]', nodes => nodes.map(node => [node.dataset.teamHistoryKind, node.textContent.trim()])),
      categories
    );
    assert.equal(await page.$eval('[data-team-history-kind=staff-confirmation]', node => node.getAttribute('aria-pressed')), 'true');
    assert.equal(await page.$eval('#teamHistoryRecordCount', node => node.textContent.trim()), '2');
    assert.equal(await page.$eval('#teamHistoryCategoryTitle', node => node.textContent.trim()), 'Staff Confirmation History');
    assert.equal(await page.$eval('#teamConfirmationFilterBar', node => node.hidden), false, 'Staff Confirmation displays its Submitted date filter');
    assert.equal(await page.$eval('#teamConfirmationFilterSummary', node => node.textContent.trim()), 'All Submission Dates');
    assert.deepEqual(
      await page.$$eval('#teamConfirmationFilterForm label', nodes => nodes.map(node => node.textContent.trim())),
      ['Start Date', 'End Date'],
      'Staff Confirmation filter contains the requested date controls'
    );
    assert.deepEqual(await page.$eval('#teamConfirmationFilterOverlay', node => ({
      hidden: node.hidden,
      ariaHidden: node.getAttribute('aria-hidden')
    })), { hidden: true, ariaHidden: 'true' }, 'Date filter starts closed');
    await assertConfirmationCards(page);

    await page.click('#teamConfirmationFilterTrigger');
    assert.deepEqual(await page.$eval('#teamConfirmationFilterOverlay', node => ({
      hidden: node.hidden,
      open: node.classList.contains('is-open'),
      ariaHidden: node.getAttribute('aria-hidden')
    })), { hidden: false, open: true, ariaHidden: 'false' }, 'Date filter opens as the standard bottom sheet');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'teamConfirmationStartDate', 'Start Date receives focus');
    assert.equal(await page.$eval('#teamConfirmationFilterOverlay', overlay => [...overlay.parentElement.children]
      .filter(node => node !== overlay)
      .every(node => node.inert)), true, 'Background content is inert while the filter is open');
    await page.focus('#teamConfirmationResetFilter');
    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'teamConfirmationApplyFilter', 'Shift+Tab wraps from the first control to the last control');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'teamConfirmationResetFilter', 'Tab wraps from the last control to the first control');
    await setDateRange(page, '2026-10-12', '2026-10-12');
    await page.click('#teamConfirmationApplyFilter');
    assert.equal(await page.$eval('#teamHistoryRecordCount', node => node.textContent.trim()), '1', 'Submitted date filter updates Total Records');
    assert.equal(await page.$eval('#teamConfirmationFilterSummary', node => node.textContent.trim()), '12 Oct 2026 - 12 Oct 2026');
    assert.deepEqual(
      await page.$$eval('#teamHistoryList .team-history-employee-name', nodes => nodes.map(node => node.textContent.trim())),
      ['Daniel Wong'],
      'Submitted date filter includes records that sit exactly on both boundaries'
    );

    await page.click('#teamConfirmationFilterTrigger');
    await setDateRange(page, '2026-10-31', '2026-10-01');
    await page.click('#teamConfirmationApplyFilter');
    assert.equal(await page.$eval('#teamConfirmationFilterOverlay', node => node.hidden), false, 'Invalid date range keeps the filter open');
    assert.equal(await page.$eval('#teamConfirmationFilterError', node => node.hidden), false, 'Invalid date range displays an error');
    assert.equal(await page.$eval('#teamConfirmationFilterError', node => node.textContent.trim()), 'End Date must be on or after Start Date.');
    assert.equal(await page.$eval('#teamConfirmationEndDate', node => node.getAttribute('aria-invalid')), 'true');
    assert.equal(await page.$eval('#teamHistoryRecordCount', node => node.textContent.trim()), '1', 'Invalid range leaves applied results unchanged');
    await page.click('#teamConfirmationResetFilter');
    assert.equal(await page.$eval('#teamConfirmationFilterOverlay', node => node.hidden), true, 'Reset applies the cleared filter and closes the sheet');
    assert.equal(await page.$eval('#teamConfirmationFilterSummary', node => node.textContent.trim()), 'All Submission Dates');
    assert.equal(await page.$eval('#teamHistoryRecordCount', node => node.textContent.trim()), '2');

    await page.click('#teamConfirmationFilterTrigger');
    await setDateRange(page, '2027-01-01', '2027-01-31');
    await page.click('#teamConfirmationApplyFilter');
    assert.equal(await page.$eval('#teamHistoryRecordCount', node => node.textContent.trim()), '0');
    assert.equal(await page.$eval('#teamHistoryEmpty', node => node.hidden), false, 'A date range without records displays the empty state');
    assert.equal(await page.$eval('#teamHistoryEmptyCopy', node => node.textContent.trim()), 'No records match the selected submission dates.');
    await page.click('#teamConfirmationFilterTrigger');
    await page.click('#teamConfirmationResetFilter');

    await page.click('#teamConfirmationFilterTrigger');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#teamConfirmationFilterOverlay', node => node.hidden), true, 'Escape closes the filter sheet');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'teamConfirmationFilterTrigger', 'Closing restores focus to the trigger');
    await page.click('#teamConfirmationFilterTrigger');
    const backdropPoint = await page.$eval('#teamConfirmationFilterOverlay', node => {
      const rect = node.getBoundingClientRect();
      return { x: rect.left + (rect.width / 2), y: rect.top + 24 };
    });
    await page.mouse.click(backdropPoint.x, backdropPoint.y);
    assert.equal(await page.$eval('#teamConfirmationFilterOverlay', node => node.hidden), true, 'Clicking the backdrop closes the filter sheet');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'teamConfirmationFilterTrigger', 'Backdrop close restores focus to the trigger');

    for (const [key, label] of categories.slice(1)) {
      await page.click(`[data-team-history-kind=${key}]`);
      assert.equal(new URL(page.url()).searchParams.get('category'), key, `${label} is reflected in the URL`);
      assert.equal(await page.$eval(`[data-team-history-kind=${key}]`, node => node.getAttribute('aria-pressed')), 'true');
      assert.equal(await page.$eval('#teamHistoryRecordCount', node => node.textContent.trim()), '2');
      assert.equal(await page.$eval('#teamHistoryCategoryTitle', node => node.textContent.trim()), `${label} History`);
      assert.equal(await page.$eval('#teamConfirmationFilterBar', node => node.hidden), true, `${label} does not display the Staff Confirmation filter`);

      if (key === 'staff-request') {
        assert.equal(await page.$$eval('#teamHistoryList .history-card-item', nodes => nodes.length), 2);
        assert.equal(await page.$$eval('#teamHistoryList .team-history-employee-id', nodes => nodes.length), 0, 'Staff Request does not fabricate employee IDs');
        assert.deepEqual(
          await page.$$eval('#teamHistoryList .team-history-request-ref', nodes => nodes.map(node => node.textContent.trim())),
          ['Ref: SR-2026-0012', 'Ref: SR-2026-0011']
        );
        assert.equal(await page.$$eval('#teamHistoryList .history-card-details', nodes => nodes.length), 2);
      } else {
        await assertEmployeeCards(page, label);
      }
    }

    const back = await page.$eval('[data-option-back]', node => node.getAttribute('href'));
    const backUrl = new URL(back, page.url());
    assert.equal(backUrl.searchParams.get('scope'), 'team');
    assert.equal(backUrl.searchParams.get('theme'), 'light');

    await open(page, historyPage, '?category=unknown&theme=dark');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    assert.equal(await page.$eval('[data-team-history-kind=staff-confirmation]', node => node.getAttribute('aria-pressed')), 'true', 'Unknown category falls back safely');
    assert.equal(new URL(page.url()).searchParams.get('category'), 'staff-confirmation');

    for (const width of [360, 420]) {
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
      for (const theme of ['light', 'dark']) {
        await open(page, historyPage, `?category=staff-engagement&theme=${theme}`);
        await page.waitForFunction(() => {
          const container = document.querySelector('.team-history-tabs');
          const active = container?.querySelector('.active');
          if (!container || !active || container.scrollLeft <= 0) return false;
          const containerRect = container.getBoundingClientRect();
          const activeRect = active.getBoundingClientRect();
          return activeRect.left >= containerRect.left - 1 && activeRect.right <= containerRect.right + 1;
        }, { timeout: 5000 });
        const layout = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          cardOverflow: Array.from(document.querySelectorAll('.history-card-item')).some(card => card.scrollWidth > card.clientWidth + 1),
          tabs: (() => {
            const container = document.querySelector('.team-history-tabs');
            const active = container.querySelector('.active');
            const containerRect = container.getBoundingClientRect();
            const activeRect = active.getBoundingClientRect();
            return {
              hasOverflow: container.scrollWidth > container.clientWidth,
              overflowX: getComputedStyle(container).overflowX,
              scrolled: container.scrollLeft > 0,
              activeVisible: activeRect.left >= containerRect.left - 1 && activeRect.right <= containerRect.right + 1,
              scrollLeft: container.scrollLeft,
              scrollWidth: container.scrollWidth,
              clientWidth: container.clientWidth,
              containerLeft: containerRect.left,
              containerRight: containerRect.right,
              activeLeft: activeRect.left,
              activeRight: activeRect.right
            };
          })()
        }));
        assert.equal(layout.theme, theme);
        assert.ok(layout.overflow <= 1, `${theme} Team History has no page overflow at ${width}px`);
        assert.equal(layout.cardOverflow, false, `${theme} Team History cards fit at ${width}px`);
        assert.equal(layout.tabs.hasOverflow, true, `${theme} Team History tabs overflow inside their own bar at ${width}px`);
        assert.equal(layout.tabs.overflowX, 'auto', `${theme} Team History tab bar is horizontally scrollable at ${width}px`);
        assert.equal(layout.tabs.scrolled, true, `${theme} selected final tab is scrolled into view at ${width}px: ${JSON.stringify(layout.tabs)}`);
        assert.equal(layout.tabs.activeVisible, true, `${theme} selected final tab is visible at ${width}px: ${JSON.stringify(layout.tabs)}`);
      }
    }

    if (process.argv.includes('--screenshots')) {
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
      await open(page, historyPage, '?category=staff-confirmation&theme=light');
      await page.screenshot({ path: 'C:/tmp/team-history-confirmation-light.png', fullPage: true });
      await page.click('#teamConfirmationFilterTrigger');
      await page.screenshot({ path: 'C:/tmp/team-history-confirmation-filter-light.png', fullPage: true });
      await page.keyboard.press('Escape');
      await open(page, historyPage, '?category=staff-request&theme=dark');
      await page.screenshot({ path: 'C:/tmp/team-history-request-dark.png', fullPage: true });
    }

    assert.deepEqual(pageErrors, [], `Team History has no JavaScript errors: ${pageErrors.join('; ')}`);
    console.log('PASS: Team History entry, tabs, cards, employee IDs, themes and mobile layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
