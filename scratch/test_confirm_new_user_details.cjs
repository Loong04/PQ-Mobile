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
  assert.deepEqual(await page.$$eval('.new-user-form-card', cards => cards.map(card => ({
    title: card.querySelector('h2').textContent.trim(),
    visible: card.getBoundingClientRect().height > 0 && !card.closest('[hidden]')
  }))), [
    { title: 'Basic Information', visible: true },
    { title: 'Contact', visible: true },
    { title: 'Emergency Contact', visible: true },
    { title: 'Employment & Payroll', visible: true }
  ], `${theme}/${width}: all four sections must appear together in the requested order`);
  assert.equal(await page.$('.new-user-stepper-card, #newUserNext, #newUserPrevious'), null, 'single-page form needs no step navigation');
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
  assert.deepEqual(await valuesFor(page, expectedBasic), expectedBasic);
  assert.deepEqual(await valuesFor(page, expectedContact), expectedContact);
  await verifyAttachmentControl(page);

  const layout = await page.evaluate(() => ({
    pageFits: document.documentElement.scrollWidth <= window.innerWidth,
    contentFits: document.querySelector('.new-user-details-form').scrollWidth <= document.querySelector('.new-user-details-form').clientWidth + 1,
    fields: [...document.querySelectorAll('#newUserDetailsForm .new-user-details-control')].map(control => {
      const box = control.getBoundingClientRect();
      return box.width > 0 && box.left >= -1 && box.right <= window.innerWidth + 1;
    }),
    palette: {
      card: getComputedStyle(document.querySelector('.new-user-form-card')).backgroundColor,
      control: getComputedStyle(document.querySelector('.new-user-details-control')).backgroundColor,
      text: getComputedStyle(document.querySelector('.new-user-profile-name')).color
    }
  }));
  assert.equal(layout.pageFits, true, `${theme}/${width}: page must not overflow`);
  assert.equal(layout.contentFits, true, `${theme}/${width}: form must not overflow`);
  assert.equal(layout.fields.every(Boolean), true, `${theme}/${width}: every field must stay inside the viewport`);

  assert.equal(await page.$eval('#newUserSubmit', node => node.tagName), 'A');
  assert.equal(new URL(await page.$eval('#newUserSubmit', node => node.href)).searchParams.get('scope'), 'team');
  assert.ok(await page.$('#newUserCancel[href*="confirm-new-user.html"]'));
  assert.equal(await page.$('#employeeCareerToast'), null, 'Submit must not use a success toast');
  assert.deepEqual(await page.$$eval('#newUserCancel, #newUserSubmit', buttons => buttons.map(button => ({
    id: button.id,
    text: button.textContent.trim(),
    icon: button.querySelector('i')?.className || '',
    pill: Number.parseFloat(getComputedStyle(button).borderRadius) >= button.getBoundingClientRect().height / 2
  }))), [
    { id: 'newUserCancel', text: 'Cancel', icon: 'fa-solid fa-xmark', pill: true },
    { id: 'newUserSubmit', text: 'Submit', icon: 'fa-solid fa-paper-plane', pill: true }
  ]);
  const secondaryButtons = await page.evaluate(() => {
    const styles = ['newUserCancel'].map(id => {
      const style = getComputedStyle(document.getElementById(id));
      return { background: style.backgroundColor, border: style.borderColor, color: style.color, shadow: style.boxShadow };
    });
    const reference = getComputedStyle(document.querySelector('.new-user-form-card'));
    return { styles, reference: { background: reference.backgroundColor, border: reference.borderColor, color: getComputedStyle(document.querySelector('.new-user-profile-name')).color } };
  });
  assert.equal(secondaryButtons.styles[0].background, secondaryButtons.reference.background);
  assert.equal(secondaryButtons.styles[0].border, secondaryButtons.reference.border);
  assert.equal(secondaryButtons.styles[0].color, secondaryButtons.reference.color);
  assert.notEqual(secondaryButtons.styles[0].shadow, 'none', 'secondary buttons need the subtle pill shadow');
  assert.deepEqual(await page.$$eval('[required]', nodes => nodes.map(node => node.id).sort()), ['newUserAddress1', 'newUserAddress2', 'newUserAddress3', 'newUserBasicPay', 'newUserBranch', 'newUserCompany', 'newUserDepartment', 'newUserEmergencyAddress1', 'newUserEmergencyAddress2', 'newUserEmergencyAddress3', 'newUserEmergencyPostCode', 'newUserHireDate', 'newUserJobPosition', 'newUserJobType', 'newUserName', 'newUserPostCode', 'newUserReportingGroup', 'newUserShiftGroup', 'newUserSupervisor'].sort());

  assert.equal(await page.$eval('.new-user-profile-name', node => node.textContent.trim()), 'TAN SIOW WEI');
  assert.equal(await page.$eval('.new-user-profile-id', node => node.textContent.trim()), '#858542719340');

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
    console.log('PASS: Confirm New User details displays Basic Information, Contact, Emergency Contact, and Employment & Payroll on one responsive page with unchanged values and navigation.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
