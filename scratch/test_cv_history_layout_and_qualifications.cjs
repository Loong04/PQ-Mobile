const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const request = {
  id: 'REQ-CV-MULTI', name: 'Farhan Binti Rahmat', empNo: 'EBB12', status: 'Submitted', submittedAt: '2026-10-13', approverRemarks: 'Review both qualifications.',
  profile: {
    personal: { Name: 'Farhan Binti Rahmat', 'Birth Date': '18 Jul 1984', Age: 42, 'Personal Email': 'farhan@example.com' },
    qualification: [
      { id: 'degree-1', Qualification: "Bachelor's Degree", Description: 'Business Administration', Major: 'Human Resources', Institute: 'Universiti Malaya', CGPA: '3.62', 'Year From': 2003, 'Year To': 2006, Highest: 'No' },
      { id: 'degree-2', Qualification: "Master's Degree", Description: 'Master of Business Administration', Major: 'Finance', Institute: 'Universiti Kebangsaan Malaysia', CGPA: '3.85', 'Year From': 2010, 'Year To': 2012, Highest: 'Yes' }
    ]
  },
  changes: [
    { section: 'personal', label: 'Name', oldVal: 'Farhan Binti Rahmat', newVal: 'Farhan Rahmat' },
    { section: 'qualification', qualificationId: 'degree-2', fieldId: 'qual_major', label: 'Major', oldVal: 'Finance', newVal: 'LAW' }
  ]
};

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/history.html')).href;
    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(url + '?category=cv-change-request&theme=' + theme, { waitUntil: 'domcontentloaded' });
      await page.evaluate(row => localStorage.setItem('pq_change_request_history', JSON.stringify([row])), request);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.click('[data-record-id="REQ-CV-MULTI"]');
      const rows = await page.$$eval('[data-cv-tab]', nodes => nodes.map(node => Math.round(node.getBoundingClientRect().top)));
      assert.equal(new Set(rows).size, 1, 'Five CV sections sit in one horizontally scrollable row');
      const personal = await page.$eval('#cv-panel-personal', panel => {
        const metadata = panel.querySelector('.cv-history-metadata');
        const name = panel.querySelector('[data-cv-field="Name"]');
        const changedStyle = getComputedStyle(name.querySelector('.cv-history-field-value'));
        return { framed: getComputedStyle(metadata).borderTopWidth !== '0px', rowColumns: getComputedStyle(name.parentElement).gridTemplateColumns.split(' ').length, metadataColumns: getComputedStyle(metadata.firstElementChild).gridTemplateColumns.split(' ').length, valueAlignment: getComputedStyle(name).textAlign, changedColor: changedStyle.color, markerBorder: changedStyle.borderLeftWidth, markerBackground: changedStyle.backgroundColor };
      });
      assert.deepEqual(personal, { framed: true, rowColumns: 2, metadataColumns: 1, valueAlignment: 'right', changedColor: theme === 'light' ? 'rgb(220, 38, 38)' : 'rgb(248, 113, 113)', markerBorder: '0px', markerBackground: 'rgba(0, 0, 0, 0)' }, 'Changed values use red text without a colored background or marker border');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(__dirname, `cv-history-grouped-personal-${theme}.png`) });
      await page.click('[data-cv-tab="qualification"]');
      const qualificationState = () => page.$eval('#cv-panel-qualification', panel => {
        const toggles = [...panel.querySelectorAll('[data-qualification-card-toggle]')];
        const records = [...panel.querySelectorAll('[data-qualification-card-panel]')];
        const active = records.find(record => !record.hidden);
        const major = active?.querySelector('[data-cv-field="Major"]');
        return {
          labels: toggles.map(toggle => toggle.querySelector('.cv-history-qualification-number')?.textContent.trim()),
          expanded: toggles.map(toggle => toggle.getAttribute('aria-expanded')),
          hidden: records.map(record => record.hidden),
          reciprocalAria: toggles.map(toggle => {
            const record = document.getElementById(toggle.getAttribute('aria-controls'));
            return Boolean(toggle.id && record && record.getAttribute('aria-labelledby') === toggle.id);
          }),
          major: major?.querySelector('.cv-history-field-value').textContent,
          majorChanged: Boolean(major?.classList.contains('cv-history-field-changed')),
          activeText: active?.textContent || ''
        };
      });
      const initial = await qualificationState();
      assert.deepEqual(initial.labels, ['Qualification 1', 'Qualification 2'], 'Every qualification has its own numbered expandable heading');
      assert.deepEqual(initial.expanded, ['false', 'true'], 'Initially open the changed qualification');
      assert.deepEqual(initial.hidden, [true, false]);
      assert.deepEqual(initial.reciprocalAria, [true, true]);
      assert.ok(await page.$$eval('.cv-history-qualification-card', cards => cards.every(card => {
        const style = getComputedStyle(card);
        return Number.parseFloat(style.borderTopWidth) >= 1 && Number.parseFloat(style.borderRadius) >= 16;
      })), 'Qualification groups retain their rounded borders after shared modal normalization');
      assert.equal(initial.major, 'LAW');
      assert.equal(initial.majorChanged, true);
      assert.equal(await page.$('[data-qualification-tab]'), null);
      await page.click('[data-qualification-card-toggle="0"]');
      const first = await qualificationState();
      assert.deepEqual(first.expanded, ['true', 'false']);
      assert.deepEqual(first.hidden, [false, true]);
      assert.equal(first.major, 'Human Resources');
      assert.equal(first.majorChanged, false, 'Changes to the second record never mark the first');
      assert.match(first.activeText, /Universiti Malaya/);
      assert.doesNotMatch(first.activeText, /Universiti Kebangsaan Malaysia/);
      await page.keyboard.press('Enter');
      assert.deepEqual((await qualificationState()).hidden, [true, true], 'An open qualification can be collapsed with the keyboard');
      await page.focus('[data-qualification-card-toggle="1"]');
      await page.keyboard.press('Space');
      const second = await qualificationState();
      assert.deepEqual(second.expanded, ['false', 'true']);
      assert.equal(second.major, 'LAW');
      assert.match(second.activeText, /Universiti Kebangsaan Malaysia/);
      await page.$eval('[data-qualification-card-toggle="1"]', button => button.blur());
      await page.screenshot({ path: path.join(__dirname, `cv-history-multiple-qualifications-${theme}.png`) });
      for (const width of [320, 360, 450]) {
        await page.setViewport({ width, height: 640 });
        for (const tab of ['personal', 'qualification', 'payroll', 'contacts', 'family']) {
          await page.click(`[data-cv-tab="${tab}"]`);
          assert.ok(await page.$eval('#historyDetailBody', node => node.scrollWidth <= node.clientWidth + 1), 'Details fit narrow phones');
          assert.ok(await page.$eval(`[data-cv-tab="${tab}"]`, node => {
            const box = node.getBoundingClientRect();
            const bar = node.closest('.cv-history-detail-tabs').getBoundingClientRect();
            return box.left >= bar.left - 1 && box.right <= bar.right + 1;
          }), 'Every main tab can scroll into view');
          if (tab === 'qualification') {
            assert.ok(await page.$eval('#cv-panel-qualification', panel => {
              const box = panel.getBoundingClientRect();
              return panel.scrollWidth <= panel.clientWidth + 1 && [...panel.querySelectorAll('[data-qualification-card-toggle]')].every(toggle => {
                const target = toggle.getBoundingClientRect();
                return target.height >= 44 && target.left >= box.left - 1 && target.right <= box.right + 1;
              });
            }), 'Expandable qualifications stay touch friendly and fit narrow phones');
          }
        }
      }
      await page.keyboard.press('Escape');
      const many = structuredClone(request);
      many.id = 'REQ-CV-MANY';
      many.changes = [];
      many.profile.qualification = Array.from({ length: 12 }, (_, index) => ({ ...request.profile.qualification[0], id: `degree-${index + 1}`, Qualification: `Degree ${index + 1}` }));
      await page.evaluate(row => localStorage.setItem('pq_change_request_history', JSON.stringify([row])), many);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.click('[data-record-id="REQ-CV-MANY"]');
      await page.click('[data-cv-tab="qualification"]');
      assert.equal(await page.$$eval('[data-qualification-card-toggle]', nodes => nodes.length), 12);
      await page.click('[data-qualification-card-toggle="11"]');
      assert.equal(await page.$eval('[data-qualification-card-panel="11"] [data-cv-field="Qualification"] .cv-history-field-value', node => node.textContent), 'Degree 12');
      assert.equal(await page.$$eval('[data-qualification-card-panel]:not([hidden])', nodes => nodes.length), 1, 'Many qualifications stay individually accessible through vertical scrolling');
      await page.keyboard.press('Escape');
      const ambiguous = structuredClone(request);
      ambiguous.id = 'REQ-CV-UNSCOPED';
      delete ambiguous.changes[1].qualificationId;
      ambiguous.changes.push({ section: 'qualification', label: 'Major', oldVal: 'Human Resources', newVal: 'Talent Management' });
      await page.evaluate(row => localStorage.setItem('pq_change_request_history', JSON.stringify([row])), ambiguous);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.click('[data-record-id="REQ-CV-UNSCOPED"]');
      await page.click('[data-cv-tab="qualification"]');
      assert.deepEqual(await page.$$eval('.cv-history-qualification-card [data-cv-field="Major"] .cv-history-field-value', nodes => nodes.map(node => node.textContent)), ['Human Resources', 'Finance'], 'Unscoped legacy changes do not overwrite unrelated qualifications');
      assert.match(await page.$eval('.cv-history-qualification-unscoped', node => node.textContent), /LAW/);
      assert.match(await page.$eval('.cv-history-qualification-unscoped', node => node.textContent), /Talent Management/, 'Multiple unscoped changes to the same field are all preserved');
      await page.keyboard.press('Escape');
      const legacy = { ...request, id: 'REQ-CV-LEGACY', profile: { qualification: request.profile.qualification[0] }, changes: [{ section: 'qualification', label: 'Major', newVal: 'Business', oldVal: 'Human Resources' }] };
      await page.evaluate(row => localStorage.setItem('pq_change_request_history', JSON.stringify([row])), legacy);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.click('[data-record-id="REQ-CV-LEGACY"]');
      await page.click('[data-cv-tab="qualification"]');
      assert.equal(await page.$$eval('.cv-history-qualification-card', nodes => nodes.length), 1, 'Old single qualification snapshots still render');
      assert.equal(await page.$eval('.cv-history-qualification-card [data-cv-field="Major"] .cv-history-field-value', node => node.textContent), 'Business');
      await page.keyboard.press('Escape');
      const indexed = structuredClone(request);
      indexed.id = 'REQ-CV-INDEXED';
      indexed.profile.qualifications = indexed.profile.qualification;
      delete indexed.profile.qualification;
      delete indexed.changes[1].qualificationId;
      indexed.changes[1].qualificationIndex = 1;
      await page.evaluate(row => localStorage.setItem('pq_change_request_history', JSON.stringify([row])), indexed);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.click('[data-record-id="REQ-CV-INDEXED"]');
      await page.click('[data-cv-tab="qualification"]');
      assert.deepEqual(await page.$$eval('.cv-history-qualification-card [data-cv-field="Major"] .cv-history-field-value', nodes => nodes.map(node => node.textContent)), ['Human Resources', 'LAW'], 'Plural snapshots and indexed changes keep records separate');
      await page.keyboard.press('Escape');
      const added = { ...request, id: 'REQ-CV-NEW-QUAL', profile: {}, changes: [{ section: 'qualification', qualificationId: 'new-degree', label: 'Qualification', newVal: 'Degree' }, { section: 'qualification', qualificationId: 'new-degree', label: 'Major', newVal: 'Business' }] };
      await page.evaluate(row => localStorage.setItem('pq_change_request_history', JSON.stringify([row])), added);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.click('[data-record-id="REQ-CV-NEW-QUAL"]');
      await page.click('[data-cv-tab="qualification"]');
      assert.equal(await page.$$eval('.cv-history-qualification-card', nodes => nodes.length), 1, 'New scoped qualification changes never create a spurious blank record');
      assert.match(await page.$eval('.cv-history-qualification-card', node => node.textContent), /Degree/);
      await page.keyboard.press('Escape');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: Horizontal CV tabs, grouped detail cards, changed-value styling, multiple qualifications, scoped changes, legacy data and both themes.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
