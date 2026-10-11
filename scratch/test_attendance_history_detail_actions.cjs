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
          const cancel = footer.querySelector('.attendance-history-action-cancel');
          const submit = footer.querySelector('.attendance-history-action-submit');
          const cancelStyle = getComputedStyle(cancel);
          const submitStyle = getComputedStyle(submit);
          const probe = document.createElement('span');
          probe.style.cssText = 'position:fixed;pointer-events:none;color:var(--bg-card);background:var(--text-primary);border:1px solid var(--border-subtle)';
          document.body.append(probe);
          const probeStyle = getComputedStyle(probe);
          const expected = {
            surface: probeStyle.color,
            text: probeStyle.backgroundColor,
            border: probeStyle.borderTopColor,
          };
          probe.remove();

          return {
            labels: buttons.map(button => button.textContent.trim()),
            buttonCount: buttons.length,
            cancel: {
              background: cancelStyle.backgroundColor,
              color: cancelStyle.color,
              border: cancelStyle.borderTopColor,
              radius: cancelStyle.borderRadius,
              height: cancel.getBoundingClientRect().height,
              hasIcon: Boolean(cancel.querySelector('i.fa-solid.fa-xmark')),
            },
            submit: {
              background: submitStyle.backgroundImage,
              color: submitStyle.color,
              radius: submitStyle.borderRadius,
              height: submit.getBoundingClientRect().height,
              hasIcon: Boolean(submit.querySelector('i.fa-solid.fa-paper-plane')),
            },
            expected,
          };
        });

        assert.deepEqual(actions.labels, ['Cancel', 'Submit']);
        assert.equal(actions.buttonCount, 2, 'History details keep their existing two-action workflow');
        assert.equal(actions.cancel.background, actions.expected.surface, `${detail.modal} Cancel uses the neutral card surface`);
        assert.equal(actions.cancel.color, actions.expected.text, `${detail.modal} Cancel uses the normal text color`);
        assert.equal(actions.cancel.border, actions.expected.border, `${detail.modal} Cancel uses the subtle neutral border`);
        assert.equal(actions.cancel.radius, '999px');
        assert.ok(actions.cancel.height >= 44, `${detail.modal} Cancel matches the reference touch target`);
        assert.ok(actions.cancel.hasIcon, `${detail.modal} Cancel includes the reference x icon`);
        assert.match(actions.submit.background, /linear-gradient\(135deg, rgb\(124, 58, 237\) 0%, rgb\(109, 40, 217\) 100%\)/);
        assert.equal(actions.submit.color, 'rgb(255, 255, 255)');
        assert.equal(actions.submit.radius, '999px');
        assert.ok(actions.submit.height >= 44, `${detail.modal} Submit matches the reference touch target`);
        assert.ok(actions.submit.hasIcon, `${detail.modal} Submit includes the reference paper-plane icon`);

        await page.evaluate(modal => {
          if (modal === 'otDetailsModal') closeOtDetailsDirect();
          else closeFeedbackDetailsDirect();
        }, detail.modal);
        await page.waitForSelector(`#${detail.modal}`, { hidden: true });
      }

      await page.click('#tabFeedback');
      await page.$$eval('#viewFeedbackHistory .history-card-item', cards => cards[1].click());
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
        return { background: style.backgroundColor, color: style.color };
      });
      assert.deepEqual(clockCancel, {
        background: 'rgb(255, 241, 242)',
        color: 'rgb(225, 29, 72)',
      }, 'the unrelated Clocking detail Cancel style remains unchanged');
      await page.evaluate(() => closeClockDetailsDirect());
    }

    assert.deepEqual(pageErrors, []);
    console.log('PASS: OT Plan and Attendance Feedback detail actions match the neutral Cancel and purple Submit reference without changing other Cancel actions.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
