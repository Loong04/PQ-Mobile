const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/admin/options/history.html')).href;
const historyKey = 'peoplehcm:workplace:history:v1';

const records = [
  {
    id: 'guest-0001',
    kind: 'guest-visit',
    title: 'Head Office',
    date: '2026-10-06',
    status: 'submitted',
    createdAt: '2026-10-06T09:30:00+08:00',
    fields: [
      ['Visit Date', '2026-10-06'],
      ['Time', '09:00 \u2013 10:00'],
      ['Total Guest', '1'],
      ['Location', 'Head Office'],
      ['Meal', 'Yes'],
      ['Guest 1', 'Jane Tan \u2022 Meranti Retail \u2022 Customer \u2022 Operations Manager'],
      ['Attendee 1', 'Farhan binti rahmat\n#EBB12\nHuman Resource \u2022 Group HR Manager'],
      ['Other Request', 'Floor Visit, Sitting Arrangement'],
      ['Attachments', 'visitor-list.pdf']
    ]
  },
  {
    id: 'letter-0005',
    kind: 'letter-request',
    title: 'Letter of Guarantee',
    date: '2026-10-05',
    status: 'approved',
    createdAt: '2026-10-05T11:20:00+08:00',
    fields: [
      ['Letter Type', 'Letter of Guarantee'],
      ['Description', 'Guarantee Letter'],
      ['1st Merge Text', 'Ward A'],
      ['2nd Merge Text', ''],
      ['3rd Merge Text', ''],
      ['Reason', 'To apply admission to Hospital'],
      ['Remarks', 'Urgent admission'],
      ['FileName', 'guarantee-letter.pdf'],
      ['Acknowledged On', '11 Jul 2026']
    ]
  }
];

const detailLabels = () => [...document.querySelectorAll('#historyDetailBody .history-detail-main-table th')].map(node => node.textContent.trim());

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--allow-file-access-from-files']
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(pageUrl + '?category=guest-visit&theme=light', { waitUntil: 'load' });
    await page.evaluate((key, seededRecords) => localStorage.setItem(key, JSON.stringify(seededRecords)), historyKey, records);
    await page.reload({ waitUntil: 'load' });

    assert.equal(await page.$eval('.history-card-item', node => getComputedStyle(node).borderRadius), '18px');
    assert.match(await page.$eval('.history-card-title', node => node.textContent.trim()), /^FGV\d{13}$/);
    assert.deepEqual(await page.$$eval('.history-card-item .history-card-row', rows => rows.map(row => [
      row.querySelector('span').textContent.replace(':', '').trim(),
      row.querySelector('strong').textContent.trim()
    ])), [
      ['Visit Date', '6 Oct 2026'],
      ['Visit Time', '09:00 \u2013 10:00'],
      ['Visitor', '1']
    ]);
    assert.equal(await page.$eval('.history-card-item .status-pill', node => node.textContent.trim()), 'Submitted');

    await page.click('.history-card-item');
    assert.equal(await page.$eval('#historyDetailTitle', node => node.textContent.trim()), 'Guest Visit Details');
    assert.deepEqual(await page.evaluate(detailLabels), [
      'Reference #', 'Emp #', 'Name', 'Visit Date', 'Visit Time', 'Visitor', 'Submit Date',
      'Location', 'Request Meal?', 'Floor Visit?', 'Sit Arrange?', 'Multi Room?', 'Remarks', 'Status'
    ]);
    assert.equal(await page.$eval('#historyDetailBody [data-detail-field="Emp #"]', node => node.textContent.trim()), '#EBB12');
    assert.deepEqual(await page.$$eval('.history-detail-section-title', nodes => nodes.map(node => node.textContent.trim())), [
      'Guest Information', 'Internal Attendee', 'Attachments'
    ]);
    assert.ok((await page.$eval('#historyDetailBody', node => node.textContent)).includes('Meranti Retail'));
    assert.ok((await page.$eval('#historyDetailBody', node => node.textContent)).includes('visitor-list.pdf'));

    await page.click('#closeHistoryDetails');
    await page.click('[data-history-kind="letter-request"]');
    assert.equal(await page.$eval('.history-card-title', node => node.textContent.trim()), 'Guarantee Letter');
    assert.deepEqual(await page.$$eval('.history-card-item .history-card-row', rows => rows.map(row => [
      row.querySelector('span').textContent.replace(':', '').trim(),
      row.querySelector('strong').textContent.trim()
    ])), [
      ['Submitted Date', '5 Oct 2026'],
      ['Type', 'Letter of Guarantee'],
      ['Acknowledged On', '11 Jul 2026']
    ]);

    await page.click('.history-card-item');
    assert.equal(await page.$eval('#historyDetailTitle', node => node.textContent.trim()), 'Letter Request Details');
    assert.deepEqual(await page.evaluate(detailLabels), [
      'Request Date', 'Reference #', 'Type', 'Status', 'Description', '1st Merge Text',
      '2nd Merge Text', '3rd Merge Text', 'Reason', 'Remark', 'FileName', 'Acknowledged On'
    ]);
    assert.equal(await page.$eval('#historyDetailBody [data-detail-field="FileName"]', node => node.textContent.trim()), 'guarantee-letter.pdf');
    assert.equal(await page.$eval('main', node => node.scrollWidth <= node.clientWidth + 1), true, 'History page must fit the mobile viewport');
    assert.deepEqual(errors, []);
    console.log('PASS: Workplace History cards and grouped details use the consistent design.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
