const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/history.html')).href;

    for (const theme of ['light', 'dark']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(`${url}?theme=${theme}`, { waitUntil: 'networkidle0' });
      await page.click('#tabOt');
      await page.waitForSelector('#viewOtHistory', { visible: true });
      await page.$eval('#viewOtHistory .history-card-item', card => card.click());
      await page.waitForSelector('#otDetailsModal', { visible: true });
      await page.waitForFunction(() => document.getElementById('otDetailsModal').classList.contains('is-open'));

      const layout = await page.$eval('#otDetailsModal', overlay => {
        const phone = overlay.closest('.phone-container').getBoundingClientRect();
        const panelNode = overlay.querySelector('.attendance-history-form-page');
        const panel = panelNode.getBoundingClientRect();
        const body = overlay.querySelector('.attendance-history-form-body');
       const actions = overlay.querySelector('.attendance-history-form-actions');
       const fields = [...overlay.querySelectorAll('.attendance-history-form-field')];
        const approver = overlay.querySelector('#modalOtApproverComments');
        const remarks = overlay.querySelector('#modalOtRemarks');
        const approverStyle = getComputedStyle(approver);
        const remarksStyle = getComputedStyle(remarks);
        const cancel = overlay.querySelector('[data-ot-form-cancel]');
        const submit = overlay.querySelector('[data-history-submit]');
        const cancelStyle = getComputedStyle(cancel);
        const submitStyle = getComputedStyle(submit);
       return {
          title: overlay.querySelector('#otPlanFormTitle')?.textContent.trim(),
          hasBack: Boolean(overlay.querySelector('[data-ot-form-back]')),
          hasCloseIcon: Boolean(overlay.querySelector('.modal-close-round')),
          cancelText: overlay.querySelector('[data-ot-form-cancel]')?.textContent.trim(),
          submitText: overlay.querySelector('[data-history-submit]')?.textContent.trim(),
          fullWidth: Math.abs(panel.width - phone.width) <= 1,
          fullHeight: Math.abs(panel.height - phone.height) <= 1,
          dimensions: { phoneWidth: phone.width, phoneHeight: phone.height, panelWidth: panel.width, panelHeight: panel.height },
          overlayPadding: getComputedStyle(overlay).padding,
          fieldsStacked: fields.length >= 10 && fields.every(field => {
            const label = field.querySelector('label')?.getBoundingClientRect();
            const control = field.querySelector('input, textarea, select, .attendance-history-check')?.getBoundingClientRect();
            return label && control && control.top >= label.bottom;
          }),
          fits: panelNode.scrollWidth <= panelNode.clientWidth + 1 && body.scrollWidth <= body.clientWidth + 1,
         actionsVisible: actions.getBoundingClientRect().bottom <= panel.bottom + 1,
          fitMetrics: { panelScrollWidth: panelNode.scrollWidth, panelClientWidth: panelNode.clientWidth, bodyScrollWidth: body.scrollWidth, bodyClientWidth: body.clientWidth, actionsBottom: actions.getBoundingClientRect().bottom, panelBottom: panel.bottom },
          approverField: {
            readOnly: approver.readOnly,
            inFormField: Boolean(approver.closest('.attendance-history-form-field')),
            hasLegacyClass: Boolean(approver.closest('.detail-popout-comments, .detail-popout-body') || approver.classList.contains('detail-popout-comment-control')),
            borderWidth: approverStyle.borderWidth,
            backgroundMatchesRemarks: approverStyle.backgroundColor === remarksStyle.backgroundColor,
            radiusMatchesRemarks: approverStyle.borderRadius === remarksStyle.borderRadius,
            paddingMatchesRemarks: approverStyle.padding === remarksStyle.padding
          },
          switches: [...overlay.querySelectorAll('.attendance-history-form-switch')].map(control => {
            const input = control.querySelector('input[type="checkbox"][role="switch"]');
            const track = control.querySelector('.attendance-history-form-switch-track');
            return {
              id: input?.id,
              checked: input?.checked,
              trackColor: track ? getComputedStyle(track).backgroundColor : ''
            };
          }),
          legacyChecks: overlay.querySelectorAll('.attendance-history-check').length,
          actionStyles: {
            cancel: { backgroundColor: cancelStyle.backgroundColor, color: cancelStyle.color, borderRadius: cancelStyle.borderRadius },
            submit: { backgroundImage: submitStyle.backgroundImage, color: submitStyle.color, borderRadius: submitStyle.borderRadius, disabled: submit.disabled }
          }
       };
      });

      assert.equal(layout.title, 'OT Plan Details');
      assert.ok(layout.hasBack, `${theme}: back button is available`);
      assert.equal(layout.hasCloseIcon, false, `${theme}: modal close icon is removed`);
      assert.equal(layout.cancelText, 'Cancel');
      assert.equal(layout.submitText, 'Submit');
      assert.ok(layout.fullWidth && layout.fullHeight, `${theme}: detail uses the full phone page ${JSON.stringify({ ...layout.dimensions, overlayPadding: layout.overlayPadding })}`);
      assert.ok(layout.fieldsStacked, `${theme}: editable controls use a vertical form layout`);
      assert.ok(layout.fits && layout.actionsVisible, `${theme}: form and bottom actions fit the phone ${JSON.stringify(layout.fitMetrics)}`);
      assert.deepEqual(layout.approverField, { readOnly: true, inFormField: true, hasLegacyClass: false, borderWidth: '1px', backgroundMatchesRemarks: true, radiusMatchesRemarks: true, paddingMatchesRemarks: true });
      assert.deepEqual(layout.switches.map(item => ({ id: item.id, checked: item.checked })), [
        { id: 'modalOtCredit', checked: false },
        { id: 'modalOtTransport', checked: true }
      ], `${theme}: leave credit and transport use native switch controls`);
      assert.equal(layout.switches[1].trackColor, 'rgb(16, 185, 129)', `${theme}: enabled switch uses the standard green state`);
      assert.notEqual(layout.switches[0].trackColor, layout.switches[1].trackColor, `${theme}: disabled switch uses a neutral state`);
      assert.equal(layout.legacyChecks, 0, `${theme}: square checkbox rows are removed`);
      assert.deepEqual(layout.actionStyles.cancel, { backgroundColor: 'rgb(255, 241, 242)', color: 'rgb(225, 29, 72)', borderRadius: '999px' });
      assert.match(layout.actionStyles.submit.backgroundImage, /linear-gradient/);
      assert.deepEqual({ color: layout.actionStyles.submit.color, borderRadius: layout.actionStyles.submit.borderRadius, disabled: layout.actionStyles.submit.disabled }, { color: 'rgb(255, 255, 255)', borderRadius: '999px', disabled: false });

      await page.click('[data-ot-form-cancel]');
      await page.waitForSelector('#otDetailsModal', { hidden: true });
      assert.ok(await page.$eval('#viewOtHistory', view => getComputedStyle(view).display !== 'none'), `${theme}: Cancel returns to OT Plan History`);
    }

    assert.deepEqual(errors, []);
    console.log('PASS: OT Plan History opens a full-page editable form with Back, Cancel and Submit actions.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
