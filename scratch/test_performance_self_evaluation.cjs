const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const url = (file, theme) => pathToFileURL(path.join(root, file)).href + `?theme=${theme}`;

async function navigate(page, selector) {
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click(selector)]);
}

async function setField(page, selector, value) {
  await page.$eval(selector, (control, nextValue) => {
    control.value = nextValue;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(url('modules/performance/index.html', theme), { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => sessionStorage.removeItem('pq_self_evaluation_preview_v1'));
        const entry = await page.$eval('[data-option-id="self-evaluation"]', node => ({ tag: node.tagName, href: node.getAttribute('href') }));
        assert.equal(entry.tag, 'A', 'Self Evaluation must open its implemented form instead of the coming-soon toast');
        assert.ok(entry.href.includes('self-evaluation.html') && entry.href.includes(`theme=${theme}`));
        await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('[data-option-id="self-evaluation"]')]);
        assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Self Evaluation');
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert.equal(await page.$('.self-evaluation-intro'), null, 'Evaluation details row is removed');
        assert.equal(await page.$('#selfEvaluationReadOnly'), null, 'Read Only badge is removed');
        assert.equal(await page.$eval('#selfEvaluationForm', node => node.hasAttribute('aria-describedby')), false, 'Form does not reference the removed badge');
        assert.deepEqual(await page.$$eval('.self-evaluation-section h2', nodes => nodes.map(node => node.textContent.trim())), ['General', 'Goal', 'Competency']);
        assert.deepEqual(await page.$$eval('.self-evaluation-repeat-section', sections => sections.map(section => {
          const style = getComputedStyle(section);
          return {
            title: section.querySelector('h2')?.textContent.trim(),
            borderWidth: style.borderTopWidth,
            radius: style.borderTopLeftRadius,
            background: style.backgroundColor,
            shadow: style.boxShadow
          };
        })), [
          { title: 'Goal', borderWidth: '0px', radius: '0px', background: 'rgba(0, 0, 0, 0)', shadow: 'none' },
          { title: 'Competency', borderWidth: '0px', radius: '0px', background: 'rgba(0, 0, 0, 0)', shadow: 'none' }
        ], 'Goal and Competency use transparent section wrappers');
        assert.deepEqual(await page.$$eval('.self-evaluation-section > .performance-goal-form-header', headers => headers.map(header => {
          const heading = header.querySelector('.self-evaluation-heading');
          const headerStyle = getComputedStyle(header);
          const accentStyle = getComputedStyle(heading, '::before');
          return {
            hasIcon: Boolean(heading.querySelector('i')),
            usesGradient: headerStyle.backgroundImage !== 'none',
            transparentSurface: headerStyle.backgroundColor === 'rgba(0, 0, 0, 0)',
            accentWidth: accentStyle.width,
            accentHeight: accentStyle.height,
            accentColor: accentStyle.backgroundColor
          };
        })), Array.from({ length: 3 }, () => ({
          hasIcon: false,
          usesGradient: false,
          transparentSurface: true,
          accentWidth: '4px',
          accentHeight: '20px',
          accentColor: 'rgb(124, 58, 237)'
        })), 'Section titles use the slim purple accent treatment');
        assert.deepEqual(await page.$$eval('#selfEvaluationGeneral label', nodes => nodes.map(node => node.textContent.trim())), ['Name', 'Position', 'Department', 'Supervisor', 'Report To', 'Evaluation Ref#', 'Period', 'Type']);
        assert.equal(await page.$eval('#selfEvaluationName', node => node.value), 'Farhan Binti Rahmat');
        assert.equal(await page.$eval('#selfEvaluationRef', node => node.value), 'SE-2026-0012');
        assert.equal(await page.$('#selfEvaluationEmployeeId'), null, 'Self Evaluation does not show the employee ID below Name');
        assert.equal(await page.$('#selfEvaluationSupervisorId'), null, 'Self Evaluation does not show the employee ID below Supervisor');
        assert.equal(await page.$('#selfEvaluationReportToId'), null, 'Self Evaluation does not show the employee ID below Report To');
        assert.equal(await page.$$eval('.self-evaluation-employee-id', nodes => nodes.length), 0, 'General does not display employee IDs');
        for (const [section, total] of [['Goal', 2], ['Competency', 3]]) {
          const labels = await page.$$eval(`#selfEvaluation${section}Items .self-evaluation-item`, nodes => nodes.map(node => [...node.querySelectorAll('label')].map(label => label.textContent.trim())));
          assert.ok(labels.length > 0, `${section} displays evaluation records`);
          assert.ok(labels.every(row => JSON.stringify(row) === JSON.stringify(['Title', 'Weightage', 'Rating', 'Remark'])), `${section} displays all four requested fields`);
          assert.deepEqual(await page.$$eval(`#selfEvaluation${section}Items .self-evaluation-item`, nodes => nodes.map((node, index) => {
            const style = getComputedStyle(node);
            const update = node.querySelector('.self-evaluation-update');
            const updateRect = update?.getBoundingClientRect();
            const cardRect = node.getBoundingClientRect();
            return {
              number: node.querySelector('.self-evaluation-item-number')?.textContent.trim() || null,
              independentCard: style.borderTopWidth === '1px' && style.borderTopLeftRadius === '18px' && style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.boxShadow !== 'none',
              noDivider: index === 0 || style.borderTopColor === style.borderRightColor,
              updateTag: update?.tagName || null,
              updateText: update?.textContent.trim() || null,
              updateCompactRight: Boolean(updateRect && updateRect.width < cardRect.width / 2 && cardRect.right - updateRect.right <= 19)
            };
          })), Array.from({ length: total }, (_, index) => ({
            number: `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
            independentCard: true,
            noDivider: true,
            updateTag: 'A',
            updateText: 'Update',
            updateCompactRight: true
          })), `${section} records use separate numbered cards with compact Update links`);
        }
        assert.deepEqual(await page.$eval('#selfEvaluationGoalItems .self-evaluation-item', node => [...node.querySelectorAll('input, textarea')].map(field => field.value)), [
          'Reduce Staff Attrition', '70%', '4 / 5', 'Conducted staff satisfaction surveys and introduced flexible benefits to support retention.'
        ]);
        assert.ok(await page.$$eval('#selfEvaluationForm input, #selfEvaluationForm textarea', nodes => nodes.every(node => node.readOnly)), 'All evaluation values are read-only');
        assert.equal(await page.$$eval('#selfEvaluationForm button, #selfEvaluationForm select, #selfEvaluationForm [contenteditable="true"]', nodes => nodes.length), 0, 'The overview stays read-only');
        assert.equal(await page.$$eval('.self-evaluation-update', nodes => nodes.length), 5, 'Every Goal and Competency card has an Update link');
        const before = await page.evaluate(() => ({
          data: JSON.stringify(window.PERFORMANCE_SELF_EVALUATION),
          local: JSON.stringify(Object.entries(localStorage)),
          session: JSON.stringify(Object.entries(sessionStorage))
        }));
        for (const selector of ['#selfEvaluationName', '#selfEvaluationGoalItems textarea', '#selfEvaluationCompetencyItems textarea']) {
          const value = await page.$eval(selector, node => node.value);
          await page.focus(selector);
          await page.keyboard.down('Control');
          await page.keyboard.press('KeyA');
          await page.keyboard.up('Control');
          await page.keyboard.type('Changed');
          assert.equal(await page.$eval(selector, node => node.value), value, 'Typing cannot change evaluation values');
        }
        assert.ok(await page.$eval('#selfEvaluationForm', form => !form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))), 'Form submission is prevented');
        assert.deepEqual(await page.evaluate(() => ({
          data: JSON.stringify(window.PERFORMANCE_SELF_EVALUATION),
          local: JSON.stringify(Object.entries(localStorage)),
          session: JSON.stringify(Object.entries(sessionStorage))
        })), before, 'Viewing and attempted editing never change records or storage');
        assert.ok(await page.evaluate(() => {
          const content = document.querySelector('.self-evaluation-content');
          return content.scrollWidth <= content.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth;
        }), `${theme} ${width}px has no horizontal overflow`);
        await page.$eval('.self-evaluation-content', node => { node.scrollTop = 0; });
        await page.screenshot({ path: path.join(__dirname, `performance-self-evaluation-general-${theme}-${width}.png`) });
        for (const section of ['Goal', 'Competency']) {
          await page.$eval(`#selfEvaluation${section}`, node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
          await page.screenshot({ path: path.join(__dirname, `performance-self-evaluation-${section.toLowerCase()}-${theme}-${width}.png`) });
        }
        await navigate(page, '#selfEvaluationGoalItems .self-evaluation-update');
        assert.ok(new URL(page.url()).pathname.endsWith('/self-evaluation-item.html'));
        assert.equal(await page.$eval('#selfEvaluationItemPageTitle', node => node.textContent.trim()), 'Update Goal');
        assert.equal(await page.$eval('#selfEvaluationItemSectionTitle', node => node.textContent.trim()), 'Goal');
        assert.equal(await page.$eval('#selfEvaluationItemTitle', node => node.value), 'Reduce Staff Attrition');
        assert.equal(await page.$eval('#selfEvaluationItemWeightage', node => node.value), '70%');
        assert.equal(await page.$eval('#selfEvaluationItemRating', node => node.value), '4');
        assert.equal(await page.$eval('#selfEvaluationItemRemark', node => node.value), 'Conducted staff satisfaction surveys and introduced flexible benefits to support retention.');
        assert.deepEqual(await page.$$eval('#selfEvaluationItemForm input, #selfEvaluationItemForm textarea', nodes => nodes.map(node => node.readOnly)), [true, true, false, false]);
        assert.equal(await page.$$eval('.self-evaluation-employee-id', nodes => nodes.length), 0, 'The Self Evaluation editor does not add employee IDs back');
        await navigate(page, '#selfEvaluationItemCancel');
        assert.equal(await page.$eval('#selfEvaluationGoalItems .self-evaluation-item:first-child [id$="Rating"]', node => node.value), '4 / 5', 'Cancel keeps the original rating');
        assert.equal(await page.evaluate(() => sessionStorage.getItem('pq_self_evaluation_preview_v1')), null, 'Cancel does not save a patch');
        await navigate(page, '#selfEvaluationGoalItems .self-evaluation-update');
        await setField(page, '#selfEvaluationItemRating', '6');
        await page.click('#selfEvaluationItemSave');
        assert.equal(await page.$eval('#selfEvaluationItemError', node => node.textContent.trim()), 'Enter a rating from 0 to 5.');
        await setField(page, '#selfEvaluationItemRating', '4.5');
        await setField(page, '#selfEvaluationItemRemark', 'Updated self evaluation progress.');
        await navigate(page, '#selfEvaluationItemSave');
        assert.equal(await page.$eval('#selfEvaluationGoalItems .self-evaluation-item:first-child [id$="Rating"]', node => node.value), '4.5 / 5');
        assert.equal(await page.$eval('#selfEvaluationGoalItems .self-evaluation-item:first-child textarea[id$="Remark"]', node => node.value), 'Updated self evaluation progress.');
        assert.ok(await page.evaluate(() => sessionStorage.getItem('pq_self_evaluation_preview_v1')?.includes('goal-1')), 'Update saves only the selected Self Evaluation item');
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        await page.click(`[data-set-theme="${nextTheme}"]`);
        assert.ok((await page.$eval('#selfEvaluationBack', node => node.href)).includes(`scope=individual&theme=${nextTheme}`), 'Theme switching updates return navigation');
        await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#selfEvaluationBack')]);
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), nextTheme);
        assert.equal(await page.$eval('#performanceTabIndividual', node => node.getAttribute('aria-selected')), 'true');
      }
    }
    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log('PASS: Self Evaluation multi-card layout, item updates, validation, navigation, themes, and 360/420px layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
