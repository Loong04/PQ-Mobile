const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'modules/training-competency/options/course-catalog.html');
const pageUrl = theme => pathToFileURL(pagePath).href + '?theme=' + theme;

async function open(page, theme = 'dark') {
  await page.goto(pageUrl(theme), { waitUntil: 'domcontentloaded' });
}

async function filterState(page) {
  return page.$eval('#courseFilterOverlay', overlay => ({
    hidden: overlay.hidden,
    ariaHidden: overlay.getAttribute('aria-hidden'),
    active: overlay.classList.contains('active'),
    inertedSiblings: [...overlay.parentElement.children]
      .filter(node => node !== overlay && node.inert)
      .length
  }));
}

async function courseTitles(page) {
  return page.$$eval('#courseList .course-catalog-card-header', nodes => nodes.map(node => node.textContent.trim()));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  const pageErrors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await open(page);

    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Course Catalog');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    assert.equal(await page.$eval('#courseCatalogBack', node => node.getAttribute('href')), '../index.html?scope=individual&theme=dark');
    assert.equal(await page.$eval('#courseFilterSummary', node => node.textContent.trim()), 'All Courses');
    assert.equal(await page.$eval('#courseTotalRecords', node => node.textContent.trim()), '2');
    assert.deepEqual(await courseTitles(page), ['Microsoft', 'Effective Crisis Management']);

    assert.deepEqual(await page.$$eval('#courseList .course-catalog-card', cards => cards.map(card => {
      const headerStyle = getComputedStyle(card.querySelector('.course-catalog-card-header'));
      const details = [...card.querySelectorAll('.course-catalog-detail')];
      return {
        labels: details.map(detail => detail.querySelector('span').textContent.trim()),
        values: details.map(detail => detail.querySelector('strong').textContent.trim()),
        borders: details.map(detail => getComputedStyle(detail).borderTopWidth),
        purpleHeader: headerStyle.backgroundImage.includes('linear-gradient') && headerStyle.color === 'rgb(255, 255, 255)',
        hasArrow: Boolean(card.querySelector('.course-catalog-card-header i')),
        titleTag: card.querySelector('.course-catalog-card-title')?.tagName,
        labelledByTitle: card.getAttribute('aria-labelledby') === card.querySelector('.course-catalog-card-title')?.id,
        interactiveChildren: card.querySelectorAll('button, [aria-haspopup="dialog"]').length
      };
    })), [
      {
        labels: ['Development Area', 'Training Type', 'Duration', 'Bond Period'],
        values: ['Technology', 'Online', '2 Days', 'No Bond'],
        borders: ['1px', '1px', '1px', '1px'],
        purpleHeader: true,
        hasArrow: false,
        titleTag: 'H2',
        labelledByTitle: true,
        interactiveChildren: 0
      },
      {
        labels: ['Development Area', 'Training Type', 'Duration', 'Bond Period'],
        values: ['Leadership & Management', 'Classroom', '1 Day', '6 Months'],
        borders: ['1px', '1px', '1px', '1px'],
        purpleHeader: true,
        hasArrow: false,
        titleTag: 'H2',
        labelledByTitle: true,
        interactiveChildren: 0
      }
    ]);

    assert.equal(await page.$eval('#courseSummary', node => node.classList.contains('record-summary-card')), true);
    assert.deepEqual(await filterState(page), { hidden: true, ariaHidden: 'true', active: false, inertedSiblings: 0 });
    await page.click('#courseFilterTrigger');
    assert.deepEqual(await filterState(page), { hidden: false, ariaHidden: 'false', active: true, inertedSiblings: 5 });
    assert.deepEqual(await page.$$eval('#courseFilterForm [data-filter-field]', nodes => nodes.map(node => node.dataset.filterField)), [
      'keyword',
      'effective-date',
      'course-category',
      'training-type',
      'development-area',
      'has-open-class',
      'online-course',
      'show-all'
    ]);
    assert.deepEqual(await page.$$eval('#courseFilterForm input[role="switch"]', nodes => nodes.map(node => ({
      id: node.id,
      checked: node.checked
    }))), [
      { id: 'courseFilterHasOpenClass', checked: false },
      { id: 'courseFilterOnlineCourse', checked: false },
      { id: 'courseFilterShowAll', checked: false }
    ]);
    assert.deepEqual(await page.$$eval('.course-filter-switch-row', rows => rows.map(row => {
      const rowRect = row.getBoundingClientRect();
      const controlRect = row.querySelector('.course-filter-switch').getBoundingClientRect();
      const style = getComputedStyle(row);
      return {
        display: style.display,
        justifyContent: style.justifyContent,
        rightAligned: Math.abs((rowRect.right - controlRect.right) - 14) < 1,
        separated: controlRect.left > rowRect.left + rowRect.width / 2
      };
    })), [
      { display: 'flex', justifyContent: 'space-between', rightAligned: true, separated: true },
      { display: 'flex', justifyContent: 'space-between', rightAligned: true, separated: true },
      { display: 'flex', justifyContent: 'space-between', rightAligned: true, separated: true }
    ], 'Filter switches align consistently at the right edge');
    assert.deepEqual(await page.$eval('#courseFilterCategory', node => [...node.options].map(option => option.textContent.trim())), [
      'All Course Categories',
      'Digital Skills',
      'Leadership'
    ]);
    assert.deepEqual(await page.$eval('#courseFilterTrainingType', node => [...node.options].map(option => option.textContent.trim())), [
      'All Training Types',
      'Classroom',
      'Online'
    ]);
    assert.deepEqual(await page.$eval('#courseFilterDevelopmentArea', node => [...node.options].map(option => option.textContent.trim())), [
      'All Development Areas',
      'Leadership & Management',
      'Technology'
    ]);

    await page.type('#courseFilterKeyword', 'crisis');
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), ['Effective Crisis Management']);
    assert.equal(await page.$eval('#courseTotalRecords', node => node.textContent.trim()), '1');
    assert.equal(await page.$eval('#courseFilterSummary', node => node.textContent.trim()), 'Search: crisis');

    await page.click('#courseFilterTrigger');
    await page.click('#courseResetFilter');
    assert.deepEqual(await courseTitles(page), ['Microsoft', 'Effective Crisis Management']);
    assert.equal(await page.$eval('#courseTotalRecords', node => node.textContent.trim()), '2');

    await page.click('#courseFilterTrigger');
    await page.click('#courseFilterOnlineCourse');
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), ['Microsoft']);
    assert.equal(await page.$eval('#courseFilterSummary', node => node.textContent.trim()), 'Online Course');

    await page.click('#courseFilterTrigger');
    await page.click('#courseResetFilter');
    await page.click('#courseFilterTrigger');
    await page.$eval('#courseFilterEffectiveDate', node => {
      node.value = '2026-10-20';
    });
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), ['Microsoft'], 'Effective Date filters the catalog');

    await page.click('#courseFilterTrigger');
    await page.click('#courseResetFilter');
    await page.click('#courseFilterTrigger');
    await page.select('#courseFilterCategory', 'Leadership');
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), ['Effective Crisis Management'], 'Course Category filters the catalog');

    await page.click('#courseFilterTrigger');
    await page.click('#courseResetFilter');
    await page.click('#courseFilterTrigger');
    await page.select('#courseFilterTrainingType', 'Classroom');
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), ['Effective Crisis Management'], 'Training Type filters the catalog');

    await page.click('#courseFilterTrigger');
    await page.click('#courseResetFilter');
    await page.click('#courseFilterTrigger');
    await page.select('#courseFilterDevelopmentArea', 'Technology');
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), ['Microsoft'], 'Development Area filters the catalog');

    await page.click('#courseFilterTrigger');
    await page.click('#courseResetFilter');
    await page.click('#courseFilterTrigger');
    await page.click('#courseFilterHasOpenClass');
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), ['Microsoft'], 'Has Open Class filters the catalog');

    await page.click('#courseFilterTrigger');
    await page.click('#courseResetFilter');
    await page.click('#courseFilterTrigger');
    await page.select('#courseFilterCategory', 'Leadership');
    await page.click('#courseFilterOnlineCourse');
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), [], 'Combined filters can produce an empty result');
    assert.equal(await page.$eval('#courseTotalRecords', node => node.textContent.trim()), '0');
    assert.equal(await page.$eval('#courseEmpty', node => node.hidden), false);

    await page.click('#courseFilterTrigger');
    await page.click('#courseResetFilter');
    await page.click('#courseFilterTrigger');
    await page.type('#courseFilterKeyword', 'missing');
    await page.click('#courseFilterShowAll');
    await page.click('#courseApplyFilter');
    assert.deepEqual(await courseTitles(page), ['Microsoft', 'Effective Crisis Management'], 'Show All bypasses the other filters');
    assert.equal(await page.$eval('#courseFilterSummary', node => node.textContent.trim()), 'Show All');

    await page.click('#courseFilterTrigger');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'courseResetFilter', 'Show All reopens with focus inside the filter');
    assert.deepEqual(await page.$$eval('.course-filter-switch-row:has(input:disabled)', rows => rows.map(row => getComputedStyle(row).opacity)), ['0.55', '0.55']);
    await page.keyboard.press('Escape');
    assert.equal((await filterState(page)).hidden, true);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'courseFilterTrigger');

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
        await open(page, theme);
        const layout = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          cardColumns: getComputedStyle(document.querySelector('.course-catalog-details')).gridTemplateColumns.split(' ').length,
          backHref: document.getElementById('courseCatalogBack').getAttribute('href')
        }));
        assert.equal(layout.theme, theme);
        assert.ok(layout.overflow <= 1, theme + ' ' + width + 'px has no horizontal overflow');
        assert.equal(layout.cardColumns, 2, theme + ' ' + width + 'px keeps a two-column course detail grid');
        assert.equal(layout.backHref, '../index.html?scope=individual&theme=' + theme);
      }
    }

    assert.deepEqual(pageErrors, [], 'Pages should have no JavaScript errors: ' + pageErrors.join('; '));
    console.log('PASS: Course Catalog filters, totals, cards, themes and responsive layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
