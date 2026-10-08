const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const pageUrl = pathToFileURL(path.resolve(__dirname, '../modules/admin/options/inventory-request.html')).href;
const historyUrl = pathToFileURL(path.resolve(__dirname, '../modules/admin/options/history.html')).href;
const historyKey = 'peoplehcm:workplace:history:v1';

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
    await page.goto(pageUrl + '?theme=light', { waitUntil: 'load' });
    await page.evaluate(key => localStorage.removeItem(key), historyKey);
    await page.reload({ waitUntil: 'load' });

    assert.equal(await page.$('.admin-coming-card'), null, 'Inventory Request must not remain a placeholder');
    assert.ok(await page.$('#inventoryRequestForm'));
    assert.deepEqual(await page.$$eval('#inventoryRequestForm .claim-field-label', labels => labels.map(label => label.childNodes[0].textContent.trim())), [
      'Request Item', 'Quantity', 'Required By', 'Reason', 'Remarks'
    ]);
    assert.equal(await page.$eval('#inventoryUploadFieldset legend', node => node.textContent.trim()), 'Upload Attachments');
    assert.deepEqual(await page.$$eval('#inventoryUploadActions button', buttons => buttons.map(button => button.textContent.trim())), ['Select File(s)', 'Take a Picture']);
    assert.equal(await page.$eval('main', node => node.scrollWidth <= node.clientWidth + 1), true, 'Inventory form must fit the mobile viewport');

    await page.$eval('#inventoryRequestSubmit', button => button.scrollIntoView({ block: 'center' }));
    await page.click('#inventoryRequestSubmit');
    assert.equal(await page.$eval('#inventoryRequestFeedback', node => node.textContent.trim()), 'Please select a request item to continue.');
    assert.equal(await page.$eval('#inventoryRequestItem', node => node.getAttribute('aria-invalid')), 'true');

    await page.select('#inventoryRequestItem', 'it-accessories');
    await page.$eval('#inventoryRequestQuantity', node => { node.value = '2'; node.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.$eval('#inventoryRequestRequiredBy', node => { node.value = '2026-10-20'; node.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.select('#inventoryRequestReason', 'replacement');
    await page.type('#inventoryRequestRemarks', 'Replacement keyboard and mouse for workstation.');

    const fileInput = await page.$('#inventoryRequestFiles');
    await fileInput.uploadFile(__filename, path.resolve(__dirname, '../package.json'));
    assert.deepEqual(await page.$$eval('#inventoryAttachmentList .form-attachment-item', rows => rows.map(row => ({
      name: row.querySelector('.form-attachment-file-name').textContent.trim(),
      paperclip: row.querySelector('.form-attachment-file-icon').classList.contains('fa-paperclip'),
      removeLabel: row.querySelector('.form-attachment-remove').getAttribute('aria-label')
    }))), [
      { name: 'test_inventory_request.cjs', paperclip: true, removeLabel: 'Remove test_inventory_request.cjs' },
      { name: 'package.json', paperclip: true, removeLabel: 'Remove package.json' }
    ]);
    await page.click('[data-remove-inventory-attachment="0"]');
    assert.deepEqual(await page.$$eval('#inventoryAttachmentList .form-attachment-file-name', nodes => nodes.map(node => node.textContent.trim())), ['package.json']);

    await page.$eval('#inventoryRequestSubmit', button => button.scrollIntoView({ block: 'center' }));
    await page.click('#inventoryRequestSubmit');
    assert.equal(await page.$eval('#inventoryRequestFeedback', node => node.textContent.trim()), 'Inventory request saved to History on this device.');
    const records = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || '[]'), historyKey);
    assert.equal(records.length, 1);
    assert.deepEqual({ kind: records[0].kind, title: records[0].title, fields: records[0].fields }, {
      kind: 'inventory-request',
      title: 'IT Accessories',
      fields: [
        ['Request Item', 'IT Accessories'],
        ['Quantity', '2'],
        ['Required By', '20 Oct 2026'],
        ['Reason', 'Replacement'],
        ['Remarks', 'Replacement keyboard and mouse for workstation.'],
        ['Attachment', 'package.json']
      ]
    });

    await page.goto(historyUrl + '?category=inventory-request&theme=light', { waitUntil: 'load' });
    assert.equal(await page.$eval('[data-history-kind="inventory-request"]', node => node.classList.contains('active')), true);
    assert.equal(await page.$eval('#historyCategoryTitle', node => node.textContent.trim()), 'Inventory Request History');
    assert.equal(await page.$eval('#historyRecordCount', node => node.textContent.trim()), 'Total Records: 3', 'Saved requests coexist with the two screenshot inventory records');
    assert.equal(await page.$eval('#workplaceHistoryList .history-card-title', node => node.textContent.trim()), 'IT Accessories');
    await page.click('#workplaceHistoryList .history-card-item');
    assert.ok((await page.$eval('#historyDetailBody', node => node.textContent)).includes('package.json'));
    assert.deepEqual(errors, []);
    console.log('PASS: Inventory Request form, validation, attachment handling and History storage.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
