const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const editableDetails = [
  { tab: 'tabOt', view: 'viewOtHistory', modal: 'otDetailsModal' },
  { tab: 'tabFeedback', view: 'viewFeedbackHistory', modal: 'feedbackDetailsModal' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });

  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/history.html')).href;

    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(`${url}?theme=${theme}`, { waitUntil: 'networkidle0' });

      for (const detail of editableDetails) {
        await page.click(`#${detail.tab}`);
        await page.$$eval(`#${detail.view} .history-card-item`, cards => cards[0].click());
        await page.waitForSelector(`#${detail.modal}.is-open`, { visible: true });

        const actions = await page.$eval(`#${detail.modal} .attendance-history-form-actions`, footer => {
          const buttons = [...footer.querySelectorAll(':scope > button')];
          return {
            labels: buttons.map(button => button.textContent.trim()),
            buttonCount: buttons.length,
            footer: {
              justifyContent: getComputedStyle(footer).justifyContent,
              gap: getComputedStyle(footer).gap,
            },
            buttons: buttons.map(button => {
              const style = getComputedStyle(button);
              return {
                background: style.backgroundImage,
                color: style.color,
                radius: style.borderRadius,
                padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
              };
            }),
          };
        });

        assert.deepEqual(actions.labels, ['Cancel', 'Submit']);
        assert.equal(actions.buttonCount, 2, 'History details keep their existing two-action workflow');
        assert.deepEqual(actions.footer, { justifyContent: 'flex-end', gap: '8px' });
        actions.buttons.forEach(button => {
          assert.match(button.background, /linear-gradient\(135deg, rgb\(124, 58, 237\) 0%, rgb\(109, 40, 217\) 100%\)/);
          assert.equal(button.color, 'rgb(255, 255, 255)');
          assert.equal(button.radius, '20px');
          assert.deepEqual(button.padding, ['8px', '16px', '8px', '16px']);
        });

        await page.evaluate(modal => {
          if (modal === 'otDetailsModal') closeOtDetailsDirect();
          else closeFeedbackDetailsDirect();
        }, detail.modal);
        await page.waitForSelector(`#${detail.modal}`, { hidden: true });
      }

      await page.click('#tabFeedback');
      await page.$$eval('#viewFeedbackHistory .history-submit-btn', buttons => buttons[1].click());
      await page.waitForSelector('#feedbackDetailsModal.is-open', { visible: true });
      assert.equal(await page.$eval('#modalFbkDocStatus', node => node.textContent), 'To Resubmit');
      assert.equal(await page.$eval('#feedbackDetailsModal [data-history-submit]', button => button.disabled), false);
      await page.click('#feedbackDetailsModal [data-history-submit]');
      await page.waitForSelector('#feedbackDetailsModal', { hidden: true });
      await page.evaluate(() => openFeedbackDetailsModal('READONLY-FBK', 'Approved', 'EBB12 - Employee', 'Branch', 'Department', '14 Sep 2026', 'Shift', 'EBB12 - Submitter', '14/09/2026', 'Approved'));
      await page.waitForSelector('#feedbackDetailsModal.is-open', { visible: true });
      const disabledSubmit = await page.$eval('#feedbackDetailsModal [data-history-submit]', button => {
        const style = getComputedStyle(button);
        return { disabled: button.disabled, boxShadow: style.boxShadow, cursor: style.cursor };
      });
      assert.deepEqual(disabledSubmit, {
        disabled: true,
        boxShadow: 'none',
        cursor: 'not-allowed',
      }, 'read-only Attendance Feedback keeps the existing disabled Submit treatment');
      await page.evaluate(() => closeFeedbackDetailsDirect());
      await page.waitForSelector('#feedbackDetailsModal', { hidden: true });

      await page.click('#tabClocking');
      await page.$$eval('#viewClockingHistory .history-card-item', cards => cards[0].click());
      await page.waitForSelector('#clockDetailsModal', { visible: true });
      const clockCancel = await page.$eval('#clockDetailsModal .attendance-history-action-cancel', button => {
        const style = getComputedStyle(button);
        const footer = button.closest('footer');
        return {
          background: style.backgroundImage,
          color: style.color,
          radius: style.borderRadius,
          padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
          justifyContent: getComputedStyle(footer).justifyContent,
        };
      });
      assert.deepEqual(clockCancel, {
        background: 'linear-gradient(135deg, rgb(124, 58, 237) 0%, rgb(109, 40, 217) 100%)',
        color: 'rgb(255, 255, 255)',
        radius: '20px',
        padding: ['8px', '16px', '8px', '16px'],
        justifyContent: 'flex-end',
      }, 'Clocking detail Cancel uses the shared History action treatment');
      await page.evaluate(() => closeClockDetailsDirect());
    }

    assert.deepEqual(pageErrors, []);
    console.log('PASS: Clocking, OT Plan and Attendance Feedback detail actions use the shared right-aligned purple History treatment.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
