const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'modules/training-competency/options/competency.html');
const pageUrl = (theme = 'dark') => `${pathToFileURL(pagePath).href}?theme=${theme}`;

async function open(page, theme) {
  await page.goto(pageUrl(theme), { waitUntil: 'domcontentloaded' });
}

async function overlayState(page) {
  return page.$eval('#competencyDetailsOverlay', overlay => ({
    hidden: overlay.hidden,
    ariaHidden: overlay.getAttribute('aria-hidden'),
    inertedSiblings: [...overlay.parentElement.children]
      .filter(node => node !== overlay)
      .filter(node => node.inert)
      .length
  }));
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
    await open(page, 'dark');

    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Competency');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    assert.equal(await page.$eval('#competencyBack', node => node.getAttribute('href')), '../index.html?scope=individual&theme=dark');
    assert.deepEqual(await page.$$eval('.competency-summary-field', nodes => nodes.map(node => ({
      label: node.querySelector('span').textContent.trim(),
      value: node.querySelector('strong').textContent.trim()
    }))), [
      { label: 'Name', value: 'Farhan Binti Rahmat' },
      { label: 'Position', value: 'Group HR Manager' },
      { label: 'Department', value: 'Human Resource' },
      { label: 'Total Record', value: '2' }
    ]);
    assert.deepEqual(await page.$eval('#competencySummary', summary => {
      const summaryStyle = getComputedStyle(summary);
      const fields = [...summary.querySelectorAll('.competency-summary-field')];
      return {
        sharedClass: summary.classList.contains('record-summary-card'),
        columns: summaryStyle.gridTemplateColumns.split(' ').length,
        borderWidth: summaryStyle.borderTopWidth,
        borderRadius: summaryStyle.borderTopLeftRadius,
        usesGradient: summaryStyle.backgroundImage.includes('linear-gradient'),
        shadow: summaryStyle.boxShadow,
        fieldLayouts: fields.map(field => getComputedStyle(field).display),
        fieldColumns: fields.map(field => getComputedStyle(field).gridTemplateColumns.split(' ').length),
        fieldBottomBorders: fields.map(field => getComputedStyle(field).borderBottomWidth),
        fieldBackgrounds: fields.map(field => getComputedStyle(field).backgroundColor),
        labelColors: fields.map(field => getComputedStyle(field.querySelector('span')).color),
        valueColors: fields.map(field => getComputedStyle(field.querySelector('strong')).color)
      };
    }), {
      sharedClass: true,
      columns: 1,
      borderWidth: '1px',
      borderRadius: '18px',
      usesGradient: true,
      shadow: 'none',
      fieldLayouts: ['grid', 'grid', 'grid', 'grid'],
      fieldColumns: [1, 1, 1, 1],
      fieldBottomBorders: ['1px', '1px', '1px', '0px'],
      fieldBackgrounds: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'],
      labelColors: ['rgb(148, 163, 184)', 'rgb(148, 163, 184)', 'rgb(148, 163, 184)', 'rgb(148, 163, 184)'],
      valueColors: ['rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(192, 132, 252)']
    }, 'Employee summary matches the shared tinted record-summary card');
    assert.equal(await page.$('#competencyRecordsTitle'), null, 'Competency Records heading is removed');

    assert.deepEqual(await page.$$eval('#competencyList .competency-card', cards => cards.map(card => {
      const headerStyle = getComputedStyle(card.querySelector('.competency-card-header'));
      return {
        id: card.dataset.competencyId,
        title: card.querySelector('.competency-card-title').textContent.trim(),
        labels: [...card.querySelectorAll('.competency-card-detail span')].map(node => node.textContent.trim()),
        values: [...card.querySelectorAll('.competency-card-detail strong')].map(node => node.textContent.trim()),
        tag: card.tagName,
        hasArrow: Boolean(card.querySelector('.competency-card-header i')),
        hasDialogSemantics: card.getAttribute('aria-haspopup') === 'dialog' && card.getAttribute('aria-controls') === 'competencyDetailsOverlay',
        purpleHeader: headerStyle.backgroundImage.includes('linear-gradient') && headerStyle.color === 'rgb(255, 255, 255)'
      };
    })), [
      {
        id: 'effective-communication',
        title: 'Effective Communication',
        labels: ['Current Level', 'Need Level', 'Gap', 'Last Assessment Date', 'Skill Expiry Date', 'Remarks'],
        values: ['4', '4', '0', '15 Sep 2026', '14 Sep 2027', 'Consistently communicates clearly across teams.'],
        tag: 'BUTTON',
        hasArrow: false,
        hasDialogSemantics: true,
        purpleHeader: true
      },
      {
        id: 'tunnel-engineering',
        title: 'Tunnel Engineering',
        labels: ['Current Level', 'Need Level', 'Gap', 'Last Assessment Date', 'Skill Expiry Date', 'Remarks'],
        values: ['3', '4', '-1', '08 Aug 2026', '07 Aug 2027', 'Developing capability for complex ground conditions.'],
        tag: 'BUTTON',
        hasArrow: false,
        hasDialogSemantics: true,
        purpleHeader: true
      }
    ]);

    await page.click('[data-competency-id="effective-communication"]');
    assert.deepEqual(await overlayState(page), { hidden: false, ariaHidden: 'false', inertedSiblings: 4 });
    assert.deepEqual(await page.$$eval('#competencyDetailsRows tr', rows => rows.map(row => [
      row.querySelector('.detail-popout-label').textContent.trim(),
      row.querySelector('.detail-popout-value').textContent.trim()
    ])), [
      ['Skill', 'Effective Communication'],
      ['Name', 'Farhan Binti Rahmat'],
      ['Position', 'Group HR Manager'],
      ['Department', 'Human Resource']
    ]);
    assert.equal(await page.$eval('#competencyAssessmentTitle', node => node.textContent.trim()), 'Assessment');
    assert.equal(
      await page.$eval('#competencyAssessmentTitle', node => getComputedStyle(node, '::before').content),
      'none',
      'Assessment heading has no purple accent line'
    );
    assert.equal(await page.$$eval('#competencyAssessmentList .competency-assessment-table', nodes => nodes.length), 2);
    assert.deepEqual(await page.$$eval('#competencyAssessmentList .competency-assessment-table', tables => tables.map(table => ({
      labels: [...table.querySelectorAll('.detail-popout-label')].map(node => node.textContent.trim()),
      values: [...table.querySelectorAll('.detail-popout-value')].map(node => node.textContent.trim())
    }))), [
      {
        labels: ['Assessment Date', 'Level', 'Remark', 'Assessor'],
        values: ['15 Sep 2026', '4', 'Demonstrates strong stakeholder communication.', 'Angeline Loren Alan']
      },
      {
        labels: ['Assessment Date', 'Level', 'Remark', 'Assessor'],
        values: ['12 Sep 2025', '3', 'Good communication with room to improve facilitation.', 'Muhammad Ali Bin Man']
      }
    ]);
    await page.click('#competencyDetailsClose');
    assert.deepEqual(await overlayState(page), { hidden: true, ariaHidden: 'true', inertedSiblings: 0 });
    assert.equal(await page.evaluate(() => document.activeElement.dataset.competencyId), 'effective-communication');

    await page.focus('[data-competency-id="tunnel-engineering"]');
    await page.keyboard.press('Space');
    assert.equal(await page.$eval('#competencyDetailsRows .detail-popout-value', node => node.textContent.trim()), 'Tunnel Engineering');
    await page.keyboard.press('Escape');
    assert.equal((await overlayState(page)).hidden, true);
    assert.equal(await page.evaluate(() => document.activeElement.dataset.competencyId), 'tunnel-engineering');

    await page.click('[data-competency-id="effective-communication"]');
    await page.$eval('#competencyDetailsOverlay', overlay => overlay.click());
    assert.equal((await overlayState(page)).hidden, true, 'Backdrop click closes the details popout');

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
        await open(page, theme);
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert.equal(await page.$eval('#competencyBack', node => node.getAttribute('href')), `../index.html?scope=individual&theme=${theme}`);
        const layout = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          summaryColumns: getComputedStyle(document.getElementById('competencySummary')).gridTemplateColumns.split(' ').length,
          cardCount: document.querySelectorAll('#competencyList .competency-card').length
        }));
        assert.ok(layout.overflow <= 1, `${theme} ${width}px has no horizontal overflow`);
        assert.equal(layout.summaryColumns, 1, `${theme} ${width}px keeps one summary field per row`);
        assert.equal(layout.cardCount, 2);
      }
    }

    assert.deepEqual(pageErrors, [], `Pages should have no JavaScript errors: ${pageErrors.join('; ')}`);
    console.log('PASS: Individual Competency summary, cards, assessment popout, themes and responsive layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
