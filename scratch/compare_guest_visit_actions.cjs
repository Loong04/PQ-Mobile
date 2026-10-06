const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    const differences = [];
    async function open(file, theme) {
      await page.goto(pathToFileURL(path.resolve(file)).href + '?theme=' + theme, { waitUntil: 'networkidle0' });
      await page.evaluate(() => localStorage.removeItem('peoplehcm:guest-visit:draft:v1'));
      await page.reload({ waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
    }
    async function measure(selector, summarySelector) {
      return page.$eval(selector, (row, summarySelector) => {
        const bounds = row.getBoundingClientRect();
        const buttons = [...row.children].filter(n => getComputedStyle(n).display !== 'none').map(n => {
          const box = n.getBoundingClientRect();
          return { text: n.textContent.trim(), right: bounds.right - box.right, width: box.width, height: box.height, top: box.top - bounds.top };
        });
        return { buttons, gapBelowCard: summarySelector ? bounds.top - document.querySelector(summarySelector).getBoundingClientRect().bottom : null };
      }, summarySelector);
    }
    function compare(reference, guest, label, compact = false) {
      for (let i = 0; i < reference.buttons.length; i++) {
        for (const key of compact ? ['height', 'top'] : ['right', 'width', 'height', 'top']) {
          if (Math.abs(reference.buttons[i][key] - guest.buttons[i][key]) > .6) differences.push(`${label}: ${reference.buttons[i].text} ${key}: Mileage ${reference.buttons[i][key]}, Guest ${guest.buttons[i][key]}`);
        }
      }
      if (reference.gapBelowCard !== null && Math.abs(reference.gapBelowCard - guest.gapBelowCard) > .6) differences.push(`${label}: gap below card: Mileage ${reference.gapBelowCard}, Guest ${guest.gapBelowCard}`);
    }
    for (const theme of ['light', 'dark']) {
      for (const width of [360, 390, 450]) {
        await page.setViewport({ width, height: 950 });
        await open('modules/claims/options/travel-claim.html', theme);
        const general = await measure('#view-1-main > div:last-child', '.category-summary-row');
        if (width === 450) {
          await page.$eval('#view-1-main > div:last-child', n => n.scrollIntoView({ block: 'center' }));
          await page.screenshot({ path: path.join(__dirname, 'mileage_actions_reference_' + theme + '.png') });
        }
        await page.evaluate(() => navigateToStep(2));
        const list = await measure('#view-3-list > div:last-child', '#view-3-list .form-card');
        await page.evaluate(() => switchView('view-2-categories'));
        const categories = await measure('#view-2-categories > div:last-child');
        await open('modules/admin/options/guest-visit.html', theme);
        const guestGeneral = await measure('#visitPageActions', '#visitSummaryDetails');
        compare(general, guestGeneral, `${theme}/${width}/General`, width < 450);
        assert.ok(await page.$eval('#visitPageActions', row => {
          const bounds = row.getBoundingClientRect();
          return [...row.children].filter(n => getComputedStyle(n).display !== 'none').every(n => {
            const box = n.getBoundingClientRect();
            return box.left >= bounds.left - .6 && box.right <= bounds.right + .6;
          });
        }), 'General actions must stay on one row within the card width on smaller phones');
        if (width === 450) {
          await page.$eval('#visitPageActions', n => n.scrollIntoView({ block: 'center' }));
          await page.screenshot({ path: path.join(__dirname, 'guest_visit_actions_' + theme + '.png') });
          console.log(JSON.stringify({ theme, width, mileage: general, guest: guestGeneral }));
        }
        for (const tab of ['guest', 'attendee']) {
          await page.$eval(`[data-visit-tab="${tab}"]`, n => n.click());
          compare(list, await measure('#visitPageActions', tab === 'guest' ? '#visitGuestListView' : '#visitAttendeeListView'), `${theme}/${width}/${tab}`);
        }
        await page.$eval('[data-visit-tab="other"]', n => n.click());
        const other = await measure('#visitPageActions');
        for (const i of [0, 1]) {
          for (const key of width < 450 ? ['height', 'top'] : ['width', 'height', 'top']) {
            if (Math.abs(general.buttons[i][key] - other.buttons[i][key]) > .6) differences.push(`${theme}/${width}/Other: ${general.buttons[i].text} ${key} differs`);
          }
        }
        await page.$eval('[data-visit-tab="general"]', n => n.click());
        await page.$eval('#visitSummaryDetails', n => n.click());
        compare(categories, await measure('.visit-category-actions'), `${theme}/${width}/Categories`);
      }
    }
    assert.deepEqual(differences, [], differences.join('\n'));
    console.log('PASS: General actions match Mileage at full phone width; compact phones stay on one row. List/category actions and card spacing match in both themes at 360/390/450px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
