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
    await assertEmployeeCards(page, 'Staff Confirmation');

    for (const [key, label] of categories.slice(1)) {
      await page.click(`[data-team-history-kind=${key}]`);
      assert.equal(new URL(page.url()).searchParams.get('category'), key, `${label} is reflected in the URL`);
      assert.equal(await page.$eval(`[data-team-history-kind=${key}]`, node => node.getAttribute('aria-pressed')), 'true');
      assert.equal(await page.$eval('#teamHistoryRecordCount', node => node.textContent.trim()), '2');
      assert.equal(await page.$eval('#teamHistoryCategoryTitle', node => node.textContent.trim()), `${label} History`);

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
