const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const fileUrl = (relative, query = '') => pathToFileURL(path.join(root, relative)).href + query;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(fileUrl('modules/employee-career/index.html', '?scope=individual&theme=light'), { waitUntil: 'load' });
    assert.deepEqual(
      await page.$$eval('#employeeCareerOptions .employee-career-option-title', nodes => nodes.map(node => node.textContent.trim())),
      ['Feedback', 'Whereabout', 'Career Plan', 'History'],
      'Individual Quick Options includes Career Plan before History'
    );
    assert.ok(
      (await page.$eval('[data-option-id="career-plan"]', node => node.getAttribute('href'))).includes('options/individual/career-plan.html'),
      'Career Plan option opens its own Individual page'
    );

    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 950, deviceScaleFactor: 1 });
      await page.goto(fileUrl('modules/employee-career/options/individual/career-plan.html', `?theme=${theme}`), { waitUntil: 'load' });

      assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Career Plan');
      assert.equal(await page.$eval('[data-option-back]', node => new URL(node.href).searchParams.get('scope')), 'individual');
      assert.equal(await page.$eval('[data-option-back]', node => new URL(node.href).searchParams.get('theme')), theme);

      const fields = [
        'careerPlanName', 'careerPlanPosition', 'careerPlanDepartment', 'careerPlanPath',
        'careerPlanNextPosition', 'careerPlanTargetDate', 'careerPlanJustification',
        'careerPlanActionPlan', 'careerPlanDevelopmentNeeds', 'careerPlanRemarks', 'careerPlanFiles'
      ];
      for (const id of fields) assert.ok(await page.$(`#${id}`), `Career Plan includes #${id}`);

      assert.deepEqual(await page.evaluate(() => ({
        name: document.getElementById('careerPlanName').value,
        position: document.getElementById('careerPlanPosition').value,
        department: document.getElementById('careerPlanDepartment').value,
        readonly: ['careerPlanName', 'careerPlanPosition', 'careerPlanDepartment'].every(id => document.getElementById(id).readOnly)
      })), {
        name: 'Aina Rahman',
        position: 'People Operations Executive',
        department: 'People & Culture',
        readonly: true
      });

      await page.select('#careerPlanPath', 'leadership');
      assert.deepEqual(
        await page.$$eval('#careerPlanNextPosition option', nodes => nodes.map(node => [node.value, node.textContent.trim()])),
        [
          ['', 'Select Next Position'],
          ['team-lead', 'Team Lead'],
          ['department-manager', 'Department Manager'],
          ['head-of-department', 'Head of Department']
        ],
        'Leadership path exposes only its relevant next positions'
      );

      await page.select('#careerPlanPath', 'specialist');
      assert.deepEqual(
        await page.$$eval('#careerPlanNextPosition option', nodes => nodes.map(node => node.value)),
        ['', 'senior-specialist', 'principal-specialist', 'subject-matter-expert'],
        'Changing Career Path refreshes Next Position choices'
      );

      await page.$eval('#careerPlanFiles', input => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['plan'], 'career-plan.pdf', { type: 'application/pdf' }));
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      assert.equal(await page.$eval('#careerPlanAttachments', node => node.textContent.includes('career-plan.pdf')), true);
      await page.click('#careerPlanAttachments [data-remove-file]');
      assert.equal(await page.$eval('#careerPlanAttachments', node => node.textContent.trim()), '');

      assert.deepEqual(
        await page.$$eval('.employee-career-form-actions > *', nodes => nodes.map(node => node.textContent.trim())),
        ['Cancel', 'Update'],
        'Career Plan provides only Cancel and Update actions'
      );
      await page.click('#careerPlanSubmit');
      assert.equal(await page.$eval('#employeeCareerToast', node => node.textContent.trim()), 'Career plan updated successfully');

      assert.ok(await page.$('#careerPlanCancel'), 'Career Plan provides Cancel');
      assert.equal(await page.$('#careerPlanSave'), null, 'Career Plan removes Save');
      assert.ok(await page.$('#careerPlanSubmit'), 'Career Plan provides Update');
      assert.ok(await page.$eval('main', node => node.scrollWidth <= node.clientWidth + 1), `${theme} Career Plan fits a 390px viewport`);
    }

    assert.deepEqual(errors, [], `Career Plan should have no JavaScript errors: ${errors.join('; ')}`);
    console.log('PASS: Career Plan option, consistent form fields, linked positions, attachments and actions.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
