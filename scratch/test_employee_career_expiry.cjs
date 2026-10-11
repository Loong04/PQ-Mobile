const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

// Catch scope leaks and narrow-screen clipping in the Individual expiry section.
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 420]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
      const url = pathToFileURL(path.resolve(__dirname, '../modules/employee-career/index.html')).href;
      await page.goto(`${url}?scope=individual&theme=${theme}`, { waitUntil: 'domcontentloaded' });
      assert.ok(await page.$('#employeeCareerExpiry'), 'Individual needs the expiry section below Quick Options');
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.hidden), false);
      assert.equal(await page.evaluate(() => document.querySelector('.employee-career-quick').nextElementSibling.id), 'employeeCareerExpiry');
      assert.deepEqual(await page.$$eval('#employeeCareerExpiry th', nodes => nodes.map(node => node.textContent.trim())), ['Type', 'Description', 'DueDay', 'Expiry']);
      assert.equal(await page.$$eval('#employeeCareerExpiry tbody tr', nodes => nodes.length), 10, 'All visible reference records remain available');
      assert.deepEqual(await page.$$eval('#employeeCareerExpiry tbody tr:first-child td', nodes => nodes.map(node => node.textContent.trim())), ['License', 'Sample Description 1', '-5,381', '18/01/2012']);
      assert.deepEqual(await page.$$eval('#employeeCareerExpiry tbody tr:last-child td', nodes => nodes.map(node => node.textContent.trim())), ['Member', 'OTHERS', '2,911,793', '31/12/9998']);
      const layout = await page.evaluate(() => {
        const main = document.querySelector('.employee-career-content');
        const section = document.querySelector('#employeeCareerExpiry');
        const dateCells = [...section.querySelectorAll('td:nth-child(3), td:nth-child(4)')];
        return {
          overflow: main.scrollWidth > main.clientWidth,
          clippedDates: dateCells.some(node => node.scrollWidth > node.clientWidth + 1),
          fits: section.getBoundingClientRect().width <= main.clientWidth,
          overdueColor: getComputedStyle(dateCells[0]).color,
          expiryColor: getComputedStyle(dateCells[1]).color,
          normalColor: getComputedStyle(dateCells.at(-1)).color
        };
      });
      assert.equal(layout.overflow, false, 'Expiry section must not overflow the phone');
      assert.equal(layout.clippedDates, false, 'Due days and expiry dates remain readable');
      assert.equal(layout.fits, true);
      assert.equal(layout.overdueColor, layout.expiryColor, 'Overdue days and dates share warning styling');
      assert.notEqual(layout.overdueColor, layout.normalColor, 'Future membership expiry stays neutral');

      await page.$eval('#employeeCareerExpiry summary', node => node.focus());
      await page.keyboard.press('Enter');
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.open), false);
      await page.keyboard.press('Enter');
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.open), true);
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-expiry-${theme}-${width}-overview.png`) });
      await page.$eval('.employee-career-content', node => { node.scrollTop = node.scrollHeight; });
      await page.screenshot({ path: path.resolve(__dirname, `employee-career-expiry-${theme}-${width}.png`) });

      await page.click('#employeeCareerTabTeam');
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.hidden), true, 'Expiry section belongs to Individual');
      assert.equal(await page.$$eval('#employeeCareerOptions .employee-career-option', nodes => nodes.length), 6);
      await page.click('#employeeCareerTabIndividual');
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.hidden), false, 'Switching back restores expiry records');
      await page.goto(`${url}?scope=team&theme=${theme}`, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.$eval('#employeeCareerExpiry', node => node.hidden), true, 'Direct Team navigation hides expiry records');
      assert.deepEqual(errors, []);
      console.log(`PASS ${theme} ${width}: expiry records, readable dates, keyboard toggle and Individual scope`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
