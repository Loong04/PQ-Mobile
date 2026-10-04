const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const leaveUrl = pathToFileURL(path.resolve(__dirname, '..', 'leave.html')).href;

async function attachFile(page, inputId, handlerName) {
  await page.evaluate(({ inputId, handlerName }) => {
    const input = document.getElementById(inputId);
    const transfer = new DataTransfer();
    transfer.items.add(new File(['test'], 'pexels-pok-rie-33563-136317.jpg', { type: 'image/jpeg' }));
    input.files = transfer.files;
    window[handlerName](input);
  }, { inputId, handlerName });
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 900 });
    await page.goto(leaveUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof showLeaveSection === 'function' && typeof createFormAttachmentItem === 'function');

    await page.evaluate(() => showLeaveSection('viewApplyLeaveForm'));
    await attachFile(page, 'hiddenLeaveFileInput', 'handleFileSelected');

    const applyAttachment = await page.$eval('#uploadedFilesChipsList', list => {
      const row = list.querySelector('.form-attachment-item');
      const name = row.querySelector('.form-attachment-file-name');
      return {
        rowWidth: row.getBoundingClientRect().width,
        listWidth: list.getBoundingClientRect().width,
        textOverflow: getComputedStyle(name).textOverflow,
        whiteSpace: getComputedStyle(name).whiteSpace,
        hasRemoveButton: Boolean(row.querySelector('button.form-attachment-remove'))
      };
    });
    assert.ok(Math.abs(applyAttachment.rowWidth - applyAttachment.listWidth) < 1);
    assert.equal(applyAttachment.textOverflow, 'ellipsis');
    assert.equal(applyAttachment.whiteSpace, 'nowrap');
    assert.equal(applyAttachment.hasRemoveButton, true);

    const themeColors = await page.evaluate(() => {
      const row = document.querySelector('#uploadedFilesChipsList .form-attachment-item');
      document.documentElement.dataset.theme = 'light';
      const light = getComputedStyle(row).backgroundColor;
      document.documentElement.dataset.theme = 'dark';
      const dark = getComputedStyle(row).backgroundColor;
      return { light, dark };
    });
    assert.notEqual(themeColors.light, themeColors.dark);

    await page.click('#uploadedFilesChipsList .form-attachment-remove');
    assert.equal(await page.$$eval('#uploadedFilesChipsList .form-attachment-item', rows => rows.length), 0);

    await page.evaluate(() => triggerFileUpload('file', 'uploadedFilesChipsListCredit'));
    await attachFile(page, 'hiddenLeaveFileInput', 'handleFileSelected');
    assert.equal(await page.$$eval('#uploadedFilesChipsListCredit .form-attachment-item', rows => rows.length), 1);

    await attachFile(page, 'hiddenTimeOffFileInput', 'handleTimeOffFileSelected');
    assert.equal(await page.$$eval('#timeOffFilesChipsList .form-attachment-item', rows => rows.length), 1);

    console.log('PASS: Leave attachment rows render consistently and remain interactive.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
