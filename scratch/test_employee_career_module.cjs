const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const individual = [
  ['Feedback', 'feedback.html'],
  ['Whereabout', 'whereabout.html'],
  ['My Event', 'my-event.html']
];
const team = [
  ['Confirm New User', 'confirm-new-user.html'],
  ['Staff List', 'staff-list.html'],
  ['Manpower Stats', 'manpower-stats.html'],
  ['Confirm Staff', 'confirm-staff.html'],
  ['Staff Exit', 'staff-exit.html'],
  ['Staff Request', 'staff-request.html'],
  ['Staff Attrition', 'staff-attrition.html'],
  ['Staff Retention', 'staff-retention.html'],
  ['Staff Whereabout', 'staff-whereabout.html'],
  ['Staff Events', 'staff-events.html'],
  ['Staff Feedback', 'staff-feedback.html'],
  ['Key Staff Nomination', 'key-staff-nomination.html'],
  ['Staff Engagement', 'staff-engagement.html']
];

function fileUrl(relative, query = '') {
  return pathToFileURL(path.join(root, relative)).href + query;
}

async function open(page, relative, query = '') {
  await page.goto(fileUrl(relative, query), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.readyState !== 'loading');
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  const pageErrors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));

    for (const appPage of ['applight.html', 'appdark.html']) {
      await open(page, appPage);
      const row = await page.$('.explore-row[data-module="employee-career"]');
      assert.ok(row, `${appPage} exposes Employee & Career`);
      await row.click();
      await page.waitForFunction(() => location.pathname.replace(/\\/g, '/').endsWith('/modules/employee-career/index.html'));
    }

    await open(page, 'modules/employee-career/index.html', '?scope=individual&theme=light');
    assert.equal(await page.$eval('#employeeCareerTitle', node => node.textContent.trim()), 'Employee & Career');
    assert.deepEqual(
      await page.$$eval('#employeeCareerOptions .employee-career-option-title', nodes => nodes.map(node => node.textContent.trim())),
      individual.map(item => item[0])
    );
    assert.equal(await page.$eval('#employeeCareerTabIndividual', node => node.getAttribute('aria-selected')), 'true');

    await page.click('#employeeCareerTabTeam');
    assert.ok((await page.url()).includes('scope=team'));
    assert.deepEqual(
      await page.$$eval('#employeeCareerOptions .employee-career-option-title', nodes => nodes.map(node => node.textContent.trim())),
      [...team.slice(0, 5).map(item => item[0]), 'View All']
    );
    await page.click('[data-action="view-all"]');
    assert.equal(await page.$eval('#employeeCareerAllOptions', node => node.classList.contains('active')), true);
    await page.waitForFunction(() => document.activeElement?.id === 'employeeCareerCloseAll');
    assert.equal(await page.$eval('.employee-career-content', node => node.inert), true, 'Background content is inert while View All is open');
    assert.deepEqual(
      await page.$$eval('#employeeCareerAllOptionsGrid .employee-career-option-title', nodes => nodes.map(node => node.textContent.trim())),
      team.map(item => item[0])
    );
    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    assert.equal(await page.evaluate(() => document.activeElement?.closest('#employeeCareerAllOptions') !== null), true, 'Focus stays inside View All');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#employeeCareerAllOptions', node => node.classList.contains('active')), false);
    assert.equal(await page.$eval('.employee-career-content', node => node.inert), false, 'Background content is restored after closing View All');

    await open(page, 'modules/employee-career/index.html', '?scope=invalid&theme=dark');
    assert.equal(await page.$eval('#employeeCareerTabIndividual', node => node.getAttribute('aria-selected')), 'true');

    for (const [scope, options] of [['individual', individual], ['team', team]]) {
      for (const [title, filename] of options) {
        const relative = `modules/employee-career/options/${scope}/${filename}`;
        assert.ok(fs.existsSync(path.join(root, relative)), `${relative} exists as its own file`);
        await open(page, relative, '?theme=dark');
        assert.equal(await page.$eval('h1', node => node.textContent.trim()), title === 'Manpower Stats' ? 'Manpower Statistics' : title);
        const backHref = await page.$eval('[data-option-back]', node => node.href);
        assert.ok(backHref.includes(`scope=${scope}`));
        assert.ok(backHref.includes('theme=dark'), `${relative} preserves the current theme when returning`);
        assert.equal(await page.evaluate(() => typeof window.navTo), 'function', `${relative} keeps bottom navigation operational`);
      }
    }

    await open(page, 'modules/employee-career/options/individual/feedback.html', '?theme=light');
    const feedbackFields = [
      'feedbackType', 'feedbackCategory', 'feedbackTitle', 'feedbackDate1', 'feedbackDate2',
      'feedbackReference1', 'feedbackReference2', 'feedbackBody', 'feedbackRemarks', 'feedbackFiles'
    ];
    for (const id of feedbackFields) assert.ok(await page.$(`#${id}`), `Feedback includes #${id}`);
    assert.equal(await page.$$eval('#feedbackForm [required]', nodes => nodes.length), 0);
    await page.$eval('#feedbackFiles', input => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['sample'], 'feedback-note.pdf', { type: 'application/pdf' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.$eval('#feedbackAttachments', node => node.textContent.includes('feedback-note.pdf')), true);
    await page.click('#feedbackAttachments button');
    assert.equal(await page.$eval('#feedbackAttachments', node => node.textContent.trim()), '');
    await page.click('#feedbackSubmit');
    assert.equal(await page.$eval('#employeeCareerToast', node => node.textContent.trim()), 'Feedback submitted successfully');

    await open(page, 'modules/employee-career/options/individual/whereabout.html', '?theme=dark');
    const whereaboutFields = [
      'whereaboutDate', 'whereaboutToDate', 'whereaboutStartTime', 'whereaboutEndTime',
      'whereaboutLocation', 'whereaboutState', 'whereaboutProject', 'whereaboutTask', 'whereaboutRemarks'
    ];
    for (const id of whereaboutFields) assert.ok(await page.$(`#${id}`), `Whereabout includes #${id}`);
    assert.equal(await page.$$eval('#whereaboutForm [required]', nodes => nodes.length), 0);
    await page.select('#whereaboutProject', 'project-nova');
    assert.deepEqual(
      await page.$$eval('#whereaboutTask option', nodes => nodes.map(node => node.value)),
      ['', 'site-survey', 'client-briefing', 'progress-review']
    );
    await page.click('#whereaboutSubmit');
    assert.equal(await page.$eval('#employeeCareerToast', node => node.textContent.trim()), 'Whereabout submitted successfully');

    const teamForms = [
      {
        file: 'confirm-staff.html',
        form: 'confirmStaffForm',
        submit: 'confirmStaffSubmit',
        toast: 'Staff confirmation submitted successfully',
        fields: ['confirmEmployee', 'confirmName', 'confirmPosition', 'confirmHireDate', 'confirmEmploymentType', 'confirmDue', 'confirmAssessmentScore', 'confirmRecommendation', 'confirmEffectiveDate', 'confirmExtensionMonths', 'confirmAdjustment', 'confirmRemarks', 'confirmFiles']
      },
      {
        file: 'staff-exit.html',
        form: 'staffExitForm',
        submit: 'staffExitSubmit',
        toast: 'Staff exit submitted successfully',
        fields: ['exitEmployee', 'exitName', 'exitPosition', 'exitNoticeDate', 'exitLastPaidDay', 'exitType', 'exitBlacklist', 'exitReason', 'exitRecommendation', 'exitReplaceDeadline', 'exitRemarks', 'exitFiles']
      },
      {
        file: 'staff-request.html',
        form: 'staffRequestForm',
        submit: 'staffRequestSubmit',
        toast: 'Staff request submitted successfully',
        fields: ['requestPeriod', 'requestType', 'requestManpowerPlan', 'requestDescription', 'requestCompany', 'requestBranch', 'requestDepartment', 'requestLocation', 'requestJob', 'requestAccess', 'requestEmploymentType', 'requestCount', 'requestRequiredBy', 'requestReason', 'requestRemarks', 'requestFiles']
      }
    ];

    for (const definition of teamForms) {
      await open(page, `modules/employee-career/options/team/${definition.file}`, '?theme=light');
      assert.equal(await page.$('.employee-career-coming-card'), null, `${definition.file} is implemented as a form`);
      for (const id of definition.fields) assert.ok(await page.$(`#${id}`), `${definition.file} includes #${id}`);
      assert.equal(await page.$$eval(`#${definition.form} [required]`, nodes => nodes.length), 0, `${definition.file} has no required fields`);
      await page.click(`#${definition.submit}`);
      assert.equal(await page.$eval('#employeeCareerToast', node => node.textContent.trim()), definition.toast);
    }

    await open(page, 'modules/employee-career/options/team/confirm-staff.html', '?theme=dark');
    await page.select('#confirmEmployee', 'EBB01');
    assert.equal(await page.$eval('#confirmName', node => node.value), 'Aina Rahman');
    assert.equal(await page.$eval('#confirmPosition', node => node.value), 'People Operations Executive');
    await page.$eval('#confirmFiles', input => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['sample'], 'confirmation-note.pdf', { type: 'application/pdf' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    assert.equal(await page.$eval('#confirmAttachments', node => node.textContent.includes('confirmation-note.pdf')), true);
    await page.click('#confirmAttachments button');
    assert.equal(await page.$eval('#confirmAttachments', node => node.textContent.trim()), '');

    await open(page, 'modules/employee-career/options/team/staff-exit.html', '?theme=dark');
    await page.select('#exitEmployee', 'EBB02');
    assert.equal(await page.$eval('#exitName', node => node.value), 'Daniel Wong');
    assert.equal(await page.$eval('#exitPosition', node => node.value), 'Product Designer');

    for (const width of [360, 390, 450]) {
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
      for (const theme of ['light', 'dark']) {
        await open(page, 'modules/employee-career/index.html', `?scope=team&theme=${theme}`);
        const layout = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          columns: getComputedStyle(document.getElementById('employeeCareerOptions')).gridTemplateColumns.split(' ').length
        }));
        assert.equal(layout.theme, theme);
        assert.ok(layout.overflow <= 1, `${theme} ${width}px has no horizontal overflow`);
        assert.equal(layout.columns, 3, `${theme} ${width}px keeps three option columns`);
      }
      for (const definition of teamForms) {
        await open(page, `modules/employee-career/options/team/${definition.file}`, '?theme=light');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(overflow <= 1, `${definition.file} has no horizontal overflow at ${width}px`);
      }
    }

    assert.deepEqual(pageErrors, [], `Pages should have no JavaScript errors: ${pageErrors.join('; ')}`);
    console.log('PASS: Employee & Career dashboard, active options, forms, themes and responsive layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
