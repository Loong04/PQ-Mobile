const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/confirm-new-user-details.html')).href;
const listUrl = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/confirm-new-user.html')).href;
const dashboardUrl = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/index.html')).href;
const themes = ['light', 'dark'];
const widths = [360, 390, 430];

const expectedBasic = {
  newUserName: 'TAN SIOW WEI',
  newUserAlias: 'johndoe',
  newUserIdentity: '858542719340',
  newUserBirthDate: '1992-07-27',
  newUserGender: 'Male',
  newUserNationality: 'INDONESIAN',
  newUserRace: 'CHINESE',
  newUserReligion: 'HINDUISM',
  newUserQualification: 'DIPLOMA',
  newUserMaritalStatus: 'Single',
  newUserHireDate: '2026-10-06',
  newUserBasicPay: '0',
  newUserProbationMonths: '0',
  newUserProbationDays: '0'
};

const expectedContact = {
  newUserContactName: 'TAN SIOW WEI',
  newUserPhone: '012345687',
  newUserEmail: 'johnrichard_111@gmail.com',
  newUserAddress1: '11 Street',
  newUserAddress2: 'PJ Square',
  newUserAddress3: 'Petaling Jaya',
  newUserPostCode: '47301'
};

async function valuesFor(page, expected) {
  return page.evaluate(ids => Object.fromEntries(ids.map(id => {
    const control = document.getElementById(id);
    return [id, control?.value ?? null];
  })), Object.keys(expected));
}

async function verifyAttachmentControl(page) {
  const attachmentUi = await page.evaluate(() => ({
    hasFileInput: Boolean(document.getElementById('newUserAttachments')),
    hasUploadButton: Boolean(document.querySelector('.new-user-upload-button')),
    emptyText: document.querySelector('.new-user-attachment-empty')?.textContent.trim()
  }));
  assert.equal(attachmentUi.hasFileInput, false, 'attachments must be a read-only file list');
  assert.equal(attachmentUi.hasUploadButton, false, 'details view must not show an upload action');
  assert.equal(attachmentUi.emptyText, 'No attachments');
}

async function inspectScenario(browser, theme, width) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  await page.goto(`${url}?record=1&theme=${theme}`, { waitUntil: 'networkidle0' });

  assert.equal(await page.$eval('meta[name="viewport"]', node => /maximum-scale|user-scalable/i.test(node.content)), false, `${theme}/${width}: viewport must allow browser zoom`);
  assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
  assert.equal(await page.$eval('.employee-career-heading h1', node => node.textContent.trim()), 'New User Details');
  assert.equal(await page.$$eval('.new-user-stepper-item', nodes => nodes.length), 2, `${theme}/${width}: exactly two tabs are required`);
  assert.deepEqual(await page.$$eval('.new-user-stepper-item', nodes => nodes.map(node => ({
    label: node.querySelector('.new-user-stepper-label').textContent.trim(),
    number: node.querySelector('.new-user-stepper-circle').textContent.trim(),
    role: node.getAttribute('role'),
    selected: node.getAttribute('aria-selected'),
    controls: node.getAttribute('aria-controls')
  }))), [
    { label: 'Basic Information', number: '1', role: 'tab', selected: 'true', controls: 'newUserBasicPanel' },
    { label: 'Contact', number: '2', role: 'tab', selected: 'false', controls: 'newUserContactPanel' }
  ]);
  assert.equal(await page.$eval('.new-user-stepper-track', node => node.getAttribute('role')), 'tablist');
  assert.deepEqual(await page.$$eval('.new-user-step-panel', nodes => nodes.map(node => ({ role: node.getAttribute('role'), labelledBy: node.getAttribute('aria-labelledby') }))), [
    { role: 'tabpanel', labelledBy: 'newUserStep1' },
    { role: 'tabpanel', labelledBy: 'newUserStep2' }
  ]);
  assert.deepEqual(await page.$$eval('.new-user-stepper-item', nodes => nodes.map(node => node.classList.contains('active'))), [true, false]);
  const sectionAccents = await page.$$eval('.new-user-form-card > h2', headings => headings.map(heading => {
    const accent = getComputedStyle(heading, '::before');
    return { content: accent.content, background: accent.backgroundColor, width: Number.parseFloat(accent.width) };
  }));
  assert.equal(sectionAccents.length, 4, `${theme}/${width}: every form section heading must be present`);
  sectionAccents.forEach(accent => {
    assert.notEqual(accent.content, 'none', `${theme}/${width}: form headings need the purple accent bar`);
    assert.equal(accent.background, 'rgb(124, 58, 237)');
    assert.ok(accent.width >= 3 && accent.width <= 5);
  });
  assert.equal(await page.$eval('[data-step-panel="1"]', node => node.hidden), false);
  assert.equal(await page.$eval('[data-step-panel="2"]', node => node.hidden), true);
  assert.deepEqual(await valuesFor(page, expectedBasic), expectedBasic);
  await verifyAttachmentControl(page);

  await page.focus('#newUserStep1');
  await page.keyboard.press('ArrowRight');
  assert.deepEqual(await page.evaluate(() => ({ active: document.querySelector('.new-user-stepper-item.active')?.id, focused: document.activeElement?.id })), { active: 'newUserStep2', focused: 'newUserStep2' });
  await page.keyboard.press('ArrowLeft');
  assert.deepEqual(await page.evaluate(() => ({ active: document.querySelector('.new-user-stepper-item.active')?.id, focused: document.activeElement?.id })), { active: 'newUserStep1', focused: 'newUserStep1' });

  const layout = await page.evaluate(() => ({
    pageFits: document.documentElement.scrollWidth <= window.innerWidth,
    contentFits: document.querySelector('.new-user-details-form').scrollWidth <= document.querySelector('.new-user-details-form').clientWidth + 1,
    stepperFits: document.querySelector('.new-user-stepper-card').getBoundingClientRect().right <= window.innerWidth + 1,
    fields: [...document.querySelectorAll('[data-step-panel="1"] .new-user-details-control')].map(control => {
      const box = control.getBoundingClientRect();
      return box.left >= -1 && box.right <= window.innerWidth + 1;
    }),
    palette: {
      card: getComputedStyle(document.querySelector('.new-user-form-card')).backgroundColor,
      control: getComputedStyle(document.querySelector('.new-user-details-control')).backgroundColor,
      text: getComputedStyle(document.querySelector('.new-user-profile-name')).color
    }
  }));
  assert.equal(layout.pageFits, true, `${theme}/${width}: page must not overflow`);
  assert.equal(layout.contentFits, true, `${theme}/${width}: form must not overflow`);
  assert.equal(layout.stepperFits, true, `${theme}/${width}: stepper must fit the viewport`);
  assert.equal(layout.fields.every(Boolean), true, `${theme}/${width}: every field must stay inside the viewport`);

  const nextButton = await page.$eval('#newUserNext', button => {
    const box = button.getBoundingClientRect();
    return {
      text: button.textContent.trim(),
      hasArrow: Boolean(button.querySelector('.fa-arrow-right')),
      width: box.width,
      height: box.height,
      radius: Number.parseFloat(getComputedStyle(button).borderRadius)
    };
  });
  assert.equal(nextButton.text, 'Next');
  assert.equal(nextButton.hasArrow, true, 'Next button must include a right arrow');
  assert.ok(nextButton.width <= 140, 'Next button must stay compact');
  assert.ok(nextButton.radius >= nextButton.height / 2, 'Next button must use a pill shape');

  await page.click('#newUserNext');
  assert.deepEqual(await page.$$eval('.new-user-stepper-item', nodes => nodes.map(node => ({ active: node.classList.contains('active'), completed: node.classList.contains('completed') }))), [
    { active: false, completed: true },
    { active: true, completed: false }
  ]);
  assert.equal(await page.$eval('[data-step-panel="1"]', node => node.hidden), true);
  assert.equal(await page.$eval('[data-step-panel="2"]', node => node.hidden), false);
  assert.deepEqual(await valuesFor(page, expectedContact), expectedContact);
  const contactFits = await page.$eval('[data-step-panel="2"]', panel => [...panel.querySelectorAll('.new-user-details-control')].every(control => {
    const box = control.getBoundingClientRect();
    return box.width > 0 && box.left >= -1 && box.right <= window.innerWidth + 1;
  }));
  assert.equal(contactFits, true, `${theme}/${width}: visible Contact controls must fit the viewport`);
  assert.equal(await page.$eval('#newUserStepperFill', node => node.style.width), '50%');
  assert.deepEqual(await page.$$eval('.new-user-stepper-item', nodes => nodes.map(node => node.getAttribute('aria-selected'))), ['false', 'true']);
  assert.equal(await page.$eval('#newUserSubmit', node => node.tagName), 'A');
  assert.equal(new URL(await page.$eval('#newUserSubmit', node => node.href)).searchParams.get('scope'), 'team');
  assert.ok(await page.$('#newUserCancel[href*="confirm-new-user.html"]'));
  assert.equal(await page.$('#employeeCareerToast'), null, 'Submit must not use a success toast');
  assert.deepEqual(await page.$$eval('#newUserPrevious, #newUserCancel, #newUserSubmit', buttons => buttons.map(button => ({
    id: button.id,
    text: button.textContent.trim(),
    icon: button.querySelector('i')?.className || '',
    pill: Number.parseFloat(getComputedStyle(button).borderRadius) >= button.getBoundingClientRect().height / 2
  }))), [
    { id: 'newUserPrevious', text: 'Back', icon: 'fa-solid fa-arrow-left', pill: true },
    { id: 'newUserCancel', text: 'Cancel', icon: 'fa-solid fa-xmark', pill: true },
    { id: 'newUserSubmit', text: 'Submit', icon: 'fa-solid fa-paper-plane', pill: true }
  ]);
  const secondaryButtons = await page.evaluate(() => {
    const styles = ['newUserPrevious', 'newUserCancel'].map(id => {
      const style = getComputedStyle(document.getElementById(id));
      return { background: style.backgroundColor, border: style.borderColor, color: style.color, shadow: style.boxShadow };
    });
    const reference = getComputedStyle(document.querySelector('.new-user-form-card'));
    return { styles, reference: { background: reference.backgroundColor, border: reference.borderColor, color: getComputedStyle(document.querySelector('.new-user-profile-name')).color } };
  });
  assert.deepEqual(secondaryButtons.styles[0], secondaryButtons.styles[1], 'Back and Cancel must share one visual style');
  assert.equal(secondaryButtons.styles[0].background, secondaryButtons.reference.background);
  assert.equal(secondaryButtons.styles[0].border, secondaryButtons.reference.border);
  assert.equal(secondaryButtons.styles[0].color, secondaryButtons.reference.color);
  assert.notEqual(secondaryButtons.styles[0].shadow, 'none', 'secondary buttons need the subtle pill shadow');
  assert.deepEqual(await page.$$eval('[required]', nodes => nodes.map(node => node.id).sort()), ['newUserAddress1', 'newUserAddress2', 'newUserAddress3', 'newUserBasicPay', 'newUserBranch', 'newUserCompany', 'newUserDepartment', 'newUserEmergencyAddress1', 'newUserEmergencyAddress2', 'newUserEmergencyAddress3', 'newUserEmergencyPostCode', 'newUserHireDate', 'newUserJobPosition', 'newUserJobType', 'newUserName', 'newUserPostCode', 'newUserReportingGroup', 'newUserShiftGroup', 'newUserSupervisor'].sort());

  await page.click('#newUserPrevious');
  assert.equal(await page.$eval('[data-step-panel="1"]', node => node.hidden), false);
  await page.click('.new-user-stepper-item[data-step="2"]');
  assert.equal(await page.$eval('[data-step-panel="2"]', node => node.hidden), false);
  assert.equal(await page.$eval('.new-user-profile-name', node => node.textContent.trim()), 'TAN SIOW WEI');
  assert.equal(await page.$eval('.new-user-profile-id', node => node.textContent.trim()), '858542719340');

  assert.deepEqual(errors, []);
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#newUserSubmit')]);
  assert.equal(page.url(), `${dashboardUrl}?scope=team`, `${theme}/${width}: Submit must return to the Team option dashboard`);
  await page.close();
  return layout.palette;
}

async function verifyEdgeCases(browser) {
  const blankPage = await browser.newPage();
  await blankPage.goto(`${url}?record=0&theme=light`, { waitUntil: 'networkidle0' });
  assert.deepEqual(await valuesFor(blankPage, { newUserBasicPay: '', newUserProbationMonths: '', newUserProbationDays: '' }), { newUserBasicPay: '', newUserProbationMonths: '', newUserProbationDays: '' }, 'missing numeric values must remain blank for records without supplied details');
  await blankPage.close();

  const invalidPage = await browser.newPage();
  await invalidPage.goto(`${url}?record=1abc&theme=dark`, { waitUntil: 'networkidle0' });
  assert.equal(new URL(invalidPage.url()).pathname.endsWith('/confirm-new-user.html'), true, 'invalid record parameters must return to the list instead of showing the wrong employee');
  await invalidPage.close();

  const stalePage = await browser.newPage();
  await stalePage.goto(`${url}?record=99&theme=light`, { waitUntil: 'networkidle0' });
  assert.equal(new URL(stalePage.url()).pathname.endsWith('/confirm-new-user.html'), true, 'out-of-range record parameters must return to the list');
  await stalePage.close();

  const integrationPage = await browser.newPage();
  await integrationPage.setViewport({ width: 390, height: 900, deviceScaleFactor: 1 });
  await integrationPage.goto(`${listUrl}?theme=light`, { waitUntil: 'networkidle0' });
  const secondConfirm = '.confirm-new-user-card:nth-child(2) .confirm-new-user-confirm';
  await integrationPage.$eval(secondConfirm, button => button.scrollIntoView({ block: 'center' }));
  await Promise.all([integrationPage.waitForNavigation({ waitUntil: 'domcontentloaded' }), integrationPage.click(secondConfirm)]);
  assert.equal(new URL(integrationPage.url()).searchParams.get('record'), '1');
  assert.equal(await integrationPage.$eval('.new-user-profile-name', node => node.textContent.trim()), 'TAN SIOW WEI');
  await integrationPage.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const palettes = {};
    for (const theme of themes) {
      palettes[theme] = [];
      for (const width of widths) palettes[theme].push(await inspectScenario(browser, theme, width));
    }
    widths.forEach((width, index) => {
      for (const key of ['card', 'control', 'text']) assert.notEqual(palettes.light[index][key], palettes.dark[index][key], `${width}px ${key} must differ between light and dark themes`);
    });
    await verifyEdgeCases(browser);
    console.log('PASS: Confirm New User details uses a responsive two-step Basic Information and Contact flow.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
