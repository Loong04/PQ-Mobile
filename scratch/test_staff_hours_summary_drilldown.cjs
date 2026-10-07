const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/staff-hours-summary.html')).href, { waitUntil: 'networkidle0' });

    await page.click('.bento-group-work .summary-kpi-card');
    assert.notEqual(await page.$eval('#view-list', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#headerTitle', node => node.textContent.trim()), 'Staff Scheduled Work Days Summary');
    assert.deepEqual(await page.$eval('#staff-list-overview', overview => ({
      records: overview.querySelector('#list-record-count').textContent.trim(),
      totalLabel: overview.querySelector('#staff-list-total-label').textContent.trim(),
      total: overview.querySelector('#staff-list-total-value').textContent.trim(),
      chart: overview.querySelector('.view-chart-btn').textContent.trim()
    })), { records: '5', totalLabel: 'Total Scheduled Days', total: '108.00', chart: 'View Chart' });

    const employeeCards = await page.$$eval('#details-list-container .summary-history-card', cards => cards.map(card => ({
      name: card.querySelector('.staff-name-text').textContent.trim(),
      id: card.querySelector('.staff-name-text').nextElementSibling.textContent.trim(),
      rows: [...card.querySelectorAll('.summary-history-detail')].map(row => row.textContent.replace(/\s+/g, ' ').trim())
    })));
    assert.equal(employeeCards.length, 5);
    assert.equal(employeeCards[0].name, 'John Tan');
    assert.equal(employeeCards[0].id, '#EBB01');
    assert.deepEqual(employeeCards[0].rows, ['Job Title Senior Developer', 'Scheduled Days 22', 'Scheduled Hours 176.00']);
    assert.equal(await page.$$eval('#details-list-container .summary-history-card .fa-chevron-right', icons => icons.length), 0);

    await page.click('#details-list-container .summary-history-card');
    assert.notEqual(await page.$eval('#view-daily-list', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#headerTitle', node => node.textContent.trim()), 'Scheduled Work Days');
    assert.deepEqual(await page.$eval('#daily-list-overview', overview => ({
      records: overview.querySelector('#daily-record-count').textContent.trim(),
      total: overview.querySelector('#daily-total-hours').textContent.trim(),
      chart: overview.querySelector('.view-chart-btn').textContent.trim()
    })), { records: '22', total: '176.00', chart: 'View Chart' });
    assert.equal(await page.$$eval('#daily-list-container .summary-history-card', cards => cards.length), 22);
    assert.equal(await page.$$eval('#daily-list-container .summary-history-card .fa-chevron-right', icons => icons.length), 0);
    assert.deepEqual(await page.$eval('#daily-list-container .summary-history-card', card => ({
      title: card.querySelector('.history-time-row').textContent.trim(),
      date: card.querySelector('.summary-history-date').textContent.trim(),
      rows: [...card.querySelectorAll('.summary-history-detail')].map(row => row.textContent.replace(/\s+/g, ' ').trim())
    })), {
      title: '8:30 AM - 5:30 PM (GROUP A)',
      date: 'Mon, 14 Sep 2026',
      rows: ['Clock Times 08:30 - 17:30', 'Scheduled Hours 8.00']
    });

    await page.click('#daily-list-container .summary-history-card');
    await page.waitForSelector('#modal-attendance-details', { visible: true });
    assert.equal(await page.$eval('#modal-attendance-details h3', node => node.textContent.trim()), 'Attendance Details');
    assert.deepEqual(await page.evaluate(() => ({
      employee: document.getElementById('ad-emp-no').textContent.trim(),
      name: document.getElementById('ad-name').textContent.trim(),
      date: document.getElementById('ad-date').textContent.trim(),
      shift: document.getElementById('ad-shift').textContent.trim(),
      clock: document.getElementById('ad-clock-times').textContent.trim()
    })), {
      employee: '#EBB01',
      name: 'John Tan',
      date: '14 Sep 2026',
      shift: '8:30 AM - 5:30 PM (GROUP A)',
      clock: '08:30 - 17:30'
    });
    await page.click('#modal-attendance-details .modal-close-round');
    await page.waitForSelector('#modal-attendance-details', { hidden: true });

    await page.click('#daily-list-overview .view-chart-btn');
    assert.notEqual(await page.$eval('#view-chart', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#headerTitle', node => node.textContent.trim()), 'Scheduled Work Days (Chart)');
    assert.equal(await page.$$eval('#view-chart .bar-fill', bars => bars.every(bar => {
      const background = getComputedStyle(bar).backgroundImage;
      return background.includes('rgb(124, 58, 237)') && background.includes('rgb(167, 139, 250)');
    })), true);
    await page.evaluate(() => goBack());
    assert.notEqual(await page.$eval('#view-daily-list', node => getComputedStyle(node).display), 'none');
    await page.evaluate(() => goBack());
    assert.notEqual(await page.$eval('#view-list', node => getComputedStyle(node).display), 'none');

    await page.click('#staff-list-overview .view-chart-btn');
    assert.notEqual(await page.$eval('#view-chart', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$$eval('#view-chart .bar-fill', bars => bars.every(bar => {
      const background = getComputedStyle(bar).backgroundImage;
      return background.includes('rgb(124, 58, 237)') && background.includes('rgb(167, 139, 250)');
    })), true);
    await page.evaluate(() => goBack());
    assert.notEqual(await page.$eval('#view-list', node => getComputedStyle(node).display), 'none');
    await page.evaluate(() => goBack());
    assert.notEqual(await page.$eval('#view-dashboard', node => getComputedStyle(node).display), 'none');

    await page.click('.bento-group-work .summary-kpi-card:nth-child(2)');
    assert.equal(await page.$eval('#headerTitle', node => node.textContent.trim()), 'Staff Normal Present Days Summary');
    assert.deepEqual(await page.$eval('#details-list-container .summary-history-card', card => ({
      name: card.querySelector('.staff-name-text').textContent.trim(),
      rows: [...card.querySelectorAll('.summary-history-detail')].map(row => row.textContent.replace(/\s+/g, ' ').trim()),
      arrows: card.querySelectorAll('.fa-chevron-right').length
    })), {
      name: 'John Tan',
      rows: ['Job Title Senior Developer', 'Scheduled Days 22', 'Work Days 22', 'Attendance Rate 100%'],
      arrows: 0
    });

    await page.click('#details-list-container .summary-history-card');
    assert.deepEqual(await page.$eval('#daily-list-overview', overview => ({
      records: overview.querySelector('#daily-record-count').textContent.trim(),
      total: overview.querySelector('#daily-total-hours').textContent.trim()
    })), { records: '22', total: '176.00' });
    assert.deepEqual(await page.$eval('#daily-list-container .summary-history-card', card =>
      [...card.querySelectorAll('.summary-history-detail')].map(row => row.textContent.replace(/\s+/g, ' ').trim())
    ), ['Clock Times 08:30 - 17:30', 'Normal Hours 08:00', 'Exception -']);

    await page.click('#daily-list-container .summary-history-card');
    await page.waitForSelector('#modal-attendance-details', { visible: true });
    assert.deepEqual(await page.evaluate(() => ({
      employee: document.getElementById('ad-emp-no').textContent.trim(),
      normalHours: document.getElementById('ad-normal-hours').textContent.trim(),
      absent: document.getElementById('ad-absent').textContent.trim(),
      exception: document.getElementById('ad-exception').textContent.trim()
    })), { employee: '#EBB01', normalHours: '08:00', absent: 'No', exception: '-' });
    await page.click('#modal-attendance-details .modal-close-round');
    await page.waitForSelector('#modal-attendance-details', { hidden: true });
    assert.deepEqual(errors, []);

    console.log('PASS: Staff Hours drills from staff totals to daily records, charts and attendance details.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
