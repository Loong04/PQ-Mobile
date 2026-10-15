const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pageUrl = (theme) => pathToFileURL(path.join(root, 'modules/performance/options/goal-plan.html')).href + `?theme=${theme}`;
const formPageUrl = (theme) => pathToFileURL(path.join(root, 'modules/performance/options/performance-goal.html')).href + `?theme=${theme}`;

async function clickAndExpectFile(page, selector, filename) {
  await page.click(selector);
  await page.waitForFunction(expected => location.pathname.endsWith(`/${expected}`), { timeout: 1500 }, filename).catch(() => {});
  assert.ok(new URL(page.url()).pathname.endsWith(`/${filename}`), `Expected navigation to ${filename}, received ${page.url()}`);
}

async function setField(page, selector, value) {
  await page.$eval(selector, (element, nextValue) => {
    element.value = nextValue;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
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

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(pageUrl(theme), { waitUntil: 'domcontentloaded' });
        assert.equal(await page.$eval('#goalPlanTitle', node => node.textContent.trim()), 'Goal Plan');
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert.deepEqual(await page.$eval('.goal-plan-employee-identity', node => [...node.children].map(child => child.textContent.trim())), ['Farhan Binti Rahmat', '#EBB12']);
        assert.deepEqual(await page.$eval('.goal-plan-employee-card', card => {
          const identity = card.querySelector('.goal-plan-employee-identity');
          const hero = card.querySelector('.goal-plan-profile-hero');
          const appraisal = card.querySelector('.goal-plan-appraisal-dock');
          return {
            sections: [...card.children].map(child => child.className),
            profileSections: [...card.querySelectorAll('.goal-plan-profile-hero > *')].map(child => child.className),
            identityRows: identity ? [...identity.children].map(child => child.textContent.trim()) : [],
            roleText: card.querySelector('.goal-plan-profile-role')?.textContent.replace(/\s+/g, ' ').trim() || null,
            hasDecorativeRoleIcons: Boolean(card.querySelector('.goal-plan-role-icon')),
            reportingPeople: [...card.querySelectorAll('.goal-plan-report-person')].map(person => ({
              avatar: person.querySelector('.goal-plan-report-avatar')?.textContent.trim() || null,
              label: person.querySelector('small')?.textContent.trim() || null,
              name: person.querySelector('strong')?.textContent.trim() || null,
              id: person.querySelector('.goal-plan-person-field > span')?.textContent.trim() || null
            })),
            profileHasMaterial: hero ? getComputedStyle(hero).backdropFilter !== 'none' : false,
            appraisalHasSurface: appraisal ? getComputedStyle(appraisal).backgroundColor !== 'rgba(0, 0, 0, 0)' : false
          };
        }), {
          sections: ['goal-plan-profile-hero', 'goal-plan-reporting-line', 'goal-plan-appraisal-dock'],
          profileSections: ['goal-plan-profile-main', 'goal-plan-profile-role'],
          identityRows: ['Farhan Binti Rahmat', '#EBB12'],
          roleText: 'Group HR Manager Human Resource',
          hasDecorativeRoleIcons: false,
          reportingPeople: [
            { avatar: 'AL', label: 'Supervisor', name: 'Angeline Loren Alan', id: '#EBB04' },
            { avatar: 'MM', label: 'Reporting To', name: 'Muhammad Ali Bin Man', id: '#EBB01' }
          ],
          profileHasMaterial: true,
          appraisalHasSurface: true
        }, 'Profile hero, people-first reporting line and appraisal dock render as distinct layers');
        assert.deepEqual(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.map(card => {
          const target = card.querySelector('.goal-plan-card-target');
          const metric = card.querySelector('.goal-plan-metric');
          const [updateAction, deleteAction] = card.querySelectorAll('.goal-plan-card-actions button');
          const targetStyle = getComputedStyle(target);
          const metricStyle = getComputedStyle(metric);
          const updateStyle = getComputedStyle(updateAction);
          const deleteStyle = getComputedStyle(deleteAction);
          const solidPurple = style => style.backgroundImage.includes('linear-gradient') && style.backgroundImage.includes('rgb(124, 58, 237)') && style.backgroundImage.includes('rgb(109, 40, 217)') && style.color === 'rgb(255, 255, 255)' && style.borderTopWidth === '0px' && style.borderRadius === '20px' && style.boxShadow !== 'none';
          return {
            title: card.querySelector('.goal-plan-card-header .goal-plan-card-title')?.textContent.trim() || null,
            type: card.querySelector('.goal-plan-card-header .goal-plan-card-type')?.textContent.trim() || null,
            hasMenu: Boolean(card.querySelector('.goal-plan-card-menu')),
            bodyHasTitle: Boolean(card.querySelector('.goal-plan-card-body .goal-plan-card-title')),
            bodyLabels: [...card.querySelectorAll('.goal-plan-card-body small')].map(label => label.textContent.trim()),
            actions: [...card.querySelectorAll('.goal-plan-card-actions button')].map(button => button.textContent.trim()),
            actionsSharePurpleStyle: updateStyle.color === deleteStyle.color && updateStyle.backgroundColor === deleteStyle.backgroundColor && updateStyle.borderTopColor === deleteStyle.borderTopColor,
            actionsUseSolidPurpleStyle: solidPurple(updateStyle) && solidPurple(deleteStyle),
            structure: [...card.children].map(child => child.className),
            targetMatchesMetricSurface: targetStyle.borderTopWidth === '1px' && targetStyle.borderTopColor === metricStyle.borderTopColor && targetStyle.borderRadius === '13px' && targetStyle.padding === '9px 10px' && targetStyle.backgroundColor === metricStyle.backgroundColor
          };
        })), [
          { title: 'Reduce Staff Attrition', type: null, hasMenu: false, bodyHasTitle: false, bodyLabels: ['Target', 'Weightage', 'Deadline'], actions: ['Update', 'Delete'], actionsSharePurpleStyle: true, actionsUseSolidPurpleStyle: true, structure: ['goal-plan-card-header', 'goal-plan-card-body', 'goal-plan-card-actions'], targetMatchesMetricSurface: true },
          { title: 'Improve Staff Satisfaction', type: null, hasMenu: false, bodyHasTitle: false, bodyLabels: ['Target', 'Weightage', 'Deadline'], actions: ['Update', 'Delete'], actionsSharePurpleStyle: true, actionsUseSolidPurpleStyle: true, structure: ['goal-plan-card-header', 'goal-plan-card-body', 'goal-plan-card-actions'], targetMatchesMetricSurface: true }
        ], 'Goal cards use the solid purple history-action treatment for Update and Delete');
        assert.equal(await page.$eval('#goalPlanTotalGoals', node => node.textContent.trim()), '2');
        assert.equal(await page.$eval('#goalPlanTotalWeightage', node => node.textContent.trim()), '100.00%');
        assert.deepEqual(await page.evaluate(() => {
          const overviewItems = [...document.querySelectorAll('.goal-plan-overview > .goal-plan-total')];
          const addButton = document.querySelector('#goalPlanAdd');
          const addGlyph = addButton?.querySelector('.goal-plan-add-glyph');
          const topActions = document.querySelector('.goal-plan-top-actions');
          const hero = document.querySelector('.goal-plan-employee-card');
          const first = overviewItems[0]?.getBoundingClientRect();
          const second = overviewItems[1]?.getBoundingClientRect();
          const addRect = addButton?.getBoundingClientRect();
          return {
            hasVisibleStatus: Boolean(document.querySelector('#goalPlanStatus')),
            overviewItemCount: overviewItems.length,
            totalsShareRow: Boolean(first && second && Math.abs(first.top - second.top) <= 1),
            totalsAreEqualWidth: Boolean(first && second && Math.abs(first.width - second.width) <= 1),
            addParent: addButton?.parentElement?.className || null,
            addIsInHeader: Boolean(addButton?.closest('.performance-header-row')),
            headerButtons: [...document.querySelectorAll('.performance-header-row button')].map(button => button.id),
            topActionsBeforeHero: Boolean(topActions && hero && topActions.nextElementSibling === hero),
            addHasTextLabel: addButton?.textContent.includes('Add Goal') || false,
            addGlyph: addGlyph?.textContent.trim() || null,
            addHasComfortableTarget: Boolean(addRect && addRect.width >= 40 && addRect.height >= 40 && Math.abs(addRect.width - addRect.height) <= 1),
            addGlyphSize: addGlyph ? Math.round(parseFloat(getComputedStyle(addGlyph).fontSize)) : null,
            addLabel: addButton?.getAttribute('aria-label') || null,
            hasListHeading: Boolean(document.querySelector('.goal-plan-list-heading')),
            hasVisibleListTitle: Boolean(document.querySelector('#goalPlanListTitle')),
            hasVisibleListCount: Boolean(document.querySelector('#goalPlanListCount')),
            goalListLabel: document.querySelector('section[aria-label="Performance Goals"]')?.getAttribute('aria-label') || null
          };
        }), {
          hasVisibleStatus: false,
          overviewItemCount: 2,
          totalsShareRow: true,
          totalsAreEqualWidth: true,
          addParent: 'goal-plan-list-heading',
          addIsInHeader: false,
          headerButtons: [],
          topActionsBeforeHero: false,
          addHasTextLabel: false,
          addGlyph: '+',
          addHasComfortableTarget: true,
          addGlyphSize: 20,
          addLabel: 'Add Goal',
          hasListHeading: true,
          hasVisibleListTitle: true,
          hasVisibleListCount: false,
          goalListLabel: 'Performance Goals'
        }, 'Add Goal is an accessible plus-only button beside the Performance Goals heading, while totals stay equal in width');
        assert.deepEqual(await page.evaluate(() => {
          const target = document.querySelector('.goal-plan-card-target');
          const content = document.querySelector('.goal-plan-content').getBoundingClientRect();
          const footerNode = document.querySelector('.goal-plan-footer');
          const footer = footerNode.getBoundingClientRect();
          const footerStyle = getComputedStyle(footerNode);
          const buttonRects = [...footerNode.querySelectorAll('button')].map(button => button.getBoundingClientRect());
          const footerButtons = [...footerNode.querySelectorAll('button')].map(button => {
            const style = getComputedStyle(button);
            const rect = button.getBoundingClientRect();
            return {
              label: button.textContent.trim(),
              moderateHeight: rect.height === 40,
              solidPurple: style.backgroundImage.includes('linear-gradient') && style.backgroundImage.includes('rgb(124, 58, 237)') && style.backgroundImage.includes('rgb(109, 40, 217)') && style.color === 'rgb(255, 255, 255)' && style.borderTopWidth === '0px'
            };
          });
          return {
            targetDisplay: getComputedStyle(target).display,
            footerPosition: footerStyle.position,
            footerLayout: footerStyle.display,
            footerIntegratedSurface: footer.width >= innerWidth - 1 && footerStyle.borderTopWidth === '1px' && footerStyle.borderRadius === '0px' && footerStyle.backgroundColor !== 'rgba(0, 0, 0, 0)',
            footerButtonsEqualWidth: buttonRects.length === 2 && Math.abs(buttonRects[0].width - buttonRects[1].width) <= 1,
            footerButtons,
            contentEndsBeforeFooter: content.bottom <= footer.top + 1
          };
        }), {
          targetDisplay: 'block',
          footerPosition: 'relative',
          footerLayout: 'grid',
          footerIntegratedSurface: true,
          footerButtonsEqualWidth: true,
          footerButtons: [
            { label: 'Save Draft', moderateHeight: true, solidPurple: true },
            { label: 'Submit', moderateHeight: true, solidPurple: true }
          ],
          contentEndsBeforeFooter: true
        }, 'A full-width bottom action bar gives Save Draft and Submit the same solid-purple treatment');
        assert.ok(await page.evaluate(() => {
          const main = document.querySelector('.goal-plan-content');
          return main.scrollWidth <= main.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth;
        }), `${theme} ${width}px has no horizontal overflow`);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(__dirname, `performance-goal-plan-${theme}-${width}.png`) });
      }
    }

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844 });
        await page.goto(formPageUrl(theme), { waitUntil: 'domcontentloaded' });
        assert.equal(await page.$eval('#performanceGoalTitle', node => node.textContent.trim()), 'Performance Goal');
        assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
        assert.deepEqual(await page.evaluate((activeTheme) => {
          const content = document.querySelector('.performance-goal-content');
          const form = document.querySelector('.performance-goal-form');
          const formHeader = document.querySelector('.performance-goal-form-header');
          const body = document.querySelector('.goal-form-body');
          const footer = document.querySelector('.goal-form-footer');
          const buttons = [...footer.querySelectorAll('button')];
          const formStyle = getComputedStyle(form);
          const bodyStyle = getComputedStyle(body);
          const cancelStyle = getComputedStyle(buttons[0]);
          const buttonRects = buttons.map(button => button.getBoundingClientRect());
          return {
            hasInnerHeader: Boolean(formHeader),
            startsWithGoalTitle: form.firstElementChild === body && body.querySelector('.goal-form-field > label').textContent.replace('*', '').trim() === 'Goal Title',
            formIsPageCard: formStyle.borderRadius === '22px' && formStyle.borderBottomWidth === '1px' && formStyle.overflow === 'visible',
            bodyScrollsWithPage: bodyStyle.overflowY === 'visible',
            actions: buttons.map(button => button.textContent.trim()),
            actionsAreEqual: buttonRects.length === 2 && Math.abs(buttonRects[0].width - buttonRects[1].width) <= 1 && buttonRects.every(rect => rect.height >= 44),
            cancelUsesStandardStyle: buttons[0].classList.contains('form-cancel-btn')
              && cancelStyle.borderRadius === '999px'
              && cancelStyle.backgroundImage === 'none'
              && cancelStyle.backgroundColor === (activeTheme === 'light' ? formStyle.backgroundColor : 'rgb(23, 21, 41)'),
            noHorizontalOverflow: content.scrollWidth <= content.clientWidth + 1 && document.documentElement.scrollWidth <= innerWidth
          };
        }, theme), {
          hasInnerHeader: false,
          startsWithGoalTitle: true,
          formIsPageCard: true,
          bodyScrollsWithPage: true,
          actions: ['Cancel', 'Save'],
          actionsAreEqual: true,
          cancelUsesStandardStyle: true,
          noHorizontalOverflow: true
        }, `${theme} ${width}px standalone form uses the page-card design without overflow`);
        await page.screenshot({ path: path.join(__dirname, `performance-goal-form-${theme}-${width}.png`) });
      }
    }

    await page.setViewport({ width: 420, height: 844 });
    await page.goto(pageUrl('dark'), { waitUntil: 'domcontentloaded' });
    assert.equal(await page.$('#goalFormOverlay'), null, 'Goal Plan no longer keeps the legacy edit overlay');
    await page.click('#goalPlanCards .goal-plan-card-body');
    assert.equal(await page.$eval('#goalDetailsOverlay', node => node.hidden), false, 'Card opens goal details');
    assert.equal(await page.$eval('#goalDetailsRows tr:first-child td', node => node.textContent.trim()), 'Reduce Staff Attrition');
    await page.click('#goalDetailsClose');

    await clickAndExpectFile(page, '#goalPlanAdd', 'performance-goal.html');
    assert.equal(await page.$eval('#performanceGoalTitle', node => node.textContent.trim()), 'Performance Goal');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'Add keeps the selected theme');
    assert.equal(await page.$('#goalFormOverlay'), null, 'Add uses a page instead of the Goal Plan overlay');
    assert.equal(await page.$$eval('.performance-header-row :is(button, .performance-info)', nodes => nodes.length), 0, 'The form header stays clean');
    assert.deepEqual(await page.$$eval('#goalForm .goal-form-field > label', nodes => nodes.map(node => node.textContent.replace('*', '').trim())), [
      'Goal Title', 'Goal Type', 'Goal Description', 'Target Description', 'Deadline', 'Weightage', 'Budget Hours', 'Remark'
    ]);

    await setField(page, '#goalTitleInput', 'Discarded by Cancel');
    await clickAndExpectFile(page, '#goalFormCancel', 'goal-plan.html');
    assert.equal(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.length), 2, 'Cancel returns without creating a goal');
    assert.equal(await page.$eval('#goalPlanTotalWeightage', node => node.textContent.trim()), '100.00%');

    await clickAndExpectFile(page, '#goalPlanAdd', 'performance-goal.html');
    await setField(page, '#goalTitleInput', 'Discarded by Back');
    await clickAndExpectFile(page, '#performanceGoalBack', 'goal-plan.html');
    assert.equal(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.length), 2, 'Back returns without creating a goal');

    await clickAndExpectFile(page, '#goalPlanAdd', 'performance-goal.html');
    await page.click('#goalFormSave');
    assert.equal(await page.$eval('#goalFormError', node => node.textContent.trim()), 'Goal Title is required.');

    await setField(page, '#goalTitleInput', 'Strengthen Succession Readiness');
    await setField(page, '#goalTypeInput', 'Learning & Growth');
    await setField(page, '#goalDescriptionInput', 'Build a ready-now successor pool for critical HR roles.');
    await setField(page, '#goalTargetInput', 'Base Target: 85%\nStretch Target: 95%');
    await setField(page, '#goalDeadlineInput', '2026-12-31');
    await setField(page, '#goalWeightageInput', '10');
    await setField(page, '#goalBudgetHoursInput', '24');
    await setField(page, '#goalRemarkInput', 'Quarterly talent review.');
    await clickAndExpectFile(page, '#goalFormSave', 'goal-plan.html');
    assert.equal(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.length), 3, 'Save returns with one new goal card');
    assert.equal(await page.$eval('#goalPlanCards .goal-plan-card:last-child .goal-plan-card-title', node => node.textContent.trim()), 'Strengthen Succession Readiness', 'Saved goal data is handed back to Goal Plan');
    assert.equal(await page.$eval('#goalPlanTotalWeightage', node => node.textContent.trim()), '110.00%');

    await clickAndExpectFile(page, '#goalPlanCards .goal-plan-card:last-child .goal-plan-card-update', 'performance-goal.html');
    assert.equal(await page.$eval('#performanceGoalTitle', node => node.textContent.trim()), 'Update Performance Goal');
    assert.equal(await page.$('.performance-goal-form-header'), null, 'Update page has no inner purple header');
    assert.equal(await page.$eval('#goalFormSave span', node => node.textContent.trim()), 'Save');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'Update keeps the selected theme');
    assert.equal(await page.$eval('#goalTitleInput', node => node.value), 'Strengthen Succession Readiness');
    assert.equal(await page.$eval('#goalTypeInput', node => node.value), 'Learning & Growth');
    assert.equal(await page.$eval('#goalWeightageInput', node => node.value), '10');
    await setField(page, '#goalTitleInput', 'Discarded Update');
    await clickAndExpectFile(page, '#goalFormCancel', 'goal-plan.html');
    assert.equal(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.length), 3, 'Cancel edit keeps the same number of goals');
    assert.equal(await page.$eval('#goalPlanCards .goal-plan-card:last-child .goal-plan-card-title', node => node.textContent.trim()), 'Strengthen Succession Readiness', 'Cancel edit keeps the original goal');

    await clickAndExpectFile(page, '#goalPlanCards .goal-plan-card:last-child .goal-plan-card-update', 'performance-goal.html');
    await setField(page, '#goalTitleInput', 'Strengthen Leadership Pipeline');
    await clickAndExpectFile(page, '#goalFormSave', 'goal-plan.html');
    assert.equal(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.length), 3, 'Update replaces the goal without adding a duplicate');
    assert.equal(await page.$eval('#goalPlanCards .goal-plan-card:last-child .goal-plan-card-title', node => node.textContent.trim()), 'Strengthen Leadership Pipeline', 'Update page changes the original card');

    await page.click('#goalPlanCards .goal-plan-card:last-child .goal-plan-card-delete');
    await page.click('#goalDeleteConfirm');
    assert.equal(await page.$$eval('#goalPlanCards .goal-plan-card', cards => cards.length), 2, 'Delete removes the goal');
    assert.equal(await page.$eval('#goalPlanTotalWeightage', node => node.textContent.trim()), '100.00%');

    await page.click('#goalPlanSaveDraft');
    assert.ok(await page.$eval('#goalPlanToast', node => node.classList.contains('show') && node.textContent.includes('draft')));
    await page.click('#goalPlanSubmit');
    assert.ok(await page.$eval('#goalPlanToast', node => node.classList.contains('show') && node.textContent.includes('submitted')));

    assert.deepEqual(errors, [], 'No browser JavaScript errors');
    console.log('PASS: Goal Plan cards, standalone add/update forms, employee ID, details, CRUD, draft, submit, themes and responsive layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
