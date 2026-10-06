const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950 });
    for (const theme of ['light', 'dark']) {
      await page.goto(pathToFileURL(path.resolve('modules/claims/options/travel-claim.html')).href + '?theme=' + theme, { waitUntil: 'networkidle0' });
      const mileageUpload = await page.$eval('#mainChipsList', list => {
        const pickers = [...list.parentElement.querySelectorAll('[onclick]')];
        const [a, b] = pickers.map(picker => picker.firstElementChild.getBoundingClientRect());
        return { centers: b.x + b.width / 2 - a.x - a.width / 2, gap: getComputedStyle(pickers[0].parentElement).gap };
      });
      await page.evaluate(() => navigateToStep(2));
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 300)));
      const reference = await page.$eval('#view-3-list .form-card', card => {
        const body = card.querySelector('#v3ItemsContainer');
        const state = body.firstElementChild;
        const icon = state.firstElementChild;
        return { card: card.getBoundingClientRect().height, header: body.previousElementSibling.getBoundingClientRect().height, body: body.getBoundingClientRect().height, icon: icon.getBoundingClientRect().width, titleSize: getComputedStyle(state.children[1]).fontSize, titleWeight: getComputedStyle(state.children[1]).fontWeight };
      });
      await page.screenshot({ path: path.join(__dirname, 'guest_visit_mileage_reference_empty_' + theme + '.png') });
      await page.goto(pathToFileURL(path.resolve('modules/admin/options/guest-visit.html')).href + '?theme=' + theme, { waitUntil: 'networkidle0' });
      await page.evaluate(() => localStorage.removeItem('peoplehcm:guest-visit:draft:v1'));
      await page.reload({ waitUntil: 'networkidle0' });
      await page.$eval('.visit-upload-actions', n => n.scrollIntoView({ block: 'center' }));
      const guestUpload = await page.$eval('.visit-upload-actions', group => {
        const [a, b] = [...group.querySelectorAll('.visit-upload-icon')].map(n => n.getBoundingClientRect());
        return { centers: b.x + b.width / 2 - a.x - a.width / 2, gap: getComputedStyle(group).gap, sameCard: group.closest('.claim-form-card') === document.getElementById('visitDate').closest('.claim-form-card') };
      });
      await page.screenshot({ path: path.join(__dirname, 'admin_guest_visit_upload_' + theme + '.png') });
      await page.click('[data-visit-tab="guest"]');
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 300)));
      const guest = await page.$eval('#visitGuestListView', card => ({
        card: card.getBoundingClientRect().height, header: card.querySelector('.visit-list-heading').getBoundingClientRect().height, body: card.querySelector('.visit-list-body').getBoundingClientRect().height,
        icon: card.querySelector('.visit-empty-icon').getBoundingClientRect().width, titleSize: getComputedStyle(card.querySelector('.visit-empty-title')).fontSize, titleWeight: getComputedStyle(card.querySelector('.visit-empty-title')).fontWeight
      }));
      await page.screenshot({ path: path.join(__dirname, 'admin_guest_visit_guest_empty_' + theme + '.png') });
      await page.click('[data-visit-tab="attendee"]');
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 300)));
      await page.screenshot({ path: path.join(__dirname, 'admin_guest_visit_attendee_empty_' + theme + '.png') });
      console.log(JSON.stringify({ theme, mileage: reference, guest, mileageUpload, guestUpload }));
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
