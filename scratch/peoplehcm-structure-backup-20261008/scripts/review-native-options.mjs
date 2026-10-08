/** Independent production regression of native option queries and preserved steps. */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.WEB_URL || 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu'],
});
const context = await browser.createBrowserContext();
const page = await context.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.setRequestInterception(true);
page.on('request', (request) =>
  request.url().startsWith(base) || request.url().startsWith('data:')
    ? request.continue()
    : request.abort(),
);
const errors = [];
page.on('pageerror', (error) => errors.push({ url: page.url(), message: error.message }));
const results = [];
const pause = (milliseconds) =>
  new Promise((resolvePause) => setTimeout(resolvePause, milliseconds));
async function check(name, run) {
  try {
    const evidence = await run();
    results.push({ name, passed: true, evidence });
    console.log('PASS ' + name + ': ' + JSON.stringify(evidence));
  } catch (error) {
    results.push({ name, passed: false, error: error.stack });
    console.log('FAIL ' + name + ': ' + error.message);
  }
}
async function ready(path) {
  await page.goto(base + '/workspace/' + path, { waitUntil: 'load' });
  await page.waitForSelector('.business-outlet .phone-container', { timeout: 10000 });
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-web-mounted'));
  await pause(180);
  assert.equal(await page.$$eval('iframe', (nodes) => nodes.length), 0);
  assert.equal(page.frames().length, 1);
}
async function visible(selector) {
  await page.waitForFunction(
    (selector) => {
      const element = document.querySelector(selector);
      return (
        element &&
        element.getBoundingClientRect().width > 0 &&
        element.getBoundingClientRect().height > 0 &&
        getComputedStyle(element).visibility !== 'hidden'
      );
    },
    { timeout: 6000 },
    selector,
  );
}
async function values(selector) {
  return page.$$eval(
    selector + ' input,' + selector + ' select,' + selector + ' textarea',
    (controls) =>
      controls.map((control) => ({
        id: control.id,
        value: control.value,
        options: control.options
          ? [...control.options].map((option) => ({
              value: option.value,
              text: option.textContent,
            }))
          : null,
      })),
  );
}

try {
  await check(
    'Leave Credit direct entry, complete controls, bilingual draft preservation',
    async () => {
      await ready('leave.html?webView=details&webSection=viewCreditLeaveForm');
      await visible('#viewCreditLeaveForm');
      assert.equal(
        await page.$eval('#viewLeaveHub', (element) => getComputedStyle(element).display),
        'none',
      );
      const controls = await values('#viewCreditLeaveForm');
      assert(controls.length >= 8, 'Credit Leave retains its source fields');
      const remarks = await page.$('#viewCreditLeaveForm textarea');
      assert(remarks);
      await remarks.type('Independent native credit draft 004177');
      const before = await values('#viewCreditLeaveForm');
      await page.click('.language-button');
      await page.waitForFunction(() => document.documentElement.lang === 'zh-CN');
      assert.deepEqual(await values('#viewCreditLeaveForm'), before);
      assert.equal(
        await page.$eval('body', (element) => element.classList.contains('dark-mode')),
        false,
      );
      await page.click('.topbar-tools > .icon-button:not(.notification-button)');
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
      assert.equal(
        await page.$eval('body', (element) => element.classList.contains('dark-mode')),
        true,
      );
      assert.deepEqual(await values('#viewCreditLeaveForm'), before);
      await page.click('.language-button');
      await page.waitForFunction(() => document.documentElement.lang === 'en');
      return { controls: controls.length, bilingualValuesPreserved: true, bodyThemeUpdated: true };
    },
  );

  await check('Time Off direct entry and original hours calculation', async () => {
    await ready('leave.html?webView=details&webSection=viewApplyOffTimeForm');
    await visible('#viewApplyOffTimeForm');
    await page.$eval('#timeOffEndTime', (element) => {
      element.value = '10:30';
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.$eval('#timeOffHoursInput', (element) => element.value), '1.50');
    await page.select('#timeOffReasonSelect', 'personal');
    await page.type('#timeOffRemarksTextarea', 'Independent native Time Off draft');
    const before = await values('#viewApplyOffTimeForm');
    await page.click('.language-button');
    await page.waitForFunction(() => document.documentElement.lang === 'zh-CN');
    assert.deepEqual(await values('#viewApplyOffTimeForm'), before);
    await page.click('.language-button');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    return {
      controls: before.length,
      calculatedHours: '1.50',
      selectedReason: 'personal',
      draftPreserved: true,
    };
  });

  await check('Functional query favourite reopens Time Off', async () => {
    await page.click('.business-actions > button');
    const favourite = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('peoplehcm:web:favourites:v1') || '[]'),
    );
    assert(favourite.some((path) => path.includes('webSection=viewApplyOffTimeForm')));
    await page.goto(base + '/#/favourites', { waitUntil: 'load' });
    await page.waitForSelector('.directory');
    const opened = await page.evaluate(() => {
      const button = [...document.querySelectorAll('.directory button')].find((element) =>
        element.textContent.trim().startsWith('Time Off'),
      );
      button?.click();
      return !!button;
    });
    assert(opened, 'Favourite has the actual function title');
    await page.waitForSelector('.business-outlet .phone-container');
    await visible('#viewApplyOffTimeForm');
    assert(page.url().includes('webSection=viewApplyOffTimeForm'));
    return {
      savedFunctionPath: favourite.find((path) => path.includes('webSection=viewApplyOffTimeForm')),
      reopenedFunction: 'Time Off',
    };
  });

  await check('Native toolbar Back preserves Leave form to entitlement step', async () => {
    await page.goto(base + '/#/module/leave', { waitUntil: 'load' });
    await page.waitForSelector('.module-workspace');
    await page.click('.module-option[data-option-id="leave-individual-leave"]');
    await page.waitForSelector('.business-outlet .phone-container');
    await visible('#viewApplyLeave');
    await page.click('#viewApplyLeave .leave-list-item[data-type="annual"] .btn-apply-sm');
    await visible('#viewApplyLeaveForm');
    await page.type('#viewApplyLeaveForm textarea', 'Keep in-progress Annual Leave draft');
    const before = await values('#viewApplyLeaveForm');
    const current = page.url();
    await page.click('.business-title > button');
    await visible('#viewApplyLeave');
    assert.equal(page.url(), current, 'Desktop Back stays in the original document step');
    assert.equal(
      await page.$eval('#viewApplyLeaveForm', (element) => getComputedStyle(element).display),
      'none',
    );
    assert.deepEqual(await values('#viewApplyLeaveForm'), before);
    await page.click('.business-title > button');
    await visible('#viewLeaveHub');
    assert.equal(page.url(), current);
    return {
      sequence: 'Leave form → Leave entitlements → Leave hub',
      stayedInOriginalDocument: true,
      draftPreserved: true,
    };
  });

  await check('Profile anchor uses browser document scrolling', async () => {
    await ready('me.html?webView=details&scroll=bento-training');
    const geometry = await page.evaluate(() => ({
      windowY: scrollY,
      documentHeight: document.documentElement.scrollHeight,
      targetTop: document.getElementById('bento-training').getBoundingClientRect().top,
      internalTop: document.getElementById('meMainScroll').scrollTop,
      internalOverflow: getComputedStyle(document.getElementById('meMainScroll')).overflowY,
    }));
    assert(geometry.windowY > 300, 'Profile route scrolls the browser window');
    assert(
      geometry.targetTop >= 0 && geometry.targetTop < 200,
      'Requested category is at the visible top',
    );
    await page.evaluate(() =>
      document.querySelector('.me-jump-pill[onclick*="bento-personal"]').click(),
    );
    await page.waitForFunction(() => {
      const top = document.getElementById('bento-personal').getBoundingClientRect().top;
      return top >= 0 && top < 200;
    });
    return { ...geometry, categoryClickUsesWindow: true };
  });

  await check('Claims team calendar survives source load initializer', async () => {
    await ready('modules/claims/index.html?webView=details&scope=team');
    await visible('#scopeTeamSection');
    assert.equal(
      await page.$eval('#scopeIndividualSection', (element) => getComputedStyle(element).display),
      'none',
    );
    assert(await page.$eval('#tabClaimTeam', (element) => element.classList.contains('active')));
    const state = await page.evaluate(() => ({
      readyState: document.readyState,
      teamVisible: getComputedStyle(document.getElementById('scopeTeamSection')).display,
      calendarButtons: document.querySelectorAll(
        '#teamCalendarGrid button,#team-calendar-grid button',
      ).length,
      sourceButtons: [...document.querySelectorAll('#scopeTeamSection button')].length,
      text: document.getElementById('scopeTeamSection').textContent.includes('Staff travel'),
    }));
    assert.equal(state.readyState, 'complete');
    assert(
      state.text && state.sourceButtons > 20,
      'Staff travel calendar is rendered and actionable',
    );
    return state;
  });

  await check('View JD query opens the original job description modal', async () => {
    await ready('me.html?webView=details&webAction=profile-jd');
    await visible('#jdPaperModal');
    assert(await page.$eval('#jdPaperModal', (element) => element.classList.contains('open')));
    assert.match(
      await page.$eval('#jdPaperModal', (element) => element.textContent),
      /TIMES SQUARE RETAIL GROUP BHD/,
    );
    await page.click('.jd-paper-close-btn');
    await page.waitForFunction(
      () => !document.getElementById('jdPaperModal').classList.contains('open'),
    );
    return { originalDocumentModal: true, closeActionWorks: true };
  });
} finally {
  await context.close();
  await browser.close();
  const report =
    '# Independent native option regression\n\n' +
    `Production URL: ${base}. Tested with isolated headless Google Chrome at 1440 × 900. External requests were blocked; frontend local storage was isolated from the user's browser.\n\n` +
    results
      .map(
        (result) =>
          `- ${result.passed ? 'PASS' : 'FAIL'}: ${result.name}${result.passed ? `. Evidence: \`${JSON.stringify(result.evidence)}\`.` : `\n\n\`\`\`\n${result.error}\n\`\`\``}`,
      )
      .join('\n') +
    '\n\n' +
    `Runtime page errors: ${errors.length}.\n\n` +
    (errors.length ? '```json\n' + JSON.stringify(errors, null, 2) + '\n```\n\n' : '') +
    'These checks exercise existing source forms, calculations, navigation and dialogs. No submission or backend transaction was performed. Source placeholder pages remain source placeholders.\n';
  await writeFile(resolve(project, 'docs/native-options-review.md'), report);
  console.log(
    JSON.stringify({
      passed: results.filter((result) => result.passed).length,
      failed: results.filter((result) => !result.passed).length,
      errors,
    }),
  );
  if (results.some((result) => !result.passed) || errors.length) process.exitCode = 1;
}
