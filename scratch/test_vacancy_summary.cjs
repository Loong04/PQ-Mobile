const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/options/team/vacancy-summary.html')).href;
    const count = () => page.$eval('#recruitmentTotal', element => Number(element.textContent));
    const badgeContrasts = () => page.$$eval('.applicant-status-badge', badges => {
      const channels = value => (value.match(/[\d.]+/g) || []).map(Number);
      const luminance = rgb => {
        const linear = rgb.map(channel => {
          const value = channel / 255;
          return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
        });
        return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
      };
      const swatch = document.createElement('span');
      swatch.style.backgroundColor = 'var(--bg-card)';
      document.body.append(swatch);
      const base = channels(getComputedStyle(swatch).backgroundColor);
      swatch.remove();
      return badges.map(badge => {
        const style = getComputedStyle(badge);
        const foreground = channels(style.color);
        const [red, green, blue, alpha = 1] = channels(style.backgroundColor);
        const background = [
          red * alpha + base[0] * (1 - alpha),
          green * alpha + base[1] * (1 - alpha),
          blue * alpha + base[2] * (1 - alpha)
        ];
        const foregroundLuminance = luminance(foreground);
        const backgroundLuminance = luminance(background);
        const contrast = (Math.max(foregroundLuminance, backgroundLuminance) + .05) / (Math.min(foregroundLuminance, backgroundLuminance) + .05);
        return { status: badge.closest('.applicant-card').dataset.status, contrast: Number(contrast.toFixed(2)) };
      });
    });
    const filter = async values => {
      await page.click('#recruitmentFilterTrigger');
      await page.evaluate(values => {
        for (const [name, value] of Object.entries(values)) document.querySelector(`[name="${name}"]`).value = value;
      }, values);
      await page.click('#recruitmentApply');
    };
    const reset = async () => {
      await page.click('#recruitmentFilterTrigger');
      await page.click('#recruitmentReset');
      await page.click('#recruitmentApply');
    };
    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 844 });
      await page.goto(`${base}?theme=${theme}`, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.$('.employee-career-coming-card'), null, 'Vacancy Summary must show vacancies instead of Coming soon');
      assert.equal(await count(), 3, 'Default Open filter excludes the closed vacancy');
      assert.equal(await page.$$eval('.vacancy-card', elements => elements.length), 3);
      assert.match(await page.$eval('.vacancy-card', element => element.textContent), /ACCOUNT EXECUTIVE/);
      assert.equal(await page.$eval('#recruitmentFilter', dialog => dialog.getClientRects().length), 0, 'Closed filter is not rendered');
      await page.click('#recruitmentFilterTrigger');
      assert.deepEqual(await page.$$eval('#recruitmentFilterForm label', elements => elements.map(element => element.textContent)), ['Status', 'Open Start Date', 'Open End Date', 'Company', 'Department', 'Job', 'Access Code', 'Location', 'Min Qualification']);
      const filterLayout = await page.$eval('#recruitmentFilter', async dialog => {
        const fields = dialog.querySelector('#recruitmentFilterFields');
        const footer = dialog.querySelector('.recruitment-filter-footer');
        const lastField = fields.lastElementChild;
        fields.scrollTop = fields.scrollHeight;
        dialog.scrollTop = dialog.scrollHeight;
        await new Promise(requestAnimationFrame);
        const lastRect = lastField.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        return {
          dialogOwnsScroll: dialog.scrollTop > 0,
          fieldsOwnScroll: fields.scrollHeight > fields.clientHeight + 1,
          lastFieldClearsFooter: lastRect.bottom <= footerRect.top
        };
      });
      assert.deepEqual(filterLayout, {
        dialogOwnsScroll: false,
        fieldsOwnScroll: true,
        lastFieldClearsFooter: true
      }, 'Only the filter fields scroll and the final field remains above Search');
      const filterVisuals = await page.$eval('#recruitmentFilter', dialog => {
        const resolveToken = token => {
          const probe = document.createElement('span');
          probe.style.color = `var(${token})`;
          dialog.append(probe);
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        };
        const dialogStyle = getComputedStyle(dialog);
        const headerStyle = getComputedStyle(dialog.querySelector('.standard-filter-header'));
        const footerStyle = getComputedStyle(dialog.querySelector('.recruitment-filter-footer'));
        const labelStyle = getComputedStyle(dialog.querySelector('label'));
        const input = dialog.querySelector('select');
        const inputStyle = getComputedStyle(input);
        return {
          surfaceUsesCardToken: dialogStyle.backgroundColor === resolveToken('--bg-card'),
          surfaceHasNoGradient: dialogStyle.backgroundImage === 'none',
          headerIsTransparent: headerStyle.backgroundColor === 'rgba(0, 0, 0, 0)',
          footerIsTransparent: footerStyle.backgroundColor === 'rgba(0, 0, 0, 0)',
          footerHasNoDivider: footerStyle.borderTopWidth === '0px',
          labelUsesPurpleToken: labelStyle.color === resolveToken('--purple-text'),
          inputHeight: Math.round(input.getBoundingClientRect().height),
          inputRadius: inputStyle.borderRadius,
          inputFontSize: inputStyle.fontSize,
          inputFontWeight: inputStyle.fontWeight
        };
      });
      assert.deepEqual(filterVisuals, {
        surfaceUsesCardToken: true,
        surfaceHasNoGradient: true,
        headerIsTransparent: true,
        footerIsTransparent: true,
        footerHasNoDivider: true,
        labelUsesPurpleToken: true,
        inputHeight: 48,
        inputRadius: '16px',
        inputFontSize: '13.5px',
        inputFontWeight: '700'
      }, 'Vacancy filter follows the shared filter surface and control design');
      await page.click('#recruitmentClose');
      await filter({ status: 'Closed' });
      assert.equal(await count(), 1, 'Closed vacancies can be searched');
      await reset();
      await filter({ department: 'ACCOUNTS' });
      assert.equal(await count(), 2, 'Department restricts the vacancy list');
      await filter({ startDate: '2025-04-02', endDate: '2025-04-02' });
      assert.equal(await count(), 1, 'Date boundaries are inclusive');
      await page.click('#recruitmentFilterTrigger');
      await page.evaluate(() => { document.querySelector('[name="startDate"]').value = '2026-01-01'; document.querySelector('[name="endDate"]').value = '2025-01-01'; });
      await page.click('#recruitmentApply');
      assert.equal(await page.$eval('#recruitmentFilter', element => element.open), true, 'Invalid ranges keep the filter open');
      assert.equal(await page.$eval('#recruitmentError', element => element.hidden), false);
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#recruitmentFilterTrigger', element => element === document.activeElement), true);
      await page.click('#recruitmentFilterTrigger');
      assert.equal(await page.$eval('[name="endDate"]', element => element.hasAttribute('aria-describedby')), false, 'Old date errors are cleared when reopened');
      await page.keyboard.press('Escape');
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 844 });
        assert.ok(await page.$eval('main', element => element.scrollWidth <= element.clientWidth + 1), 'Summary fits the phone');
        assert.equal(await page.$eval('.recruitment-card', element => getComputedStyle(element).borderRadius), '18px');
      }
      await page.setViewport({ width: 390, height: 844 });
      await page.screenshot({ path: path.join(__dirname, `vacancy-summary-${theme}.png`) });
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('.vacancy-card')]);
      assert.ok(page.url().includes('vacancy=vac-account-01'), 'The selected vacancy is carried to the listing');
      assert.equal(await page.$eval('h1', element => element.textContent), 'Applicant Listing');
      assert.equal(await count(), 3, 'Only the selected vacancy applicants are shown');
      assert.deepEqual(
        await page.$eval('.applicant-card', card => {
          const details = card.querySelector('.history-card-details');
          const firstField = card.querySelector('.recruitment-card-field');
          return {
            tagName: card.tagName,
            status: card.dataset.status,
            name: card.querySelector('.history-card-title')?.textContent.trim() || null,
            badge: card.querySelector('.history-card-header > .applicant-status-badge')?.textContent.trim() || null,
            hasLegacyStrip: Boolean(card.querySelector('.recruitment-card-strip')),
            detailLabels: [...card.querySelectorAll('.recruitment-card-field dt')].map(node => node.textContent.trim()),
            hasHistoryDetails: Boolean(details),
            cardRadius: getComputedStyle(card).borderRadius,
            statusBorderWidth: getComputedStyle(card).borderLeftWidth,
            detailColumns: details ? getComputedStyle(details).gridTemplateColumns.trim().split(/\s+/).length : 0,
            fieldBorderWidth: firstField ? getComputedStyle(firstField).borderTopWidth : null,
            valuesStayOnOneLine: [...card.querySelectorAll('.recruitment-card-field dd')].every(value => {
              const lineHeight = Number.parseFloat(getComputedStyle(value).lineHeight);
              return value.getBoundingClientRect().height <= lineHeight * 1.1;
            })
          };
        }),
        {
          tagName: 'ARTICLE',
          status: 'shortlisted',
          name: 'ALFRED TEE',
          badge: 'Shortlisted',
          hasLegacyStrip: false,
          detailLabels: ['Age', 'Gender', 'Years of Experience', 'Expected Pay (RM)'],
          hasHistoryDetails: true,
          cardRadius: '18px',
          statusBorderWidth: '5px',
          detailColumns: 1,
          fieldBorderWidth: '0px',
          valuesStayOnOneLine: true
        },
        'Applicant status cards use the History Card hierarchy without duplicating status in the detail rows'
      );
      if (theme === 'light') {
        const contrasts = await badgeContrasts();
        assert.ok(contrasts.every(result => result.contrast >= 4.5), `Light-mode applicant badges meet 4.5:1 contrast: ${JSON.stringify(contrasts)}`);
      }
      await page.click('#recruitmentFilterTrigger');
      assert.deepEqual(await page.$$eval('#recruitmentFilterForm label', elements => elements.map(element => element.textContent)), ['Name', 'Start Date', 'End Date', 'Applicant Status', 'Application Status', 'Qualification Level', 'Qualification Major', 'Industry', 'Min Experience Years', 'Max Expected Pay']);
      await page.click('#recruitmentClose');
      await filter({ name: 'alfred' });
      assert.equal(await count(), 1, 'Name search ignores case');
      assert.match(await page.$eval('.applicant-card', element => element.textContent), /ALFRED TEE/);
      await reset();
      await filter({ applicantStatus: 'Hired' });
      assert.equal(await count(), 1);
      assert.match(await page.$eval('.applicant-card', element => element.textContent), /Safiq Ahmad/);
      await reset();
      await filter({ minExperience: '1', maxPay: '3500' });
      assert.equal(await count(), 0, 'Experience and expected pay are combined');
      assert.equal(await page.$eval('#recruitmentEmpty', element => element.hidden), false);
      await reset();
      await filter({ minExperience: '1', maxPay: '5000' });
      assert.equal(await count(), 1);
      await reset();
      await filter({ maxPay: '0' });
      assert.equal(await count(), 1, 'A zero maximum salary is respected');
      assert.match(await page.$eval('.applicant-card', element => element.textContent), /Safiq Ahmad/);
      await reset();
      await filter({ qualification: 'Degree', major: 'Finance', industry: 'Banking', applicationStatus: 'Accepted' });
      assert.equal(await count(), 1, 'Qualification, major, industry and application status are combined');
      await reset();
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 844 });
        assert.ok(await page.$eval('main', element => element.scrollWidth <= element.clientWidth + 1), 'Applicants fit the phone');
      }
      await page.setViewport({ width: 390, height: 844 });
      await page.screenshot({ path: path.join(__dirname, `applicant-listing-${theme}.png`) });
      await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#recruitmentBack')]);
      assert.equal(await count(), 1, 'Return keeps the summary date and department filters');
      assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), theme);
      await reset();
      await filter({ company: 'PEOPLE QUEST SDN BHD', location: 'Petaling Jaya', accessCode: 'TECH', job: 'SOFTWARE ENGINEER', qualification: 'Degree' });
      assert.equal(await count(), 1, 'All vacancy criteria are applied together');
      assert.match(await page.$eval('.vacancy-card', element => element.textContent), /SOFTWARE ENGINEER/);
      await page.click('#recruitmentFilterTrigger');
      await page.screenshot({ path: path.join(__dirname, `vacancy-filter-${theme}.png`) });
      await page.keyboard.press('Escape');
    }
    await page.goto(base + '?theme=dark', { waitUntil: 'domcontentloaded' });
    await page.click('[data-set-theme="light"]');
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('.vacancy-card')]);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light', 'Theme switched in place follows the vacancy link');
    await page.click('[data-set-theme="dark"]');
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('#recruitmentBack')]);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark', 'Theme switched in the listing follows the Back link');
    await page.goto(base.replace('vacancy-summary.html', 'applicant-listing.html') + '?vacancy=vac-account-02&theme=light', { waitUntil: 'domcontentloaded' });
    assert.equal(await count(), 4, 'A second vacancy has its own applicants');
    assert.doesNotMatch(await page.$eval('#recruitmentCards', element => element.textContent), /ALFRED TEE/);
    assert.deepEqual(
      await page.$$eval('.applicant-card', cards => cards.map(card => ({
        status: card.dataset.status,
        badge: card.querySelector('.applicant-status-badge')?.textContent.trim() || null
      }))),
      [
        { status: 'new', badge: 'New' },
        { status: 'shortlisted', badge: 'Shortlisted' },
        { status: 'new', badge: 'New' },
        { status: 'rejected', badge: 'Rejected' }
      ],
      'Every applicant status is exposed through the card accent and header badge'
    );
    const remainingContrasts = await badgeContrasts();
    assert.ok(remainingContrasts.every(result => result.contrast >= 4.5), `New, Shortlisted and Rejected badges meet 4.5:1 contrast: ${JSON.stringify(remainingContrasts)}`);
    await page.goto(base.replace('vacancy-summary.html', 'applicant-listing.html') + '?vacancy=vac-hr-01', { waitUntil: 'domcontentloaded' });
    assert.equal(await count(), 0, 'A vacancy without applicants shows an empty listing');
    await page.goto(base.replace('vacancy-summary.html', 'applicant-listing.html') + '?vacancy=unknown', { waitUntil: 'domcontentloaded' });
    assert.equal(await count(), 0, 'Unknown vacancies never reveal unrelated applicants');
    assert.equal(await page.$eval('#recruitmentEmpty', element => element.hidden), false);
    await page.goto(base + '?v_startDate=2025-02-30&v_endDate=1800-01-01', { waitUntil: 'domcontentloaded' });
    assert.equal(await count(), 3, 'Invalid URL dates revert to the supported date defaults');
    await page.click('#recruitmentFilterTrigger');
    assert.equal(await page.$eval('[name="startDate"]', element => element.value), '1990-01-01');
    assert.equal(await page.$eval('[name="endDate"]', element => element.value), '2100-12-31');
    await page.keyboard.press('Escape');
    await page.goto(base.replace('vacancy-summary.html', 'applicant-listing.html') + '?vacancy=vac-account-01&a_minExperience=0x10', { waitUntil: 'domcontentloaded' });
    assert.equal(await count(), 3, 'Unsupported numeric URL values revert to the default');
    assert.deepEqual(errors, [], 'No JavaScript errors');
    console.log('PASS: Vacancy filters, selected applicant listing, back navigation, themes, empty states and mobile layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
