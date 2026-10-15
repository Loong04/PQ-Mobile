const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'modules/training-competency/options/training-clocking.html');
const pageUrl = theme => `${pathToFileURL(pagePath).href}?theme=${theme}`;
const storageKey = 'peoplehcm.trainingClocking.records.v1.EBB12';
const legacyStorageKey = 'peoplehcm.trainingClocking.records.v1';

async function open(page, theme = 'dark') {
  await page.goto(pageUrl(theme), { waitUntil: 'domcontentloaded' });
}

async function buttonState(page) {
  return page.evaluate(() => ({
    clockInDisabled: document.getElementById('trainingClockIn').disabled,
    clockOutDisabled: document.getElementById('trainingClockOut').disabled
  }));
}

async function rows(page) {
  return page.$$eval('#trainingClockingRows tr:not([data-preview])', records => records.map(record =>
    [...record.cells].map(cell => cell.textContent.trim())
  ));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files', '--no-sandbox']
  });
  const pageErrors = [];

  try {
    const page = await browser.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await open(page);
    await page.evaluate(keys => keys.forEach(key => localStorage.removeItem(key)), [storageKey, legacyStorageKey]);
    await page.reload({ waitUntil: 'domcontentloaded' });

    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Training Clocking');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    assert.equal(await page.$eval('#trainingClockingBack', node => node.getAttribute('href')), '../index.html?scope=individual&theme=dark');
    assert.deepEqual(await page.$$eval('.training-clocking-now-item span', nodes => nodes.map(node => node.textContent.trim())), ['Day', 'Date', 'Time']);

    const current = await page.evaluate(() => ({
      day: document.getElementById('trainingClockingDay').textContent.trim(),
      date: document.getElementById('trainingClockingDate').textContent.trim(),
      time: document.getElementById('trainingClockingTime').textContent.trim()
    }));
    assert.match(current.day, /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/);
    assert.match(current.date, /^\d{2} [A-Z][a-z]{2} \d{4}$/);
    assert.match(current.time, /^\d{2}:\d{2}:\d{2}$/);
    await page.waitForFunction(previous => document.getElementById('trainingClockingTime').textContent.trim() !== previous, { timeout: 2500 }, current.time);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
    const pausedTime = await page.$eval('#trainingClockingTime', node => node.textContent.trim());
    await new Promise(resolve => setTimeout(resolve, 1100));
    assert.equal(await page.$eval('#trainingClockingTime', node => node.textContent.trim()), pausedTime, 'Page hide pauses the live clock');
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await page.waitForFunction(previous => document.getElementById('trainingClockingTime').textContent.trim() !== previous, { timeout: 2500 }, pausedTime);

    assert.deepEqual(await page.$$eval('#trainingClockingTable thead th', nodes => nodes.map(node => node.textContent.trim())), ['Date', 'Type', 'Time']);
    assert.deepEqual(await page.$$eval('#trainingClockingRows tr[data-preview]', records => records.map(record => record.cells[1].textContent.trim())), ['Clock Out', 'Clock In', 'Clock Out', 'Clock In'], 'History displays two sample training sessions');
    assert.deepEqual(await rows(page), []);
    assert.equal(await page.$eval('#trainingClockingEmpty', node => node.hidden), true);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), null, 'Preview rows are never saved as employee clocking records');
    assert.deepEqual(await buttonState(page), { clockInDisabled: false, clockOutDisabled: true });

    await page.click('#trainingClockIn');
    const afterClockIn = await rows(page);
    assert.equal(afterClockIn.length, 1);
    assert.equal(afterClockIn[0][0], await page.$eval('#trainingClockingDate', node => node.textContent.trim()));
    assert.equal(afterClockIn[0][1], 'Clock In');
    assert.match(afterClockIn[0][2], /^\d{2}:\d{2}:\d{2}$/);
    assert.deepEqual(await buttonState(page), { clockInDisabled: true, clockOutDisabled: false });
    assert.equal(await page.$eval('#trainingClockingStatus', node => node.textContent.trim()), `Clocked in at ${afterClockIn[0][2]}`);
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).map(record => ({
      type: record.type,
      employeeId: record.employeeId
    })), storageKey), [{ type: 'Clock In', employeeId: 'EBB12' }]);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), legacyStorageKey), null, 'Clocking records do not use a shared cross-employee key');

    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.deepEqual((await rows(page)).map(record => record[1]), ['Clock In'], 'Clocking records persist after reload');
    assert.deepEqual(await buttonState(page), { clockInDisabled: true, clockOutDisabled: false }, 'Clocked-in state persists after reload');

    await page.click('#trainingClockOut');
    const afterClockOut = await rows(page);
    assert.equal(afterClockOut.length, 2);
    assert.deepEqual(afterClockOut.map(record => record[1]), ['Clock Out', 'Clock In']);
    assert.deepEqual(await buttonState(page), { clockInDisabled: false, clockOutDisabled: true });
    assert.equal(await page.$eval('#trainingClockingStatus', node => node.textContent.trim()), `Clocked out at ${afterClockOut[0][2]}`);
    await page.$eval('#trainingClockOut', button => button.click());
    assert.equal((await rows(page)).length, 2, 'Disabled Clock Out cannot add a duplicate record');

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
        await open(page, theme);
        const layout = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          nowColumns: getComputedStyle(document.getElementById('trainingClockingNow')).gridTemplateColumns.split(' ').length,
          actionColumns: getComputedStyle(document.querySelector('.training-clocking-actions')).gridTemplateColumns.split(' ').length,
          backHref: document.getElementById('trainingClockingBack').getAttribute('href')
        }));
        assert.equal(layout.theme, theme);
        assert.ok(layout.overflow <= 1, `${theme} ${width}px has no horizontal overflow`);
        assert.equal(layout.nowColumns, 3, `${theme} ${width}px keeps Day, Date and Time in one row`);
        assert.equal(layout.actionColumns, 2, `${theme} ${width}px keeps clock actions side by side`);
        assert.equal(layout.backHref, `../index.html?scope=individual&theme=${theme}`);
      }
    }

    await page.evaluate(key => localStorage.setItem(key, '{invalid-json'), storageKey);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.deepEqual(await rows(page), [], 'Invalid stored data falls back to an empty history');
    assert.equal(await page.$$eval('#trainingClockingRows tr[data-preview]', records => records.length), 4, 'Sample history remains visible when saved history is unavailable');
    assert.deepEqual(await buttonState(page), { clockInDisabled: false, clockOutDisabled: true });

    assert.deepEqual(pageErrors, [], `Page should have no JavaScript errors: ${pageErrors.join('; ')}`);
    console.log('PASS: Training Clocking live time, actions, persisted table, themes and responsive layout.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
