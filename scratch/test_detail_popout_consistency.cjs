const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const { cases } = require('./capture_detail_dialog_audit.cjs');
const root = path.resolve(__dirname, '..');
const output = path.join(__dirname, 'detail-popout-verification');
const baselineMode = process.argv.includes('--baseline');
const keyboardMode = process.argv.includes('--keyboard');
const commentsMode = process.argv.includes('--comments');
const pendingIndexes = new Set([9,10,11,12,13,14,15,16,21,22,29,30,31,33,35,40]);
// Leave is being revised independently in this shared workspace. Compare its
// current fixed content with the same unadapted page without replacing the old baseline.
const currentReferenceIndexes = new Set([21,22]);
const interactive = process.argv.includes('--interactive') || keyboardMode || commentsMode;
const trace = (...message) => { if (process.argv.includes('--trace')) console.log(...message); };
const only = process.argv.find(arg => arg.startsWith('--only='));
const selected = only ? new Set(only.slice(7).split(',').map(Number)) : null;
const widths = process.argv.includes('--narrow') ? [320, 360] : [450];

async function open(page, job, width, theme) {
  const [file, search = ''] = job.file.split('?');
  await page.bringToFront();
  await page.setViewport({ width, height: width < 400 ? 720 : 950 });
  await page.goto(pathToFileURL(path.join(root, file)).href + '?' + (search ? search + '&' : '') + 'theme=' + theme, { waitUntil: 'domcontentloaded' });
  if (file.includes('prior-pay-data')) await page.waitForSelector('.prior-record-open');
  if (file === 'modules/payroll/options/history.html') await page.waitForSelector('.history-card-main');
  await page.evaluate(code => eval(code), job.code);
  await page.waitForFunction(selector => {
    const el = document.querySelector(selector);
    return el && !el.hidden && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
  }, { timeout: 5000, polling: 50 }, job.overlay);
  await new Promise(resolve => setTimeout(resolve, 350));
}

async function inspect(page, job) {
  return page.evaluate(job => {
    const panel = document.querySelector(job.dialog);
    const overlay = document.querySelector(job.overlay);
    const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
    const fields = [...panel.querySelectorAll('tr')].filter(row => row.cells.length === 2).map(row => ({ label: clean(row.cells[0].textContent), value: clean(row.cells[1].textContent) }));
    for (const row of panel.querySelectorAll('.project-history-detail-row,.tax-relief-detail-row,#priorRecordDetailsFields > div')) {
      fields.push({ label: clean(row.firstElementChild?.textContent), value: clean(row.lastElementChild?.textContent) });
    }
    if (!fields.length) {
      for (const row of panel.querySelectorAll('div')) {
        const spans = [...row.children].filter(node => node.tagName === 'SPAN');
        if (spans.length === 2 && spans.length === row.children.length) fields.push({ label: clean(spans[0].textContent), value: clean(spans[1].textContent) });
      }
    }
    const controls = [...panel.querySelectorAll('input,textarea,select')].map(node => ({ id: node.id, name: node.name, type: node.type, value: node.value, checked: node.checked }));
    const links = [...panel.querySelectorAll('a')].map(node => ({ text: clean(node.textContent), href: node.getAttribute('href'), onclick: node.getAttribute('onclick'), download: node.getAttribute('download') }));
    const buttons = [...panel.querySelectorAll('button')].filter(node => /^(Approve|Resubmit|Cancel|Reject|Backup)$/.test(clean(node.textContent))).map(node => ({ text: clean(node.textContent), onclick: node.getAttribute('onclick'), action: node.dataset.payrollAction || node.dataset.projectApprovalAction || null }));
    const sort = values => values.map(value => JSON.stringify(value)).sort();
    const title = panel.querySelector('h1,h2,h3');
    const header = panel.querySelector('.detail-popout-header') || (() => { let node = title; while (node && node.parentElement !== panel) node = node.parentElement; return node; })();
    const body = panel.querySelector('.detail-popout-body');
    const style = getComputedStyle(panel);
    const headerStyle = getComputedStyle(header);
    const overlayStyle = getComputedStyle(overlay);
    const panelRect = panel.getBoundingClientRect();
    const overlayRect = overlay.getBoundingClientRect();
    const valueCell = panel.querySelector('.detail-popout-value');
    const labelCell = panel.querySelector('.detail-popout-label');
    const visible = node => !!node.getClientRects().length && getComputedStyle(node).display !== 'none';
    const commentLabel = value => /^(?:approver(?: action)? comments|comments)\s*:?$/i.test(clean(value));
    const isCommentRow = row => row.classList.contains('detail-popout-comment-source') || (commentLabel(row.firstElementChild?.textContent) && row.querySelector('input,textarea'));
    const visibleFields = [...panel.querySelectorAll('tr')].filter(row => row.cells.length === 2 && visible(row) && !isCommentRow(row)).map(row => ({ label: clean(row.cells[0].textContent), value: clean(row.cells[1].textContent) }));
    const attachmentLabel = value => /^(attachments?|upload files)\s*:?$/i.test(clean(value));
    const fieldRows = new Set(panel.querySelectorAll('tr,.detail-popout-row,.project-history-detail-row,.tax-relief-detail-row,dl > div,#priorRecordDetailsFields > div'));
    for (const row of panel.querySelectorAll('div')) {
      if (row.children.length === 2 && [...row.children].every(child => child.tagName === 'SPAN')) fieldRows.add(row);
    }
    const attachmentRows = [...fieldRows].filter(row => attachmentLabel(row.firstElementChild?.textContent));
    const tables = [...panel.querySelectorAll('table')];
    const attachmentOwnership = attachmentRows.map(row => ({
      label: clean(row.firstElementChild.textContent), value: clean(row.lastElementChild.textContent),
      table: tables.indexOf(row.closest('table')),
      section: row.closest('[data-detail-section],section[aria-label]')?.getAttribute('data-detail-section') || row.closest('section[aria-label]')?.getAttribute('aria-label') || ''
    }));
    const owners = new Map();
    for (const row of attachmentRows) {
      if (!owners.has(row.parentElement)) owners.set(row.parentElement, new Set());
      const owned = owners.get(row.parentElement);
      owned.add(row);
      if (row.tagName === 'TR' && row.cells.length === 1 && row.nextElementSibling?.tagName === 'TR' && row.nextElementSibling.cells.length === 1) owned.add(row.nextElementSibling);
    }
    const attachmentsLastInOriginalTable = [...owners].every(([owner, rows]) => {
      const children = [...owner.children];
      const first = children.findIndex(child => rows.has(child));
      return children.slice(first).every(child => rows.has(child));
    });
    const commentCards = [...panel.querySelectorAll('.detail-popout-comments')].filter(visible);
    const lastContent = body && [...body.children].filter(visible).at(-1);
    return {
      data: { title: clean(title.textContent), fields: sort(fields), controls: sort(controls), links: sort(links) }, buttons, visibleFields: sort(visibleFields), attachmentOwnership: sort(attachmentOwnership), tableCount: tables.length,
      presentation: {
        panelClass: panel.classList.contains('detail-popout-panel'),
        width: panelRect.width, overlayWidth: overlayRect.width, radius: style.borderRadius, background: style.backgroundColor, opacity: style.opacity,
        gradient: headerStyle.backgroundImage, headerHeight: header.getBoundingClientRect().height,
        overlayBackground: overlayStyle.backgroundColor, overlayBlur: overlayStyle.backdropFilter,
        overlayAlign: overlayStyle.alignItems,
        centerOffset: Math.abs((panelRect.top + panelRect.bottom) / 2 - (overlayRect.top + overlayRect.bottom) / 2),
        topGap: panelRect.top - overlayRect.top, bottomGap: overlayRect.bottom - panelRect.bottom,
        overflow: panel.scrollWidth > panel.clientWidth + 1,
        bodyOverflow: body && getComputedStyle(body).overflowY,
        bodyPadding: body && getComputedStyle(body).padding,
        labelBackground: labelCell && getComputedStyle(labelCell).backgroundColor,
        valueBackground: valueCell && getComputedStyle(valueCell).backgroundColor,
        attachmentTail: attachmentsLastInOriginalTable,
        separateAttachmentTable: !!panel.querySelector('.detail-popout-attachments'),
        comments: commentCards.map(card => ({
          label: clean(card.querySelector('label')?.textContent), radius: getComputedStyle(card).borderRadius,
          padding: getComputedStyle(card).padding, background: getComputedStyle(card).backgroundColor,
          last: card === lastContent, controlHeight: card.querySelector('input,textarea')?.getBoundingClientRect().height,
          controlRadius: card.querySelector('input,textarea') && getComputedStyle(card.querySelector('input,textarea')).borderRadius
        })),
        footerPadding: panel.querySelector('.detail-popout-footer') && getComputedStyle(panel.querySelector('.detail-popout-footer')).padding,
        controlBackgrounds: [...panel.querySelectorAll('.detail-popout-body input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),.detail-popout-body textarea,.detail-popout-body select')].map(control => getComputedStyle(control).backgroundColor),
        footerButtons: [...panel.querySelectorAll('.detail-popout-actions button')].filter(button => getComputedStyle(button).display !== 'none').map(button => ({ text: clean(button.textContent), width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height, background: getComputedStyle(button).backgroundColor })),
        rowCount: fields.length
      }
    };
  }, job);
}

(async () => {
  await fs.mkdir(output, { recursive: true });
  const baseline = baselineMode ? {} : JSON.parse(await fs.readFile(path.join(output, 'baseline.json'), 'utf8'));
  const browser = await puppeteer.launch({ headless: true });
  const results = [];
  let cursor = 0;
  const jobs = cases.flatMap((job, index) => ['dark','light'].flatMap(theme => widths.map(width => ({ ...job, index: index + 1, theme, width })))).filter(job => (!selected || selected.has(job.index)) && (!commentsMode || pendingIndexes.has(job.index)));
  try {
    await Promise.all(Array.from({ length: 3 }, async () => {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      const reference = await context.newPage();
      if (reference) {
        await reference.setRequestInterception(true);
        reference.on('request', req => /detail-popout\.(js|css)(\?|$)/.test(req.url()) ? req.abort() : /^(file:|data:|blob:|about:)/.test(req.url()) ? req.continue() : req.abort());
        reference.on('dialog', dialog => dialog.dismiss());
      }
      await page.setRequestInterception(true);
      page.on('request', req => /^(file:|data:|blob:|about:)/.test(req.url()) ? req.continue() : req.abort());
      page.on('dialog', dialog => dialog.dismiss());
      while (cursor < jobs.length) {
        const job = jobs[cursor++];
        const key = `${job.index}:${job.theme}`;
        const result = { key, width: job.width, group: job.group, name: job.name };
        try {
          trace(key, 'open');
          await open(page, job, job.width, job.theme);
          const current = await inspect(page, job);
          let original;
          if (baselineMode) {
            baseline[key] = current;
          } else {
            const existingData = structuredClone(current.data);
            if (job.index === 33) {
              // Tax Relief now receives the explicitly requested common comments field.
              existingData.fields = existingData.fields.filter(field => JSON.parse(field).label !== 'Approver Action Comments');
              existingData.controls = existingData.controls.filter(control => JSON.parse(control).id !== 'payrollPendingApproverComments');
            }
            if (currentReferenceIndexes.has(job.index)) {
              await open(reference, job, job.width, job.theme);
              original = await inspect(reference, job);
              await page.bringToFront();
              assert.deepEqual(current.data, original.data, 'Current Leave detail information must match its unadapted page');
            } else {
              assert.deepEqual(existingData, baseline[key].data, 'Original detail fields, data, controls and attachment links must be unchanged');
            }
            const p = current.presentation;
            assert.equal(p.panelClass, true, 'Detail must use shared pop-out presentation');
            assert.equal(p.gradient, 'linear-gradient(135deg, rgb(124, 58, 237) 0%, rgb(109, 40, 217) 100%)');
            assert.equal(p.radius, '18px');
            assert.equal(p.opacity, '1');
            assert.ok(Math.abs(p.width - Math.min(380, p.overlayWidth - 32)) <= 1, 'All detail panels must share the same responsive width');
            assert.equal(p.background, job.theme === 'dark' ? 'rgba(22, 21, 46, 0.65)' : 'rgb(255, 255, 255)');
            if (p.labelBackground) assert.equal(p.labelBackground, job.theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgb(241, 245, 249)');
            if (p.valueBackground) assert.equal(p.valueBackground, p.background);
            for (const background of p.controlBackgrounds) assert.equal(background, job.theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgb(241, 245, 249)');
            assert.ok(p.centerOffset <= 1, 'Detail must be centered, not a bottom sheet');
            assert.ok(p.topGap >= 15 && p.bottomGap >= 15, 'Pop-out must be inset from phone edges');
            assert.equal(p.overlayAlign, 'center');
            assert.equal(p.overflow, false);
            assert.equal(p.bodyOverflow, 'auto');
            assert.equal(p.bodyPadding, '12px');
            assert.equal(p.separateAttachmentTable, false, 'Attachments must stay in the original table, without a separate attachment table');
            assert.equal(p.attachmentTail, true, 'Attachments must be the final rows of their own original table');
            const originalActions = baseline[key].buttons.filter(button => button.text !== 'Backup');
            for (const action of originalActions) assert.ok(current.buttons.some(button => button.text === action.text && button.onclick === action.onclick && button.action === action.action), 'Original ' + action.text + ' handler must be preserved');
            for (const button of p.footerButtons) {
              assert.equal(button.background, 'rgb(124, 58, 237)');
              assert.ok(Math.abs(button.height - 40) <= 1, 'Action buttons must use the shared 40px height');
            }
            if (p.footerButtons.length) assert.equal(p.footerPadding, '12px');
            if (baseline[key].buttons.some(button => button.text === 'Backup')) assert.ok(p.footerButtons.some(button => button.text === 'Cancel'), 'Four-button approval footer must provide Cancel');
            if (baseline[key].buttons.length === 3) assert.equal(p.footerButtons.length, 3);
            if (baseline[key].buttons.length === 4) assert.equal(p.footerButtons.length, 4);
            if (commentsMode) {
              assert.equal(p.comments.length, 1, 'Each approval detail must show one approver comments card');
              const card = p.comments[0];
              assert.equal(card.label, 'Approver Action Comments');
              assert.equal(card.radius, '16px');
              assert.equal(card.padding, '12px 14px');
              assert.equal(card.background, p.background);
              assert.equal(card.last, true, 'Comments must be the final visible detail block before approval buttons');
              assert.ok(Math.abs(card.controlHeight - 34) <= 1);
              assert.equal(card.controlRadius, '10px');
              await page.evaluate(selector => {
                const control = document.querySelector(selector + ' .detail-popout-comments:not([hidden]) input,' + selector + ' .detail-popout-comments:not([hidden]) textarea');
                window.__commentsCheck = { control, value: control.value, events: 0 };
                control.value = 'Preserve existing approver input';
                window.__commentsCheck.listener = () => window.__commentsCheck.events++;
                control.addEventListener('input', window.__commentsCheck.listener);
                document.querySelector(selector + ' .detail-popout-body').classList.add('comments-verification');
              }, job.dialog);
              await new Promise(resolve => setTimeout(resolve, 80));
              const preserved = await page.evaluate(selector => {
                const saved = window.__commentsCheck;
                const control = document.querySelector(selector + ' .detail-popout-comments:not([hidden]) input,' + selector + ' .detail-popout-comments:not([hidden]) textarea');
                control.dispatchEvent(new Event('input', { bubbles: true }));
                const result = control === saved.control && control.value === 'Preserve existing approver input' && saved.events === 1;
                control.removeEventListener('input', saved.listener);
                control.value = saved.value;
                document.querySelector(selector + ' .detail-popout-body').classList.remove('comments-verification');
                delete window.__commentsCheck;
                return result;
              }, job.dialog);
              assert.equal(preserved, true, 'Presentation updates must retain the original comment control, input value and listeners');
            }
            if (interactive) {
              trace(key, 'reference');
              if (!original) {
                await open(reference, job, job.width, job.theme);
                original = await inspect(reference, job);
              }
              assert.deepEqual(current.data, original.data, 'The presentation must preserve all current unadapted detail information');
              assert.deepEqual(current.visibleFields, original.visibleFields, 'Visible detail information must match the original page');
              assert.equal(current.tableCount, original.tableCount, 'Presentation must not create additional tables');
              assert.deepEqual(current.attachmentOwnership, original.attachmentOwnership, 'Every attachment must retain its original tab/table ownership');
              if (keyboardMode) {
                const isClosed = selector => {
                  const node = document.querySelector(selector);
                  const style = getComputedStyle(node);
                  return node.hidden || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
                };
                await reference.bringToFront();
                await reference.keyboard.press('Escape');
                await new Promise(resolve => setTimeout(resolve, 450));
                const originallyCloses = await reference.evaluate(isClosed, job.overlay);
                await page.bringToFront();
                await page.keyboard.press('Escape');
                await new Promise(resolve => setTimeout(resolve, 450));
                assert.equal(await page.evaluate(isClosed, job.overlay), originallyCloses, 'Original keyboard dismissal must be preserved');
                await page.evaluate(code => eval(code), job.code);
                await new Promise(resolve => setTimeout(resolve, 350));
                assert.deepEqual((await inspect(page, job)).data, current.data);
              }
              await page.bringToFront();
              const before = await page.evaluate(() => ({ url: location.href, storage: JSON.stringify(localStorage) }));
              trace(key, 'close');
              await page.$eval(job.dialog + ' .detail-popout-close', button => button.click());
              await page.waitForFunction(selector => {
                const node = document.querySelector(selector);
                const style = getComputedStyle(node);
                return node.hidden || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
              }, { timeout: 3000, polling: 50 }, job.overlay);
              // Legacy close animations finish by hiding the overlay on a delayed timer.
              await new Promise(resolve => setTimeout(resolve, 450));
              await page.evaluate(code => eval(code), job.code);
              trace(key, 'reopened');
              await new Promise(resolve => setTimeout(resolve, 350));
              const reopened = await inspect(page, job);
              assert.deepEqual(reopened.data, current.data, 'Closing and reopening must not duplicate attachments or change record data');
              assert.deepEqual(reopened.visibleFields, current.visibleFields);
              assert.deepEqual(reopened.attachmentOwnership, current.attachmentOwnership, 'Reopening must preserve attachment ownership without duplicates');
              const cancel = await page.$(job.dialog + ' .detail-popout-cancel');
              if (cancel) {
                await cancel.evaluate(button => button.click());
                await page.waitForFunction(selector => {
                  const node = document.querySelector(selector);
                  const style = getComputedStyle(node);
                  return node.hidden || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
                }, { timeout: 3000, polling: 50 }, job.overlay);
                await new Promise(resolve => setTimeout(resolve, 450));
                await page.evaluate(code => eval(code), job.code);
                await new Promise(resolve => setTimeout(resolve, 350));
                assert.deepEqual((await inspect(page, job)).data, current.data);
              }
              assert.deepEqual(await page.evaluate(() => ({ url: location.href, storage: JSON.stringify(localStorage) })), before, 'Dismissal must not navigate or save approval decisions');
            }
          }
          result.presentation = current.presentation;
          if (!baselineMode && job.width === 450) {
            result.image = `${job.index}-${job.theme}.png`;
            await (await page.$(job.dialog)).screenshot({ path: path.join(output, result.image) });
            const scrolling = await page.$eval(job.dialog + ' .detail-popout-body', body => {
              if (body.scrollHeight <= body.clientHeight + 2) return false;
              body.scrollTop = body.scrollHeight;
              return true;
            });
            if (scrolling) {
              result.bottomImage = `${job.index}-${job.theme}-bottom.png`;
              await (await page.$(job.dialog)).screenshot({ path: path.join(output, result.bottomImage) });
            }
          }
        } catch (error) { result.error = error.message; }
        trace(key, result.error || 'passed');
        results.push(result);
      }
      await context.close();
    }));
  } finally { await browser.close(); }
  if (baselineMode) await fs.writeFile(path.join(output, 'baseline.json'), JSON.stringify(baseline, null, 2));
  await fs.writeFile(path.join(output, baselineMode ? 'baseline-results.json' : commentsMode ? (widths.length > 1 ? (selected ? 'comments-narrow-subset-results.json' : 'comments-narrow-results.json') : (selected ? 'comments-subset-results.json' : 'comments-results.json')) : keyboardMode ? 'keyboard-results.json' : selected ? 'subset-results.json' : widths.length > 1 ? 'narrow-results.json' : 'results.json'), JSON.stringify(results, null, 2));
  const failures = results.filter(item => item.error);
  for (const failure of failures) console.log(JSON.stringify(failure));
  console.log(`${baselineMode ? 'BASELINE' : 'CHECK'}: ${results.length - failures.length}/${results.length} entries passed.`);
  if (baselineMode) console.log(JSON.stringify(Object.entries(baseline).filter(([key]) => key.endsWith(':dark')).map(([key, item]) => ({ key, actions: item.buttons.map(button => button.text), fields: item.presentation.rowCount }))));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
