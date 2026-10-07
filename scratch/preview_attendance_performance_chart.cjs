const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const assert = require('node:assert/strict');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: 950 });
      await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/attendance-performance.html')).href + '?theme=' + theme, { waitUntil: 'domcontentloaded' });
      await page.screenshot({ path: path.resolve(__dirname, `attendance-performance-${theme}-${width}.png`) });
      await page.$('.performance-chart-card').then(card => card.screenshot({ path: path.resolve(__dirname, `attendance-performance-chart-${theme}-${width}.png`) }));
      const layout = await page.evaluate(() => {
        const donut = document.querySelector('.chart-svg-wrap').getBoundingClientRect();
        const tiles = [...document.querySelectorAll('.chart-legend-item')].map(tile => {
          const rect = tile.getBoundingClientRect();
          return { top: rect.top, width: rect.width, count: tile.querySelector('strong').textContent, percent: tile.querySelector('.performance-band-percent').textContent };
        });
        const content = document.querySelector('.main-content');
        return { total: document.querySelector('.chart-center-total').textContent, donutWidth: donut.width, tilesBelow: tiles.every(tile => tile.top > donut.bottom), sameRow: tiles.every(tile => tile.top === tiles[0].top), tiles, overflow: content.scrollWidth > content.clientWidth };
      });
      const directory = await page.evaluate(() => ({
        tabs: [...document.querySelectorAll('.filter-pill')].map(tab => tab.textContent.trim()),
        tabDots: document.querySelectorAll('.filter-pill [class*="dot-"]').length,
        cards: [...document.querySelectorAll('#employeePerformanceList .emp-card')].map(card => {
          const name = card.querySelector('.history-card-title');
          const id = card.querySelector('.performance-employee-id');
          return {
            band: card.dataset.band,
            radius: getComputedStyle(card).borderRadius,
            background: getComputedStyle(card).backgroundImage,
            detailBackground: getComputedStyle(card.querySelector('.history-card-details')).backgroundColor,
            badgeRadius: getComputedStyle(card.querySelector('.card-status-badge')).borderRadius,
            badgeIcon: Boolean(card.querySelector('.card-status-badge .fa-solid')),
            id: id.textContent,
            idBelowName: id.getBoundingClientRect().top >= name.getBoundingClientRect().bottom,
            rows: [...card.querySelectorAll('.performance-detail-row > span')].map(label => label.textContent),
            overflow: card.scrollWidth > card.clientWidth,
            dateBadges: card.querySelectorAll('.history-date-badge').length
          };
        })
      }));
      assert.deepEqual(directory.tabs, ['All Bands', 'Good', 'Caution', 'Poor']);
      assert.equal(directory.tabDots, 0);
      assert.equal(directory.cards.length, 12);
      for (const card of directory.cards) {
        assert.equal(card.radius, '18px');
        const rgb = { Good: '16, 185, 129', Caution: '245, 158, 11', Poor: '239, 68, 68' }[card.band];
        assert.ok(card.background.includes(`rgba(${rgb}, 0.06)`), 'History Card gradient must match its attendance band');
        assert.equal(card.detailBackground, `rgba(${rgb}, 0.05)`);
        assert.equal(card.badgeRadius, '10px');
        assert.ok(card.badgeIcon);
        assert.ok(card.id.startsWith('#') && card.idBelowName);
        assert.deepEqual(card.rows, ['Department', 'Cost Centre', 'Branch']);
        assert.equal(card.overflow, false);
        assert.equal(card.dateBadges, 0);
      }
      const selections = [];
      for (const band of ['Good', 'Caution', 'Poor']) {
        await page.click(`.chart-legend-item[data-band="${band}"]`);
        selections.push(await page.evaluate(() => ({ selected: document.getElementById('filterBandSelect').value, visible: [...document.querySelectorAll('#employeePerformanceList .emp-card')].filter(card => getComputedStyle(card).display !== 'none').map(card => card.dataset.band) })));
      }
      console.log(JSON.stringify({ theme, width, layout, selections, errors }));
      assert.ok(selections.every(selection => selection.visible.length > 0 && selection.visible.every(band => band === selection.selected)), 'Selecting a legend category must show only matching employees');
      for (const [tab, count] of [['all', 12], ['good', 5], ['caution', 3], ['poor', 4], ['all', 12]]) {
        await page.click(`#pill-${tab}`);
        assert.equal(await page.evaluate(() => [...document.querySelectorAll('#employeePerformanceList .emp-card')].filter(card => getComputedStyle(card).display !== 'none').length), count);
      }
      assert.equal(errors.length, 0);
      assert.equal(layout.overflow, false);
      await page.evaluate(() => {
        const content = document.querySelector('.main-content');
        content.scrollTop += document.querySelector('.segmented-tab-container').getBoundingClientRect().top - content.getBoundingClientRect().top;
      });
      await page.screenshot({ path: path.resolve(__dirname, `attendance-performance-directory-${theme}-${width}.png`) });
      console.log(`Verified plain tabs and 12 History Cards: ${theme}, ${width}px`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
