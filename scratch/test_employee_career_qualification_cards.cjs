const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pendingUrl = pathToFileURL(path.resolve(
  __dirname,
  '../modules/employee-career/options/pending-approval.html'
)).href;

const qualifications = [
  {
    id: 'qualification-certificate',
    Qualification: 'Certificate in People Management',
    Description: 'Foundation programme',
    Major: 'People Operations',
    Institute: 'People Quest Academy',
    CGPA: '3.20',
    'Year From': 2010,
    'Year To': 2011,
    Highest: 'No'
  },
  {
    id: 'qualification-diploma',
    Qualification: 'Diploma in Business Studies',
    Description: 'Business programme',
    Major: 'Business Administration',
    Institute: 'Kolej Universiti Contoh',
    CGPA: '3.45',
    'Year From': 2011,
    'Year To': 2013,
    Highest: 'No'
  },
  {
    id: 'qualification-degree',
    Qualification: "Bachelor's Degree",
    Description: 'Bachelor of Business Administration',
    Major: 'Human Resource Management',
    Institute: 'Universiti Malaya',
    CGPA: '3.62',
    'Year From': 2013,
    'Year To': 2016,
    Highest: 'Yes'
  },
  {
    id: 'duplicate-record-id',
    Qualification: "Master's Degree",
    Description: 'Master of Business Administration',
    Major: 'Strategic Management',
    Institute: 'Universiti Kebangsaan Malaysia',
    CGPA: '3.75',
    'Year From': 2017,
    'Year To': 2019,
    Highest: 'No'
  },
  {
    id: 'duplicate-record-id',
    Qualification: 'Professional HR Certification',
    Description: 'Professional certification',
    Major: 'Talent Development',
    Institute: 'Malaysian HR Institute',
    CGPA: '',
    'Year From': 2020,
    'Year To': 2021,
    Highest: 'No'
  }
];

const degreeChanges = [
  {
    section: 'qualification',
    qualificationId: 'qualification-degree',
    label: 'Major',
    oldVal: 'Human Resource Management',
    newVal: 'People Analytics'
  },
  {
    section: 'qualification',
    qualificationId: 'qualification-degree',
    label: 'CGPA',
    oldVal: '3.62',
    newVal: '3.72'
  }
];

async function mountQualificationCards(page, records, changes = []) {
  await page.evaluate(({ records, changes }) => {
    const source = window.EMPLOYEE_CAREER_PENDING_DATA[0];
    const row = structuredClone(source);
    row.profile = { ...row.profile, qualifications: records };
    delete row.profile.qualification;
    row.changes = changes;
    const body = document.querySelector('#careerPendingDetails .payroll-approval-details-body');
    body.innerHTML = window.EmployeeCareerCVHistoryDetails.render(
      row,
      'Submitted',
      '13/10/2026',
      { qualificationLayout: 'cards' }
    );
    window.EmployeeCareerCVHistoryDetails.selectTab(body, 'qualification');
  }, { records, changes });
}

async function accordionState(page) {
  return page.$eval('#cv-panel-qualification', panel => {
    const cards = [...panel.querySelectorAll('.cv-history-qualification-card')];
    const toggles = [...panel.querySelectorAll('[data-qualification-card-toggle]')];
    const regions = [...panel.querySelectorAll('[data-qualification-card-panel]')];
    return {
      cardCount: cards.length,
      toggleCount: toggles.length,
      regionCount: regions.length,
      nestedTabs: panel.querySelectorAll('[role="tablist"], [data-qualification-tab]').length,
      toggleTags: toggles.map(toggle => toggle.tagName),
      toggleTypes: toggles.map(toggle => toggle.type),
      expanded: toggles.map(toggle => toggle.getAttribute('aria-expanded')),
      hidden: regions.map(region => region.hidden),
      toggleIds: toggles.map(toggle => toggle.id),
      regionIds: regions.map(region => region.id),
      reciprocalAria: toggles.map(toggle => {
        const region = document.getElementById(toggle.getAttribute('aria-controls'));
        return Boolean(
          toggle.id &&
          region &&
          region.matches('[data-qualification-card-panel]') &&
          region.getAttribute('aria-labelledby') === toggle.id
        );
      }),
      summaryText: toggles.map(toggle => toggle.textContent.replace(/\s+/g, ' ').trim()),
      counts: toggles.map(toggle => toggle.querySelector('.cv-history-qualification-count')?.textContent.trim() || ''),
      changedFields: regions.map(region => (
        [...region.querySelectorAll('[data-cv-field].cv-history-field-changed')]
          .map(field => field.dataset.cvField)
      )),
      focusedIndex: toggles.indexOf(document.activeElement)
    };
  });
}

async function assertOnlyExpanded(page, expectedIndex, message) {
  const state = await accordionState(page);
  assert.deepEqual(
    state.expanded,
    state.expanded.map((_, index) => String(index === expectedIndex)),
    message
  );
  assert.deepEqual(
    state.hidden,
    state.hidden.map((_, index) => index !== expectedIndex),
    message + ' and keeps exactly one details region visible'
  );
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });

  try {
    for (const theme of ['light', 'dark']) {
      for (const width of [360, 420]) {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.setViewport({ width, height: 960 });
        await page.goto(`${pendingUrl}?theme=${theme}`, { waitUntil: 'domcontentloaded' });

        await page.click('.career-pending-review');
        await page.waitForSelector('#careerPendingDetails', { visible: true });
        await page.click('[data-cv-tab="qualification"]');

        const livePendingState = await accordionState(page);
        assert.equal(livePendingState.nestedTabs, 0, 'Pending Approval must not use nested qualification tabs');
        assert.equal(livePendingState.cardCount, 2, 'The two live qualification records render as expandable cards');
        assert.deepEqual(livePendingState.counts, ['0 changes', '3 changes']);
        assert.deepEqual(livePendingState.expanded, ['false', 'true'], 'The first changed live record opens initially');
        assert.ok(livePendingState.summaryText[0].includes("Bachelor's Degree"));
        assert.ok(livePendingState.summaryText[0].includes('Universiti Malaya'));
        assert.ok(livePendingState.summaryText[1].includes('Diploma'));
        assert.ok(livePendingState.summaryText[1].includes('Kolej Universiti Contoh'));
        await page.screenshot({
          path: path.join(__dirname, `employee-career-qualification-cards-${theme}-${width}.png`)
        });

        await mountQualificationCards(page, []);
        const empty = await accordionState(page);
        assert.deepEqual(
          { cards: empty.cardCount, toggles: empty.toggleCount, regions: empty.regionCount, nestedTabs: empty.nestedTabs },
          { cards: 0, toggles: 0, regions: 0, nestedTabs: 0 },
          'Zero qualifications render no empty accordion controls'
        );
        assert.equal(
          await page.$eval('#cv-panel-qualification .cv-history-empty-members', node => node.textContent.trim()),
          'No qualification records'
        );

        await mountQualificationCards(page, qualifications.slice(0, 1));
        const single = await accordionState(page);
        assert.deepEqual(
          { cards: single.cardCount, toggles: single.toggleCount, regions: single.regionCount, nestedTabs: single.nestedTabs },
          { cards: 1, toggles: 1, regions: 1, nestedTabs: 0 },
          'One qualification is still represented by one expandable card without a nested tab rail'
        );
        assert.deepEqual(single.expanded, ['true'], 'A sole qualification opens by default');
        assert.deepEqual(single.hidden, [false]);
        assert.deepEqual(single.toggleTags, ['BUTTON']);
        assert.deepEqual(single.toggleTypes, ['button']);
        assert.deepEqual(single.counts, ['0 changes']);
        for (const value of ['Certificate in People Management', 'People Quest Academy', '2010', '2011']) {
          assert.ok(single.summaryText[0].includes(value), `The single-card summary includes ${value}`);
        }

        await mountQualificationCards(page, qualifications.slice(0, 2));
        const pair = await accordionState(page);
        assert.equal(pair.nestedTabs, 0);
        assert.deepEqual(pair.expanded, ['true', 'false'], 'Without changes, the first of multiple records opens initially');
        assert.deepEqual(pair.hidden, [false, true]);
        assert.deepEqual(pair.counts, ['0 changes', '0 changes']);
        const pairToggles = await page.$$('[data-qualification-card-toggle]');
        await pairToggles[1].click();
        await assertOnlyExpanded(page, 1, 'Clicking another qualification expands it and collapses the previous card');

        await mountQualificationCards(page, qualifications, degreeChanges);
        const five = await accordionState(page);
        assert.equal(five.nestedTabs, 0, 'Five qualifications remain vertical cards, never nested tabs');
        assert.deepEqual(
          { cards: five.cardCount, toggles: five.toggleCount, regions: five.regionCount },
          { cards: 5, toggles: 5, regions: 5 }
        );
        assert.deepEqual(five.toggleTags, ['BUTTON', 'BUTTON', 'BUTTON', 'BUTTON', 'BUTTON']);
        assert.deepEqual(five.toggleTypes, ['button', 'button', 'button', 'button', 'button']);
        assert.deepEqual(five.expanded, ['false', 'false', 'true', 'false', 'false'], 'The first record with requested changes opens initially');
        assert.deepEqual(five.hidden, [true, true, false, true, true]);
        assert.deepEqual(five.counts, ['0 changes', '0 changes', '2 changes', '0 changes', '0 changes']);
        assert.deepEqual(five.changedFields, [[], [], ['Major', 'CGPA'], [], []], 'Changed fields remain scoped to their qualification record');
        assert.equal(new Set(five.toggleIds).size, 5, 'Every accordion summary has a unique DOM id');
        assert.equal(new Set(five.regionIds).size, 5, 'Every accordion details region has a unique DOM id even when source record ids repeat');
        assert.ok(five.toggleIds.every(Boolean));
        assert.ok(five.regionIds.every(Boolean));
        assert.deepEqual(five.reciprocalAria, [true, true, true, true, true], 'Every summary and region has reciprocal ARIA references');

        const expectedSummaries = [
          ['Certificate in People Management', 'People Quest Academy', '2010', '2011'],
          ['Diploma in Business Studies', 'Kolej Universiti Contoh', '2011', '2013'],
          ["Bachelor's Degree", 'Universiti Malaya', '2013', '2016', 'Highest'],
          ["Master's Degree", 'Universiti Kebangsaan Malaysia', '2017', '2019'],
          ['Professional HR Certification', 'Malaysian HR Institute', '2020', '2021']
        ];
        expectedSummaries.forEach((values, index) => values.forEach(value => {
          assert.ok(five.summaryText[index].includes(value), `Qualification ${index + 1} summary includes ${value}`);
        }));

        const fiveToggles = await page.$$('[data-qualification-card-toggle]');
        await fiveToggles[0].click();
        await assertOnlyExpanded(page, 0, 'Pointer activation changes the open qualification');

        await fiveToggles[1].focus();
        await page.keyboard.press('Enter');
        await assertOnlyExpanded(page, 1, 'Enter natively activates a qualification summary button');
        assert.equal((await accordionState(page)).focusedIndex, 1);

        await fiveToggles[4].focus();
        await page.keyboard.press('Space');
        await assertOnlyExpanded(page, 4, 'Space natively activates a qualification summary button');
        assert.equal((await accordionState(page)).focusedIndex, 4);

        const layout = await page.$eval('#cv-panel-qualification', panel => {
          const sheet = panel.closest('.payroll-approval-panel');
          const cards = [...panel.querySelectorAll('.cv-history-qualification-card')];
          const summaries = [...panel.querySelectorAll('[data-qualification-card-toggle]')];
          const sheetBox = sheet.getBoundingClientRect();
          const cardTops = cards.map(card => Math.round(card.getBoundingClientRect().top));
          return {
            cardsStackVertically: cardTops.every((top, index) => index === 0 || top > cardTops[index - 1]),
            summariesInsideSheet: summaries.every(summary => {
              const box = summary.getBoundingClientRect();
              return box.left >= sheetBox.left - 1 && box.right <= sheetBox.right + 1;
            }),
            summaryHeights: summaries.map(summary => summary.getBoundingClientRect().height),
            panelNoXOverflow: panel.scrollWidth <= panel.clientWidth + 1,
            sheetNoXOverflow: sheet.scrollWidth <= sheet.clientWidth + 1
          };
        });
        assert.equal(layout.cardsStackVertically, true, 'All five qualification cards form one vertical stack');
        assert.equal(layout.summariesInsideSheet, true, 'All five summaries stay within the approval sheet width');
        assert.ok(layout.summaryHeights.every(height => height >= 44), 'Every qualification summary remains touch friendly');
        assert.equal(layout.panelNoXOverflow, true, 'Five qualification cards do not widen their panel');
        assert.equal(layout.sheetNoXOverflow, true, 'Five qualification cards do not introduce horizontal sheet overflow');
        assert.deepEqual(errors, []);
        await page.close();
      }
    }

    console.log('PASS: Pending Approval qualification cards cover 0, 1, 2 and 5 records in both themes at 360px and 420px.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
