const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const listPath = path.join(root, 'modules/training-competency/options/training-feedback.html');
const listUrl = theme => `${pathToFileURL(listPath).href}?theme=${theme}`;
const responseKey = 'peoplehcm.trainingFeedback.responses.v1.EBB12';

async function open(page, theme = 'dark') {
  await page.goto(listUrl(theme), { waitUntil: 'domcontentloaded' });
}

async function cardIds(page) {
  return page.$$eval('#trainingFeedbackList .training-feedback-card', cards => cards.map(card => card.dataset.feedbackId));
}

async function clickVisible(page, selector) {
  await page.$eval(selector, node => node.scrollIntoView({ block: 'center' }));
  await page.click(selector);
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
    await page.evaluate(key => localStorage.removeItem(key), responseKey);
    await page.reload({ waitUntil: 'domcontentloaded' });

    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Training Feedback');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    assert.equal(await page.$eval('#trainingFeedbackBack', node => node.getAttribute('href')), '../index.html?scope=individual&theme=dark');
    assert.equal(await page.$eval('#trainingFeedbackFilterSummary', node => node.textContent.trim()), 'All Training Feedback');
    assert.equal(await page.$eval('#trainingFeedbackTotalRecords', node => node.textContent.trim()), '2');
    assert.deepEqual(await cardIds(page), ['leadership-crisis-feedback', 'microsoft-feedback']);
    assert.deepEqual(await page.$$eval('.training-feedback-card', cards => cards.map(card => ({
      historyCard: card.classList.contains('history-card-item'),
      header: card.querySelector('.history-card-title').textContent.trim(),
      date: card.querySelector('.history-card-ref').textContent.trim(),
      labels: [...card.querySelectorAll('.training-feedback-card-detail span')].map(node => node.textContent.trim()),
      status: card.querySelector('[data-feedback-status]').textContent.trim(),
      statusTheme: card.dataset.status,
      action: card.querySelector('.training-feedback-action').textContent.trim(),
      hasArrow: Boolean(card.querySelector('.fa-chevron-right'))
    }))), [
      { historyCard: true, header: 'Feedback', date: '16 Jun 2026', labels: ['Description'], status: 'Pending', statusTheme: 'pending', action: 'Feedback', hasArrow: false },
      { historyCard: true, header: 'Feedback', date: '24 Sept 2026', labels: ['Description'], status: 'Completed', statusTheme: 'completed', action: 'Feedback', hasArrow: false }
    ]);
    await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
      'leadership-crisis-feedback': {
        remark: '   ',
        ratings: {
          'trainer-knowledge': 4,
          'trainer-preparation': 4,
          'trainer-participation': 4,
          'trainer-response': 4,
          'session-interest': 4
        },
        attachments: []
      }
    })), responseKey);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('[data-feedback-id="leadership-crisis-feedback"] [data-feedback-status]', node => node.textContent.trim()), 'Pending', 'Whitespace-only persisted feedback is not treated as Completed');
    await page.evaluate(key => localStorage.removeItem(key), responseKey);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await clickVisible(page, '[data-feedback-id="microsoft-feedback"] .training-feedback-action');
    await page.waitForSelector('#trainingFeedbackForm');
    assert.match(await page.$eval('#trainingFeedbackRemark', node => node.value), /useful/i, 'A Completed record has persisted feedback content');
    assert.deepEqual(await page.$$eval('[data-rating-value]', nodes => nodes.map(node => node.textContent.trim())), ['4', '4', '4', '4', '4']);
    await page.click('#trainingFeedbackFormBack');
    await page.waitForSelector('#trainingFeedbackList');

    await page.click('#trainingFeedbackFilterTrigger');
    assert.equal(await page.$eval('preview-top-bar', node => node.inert), true, 'Filter sheet isolates the external theme controls');
    assert.deepEqual(await page.$$eval('#trainingFeedbackFilterForm [data-filter-field]', nodes => nodes.map(node => node.dataset.filterField)), ['start-date', 'end-date', 'status']);
    assert.deepEqual(await page.$eval('#trainingFeedbackFilterStatus', select => [...select.options].map(option => option.textContent.trim())), ['All Statuses', 'Pending', 'Completed']);
    await page.$eval('#trainingFeedbackFilterStart', input => { input.value = '2026-08-01'; });
    await page.$eval('#trainingFeedbackFilterEnd', input => { input.value = '2026-07-01'; });
    await page.click('#trainingFeedbackApplyFilter');
    assert.equal(await page.$eval('#trainingFeedbackFilterOverlay', node => node.hidden), false);
    assert.match(await page.$eval('#trainingFeedbackFilterError', node => node.textContent), /End Date.*Start Date/);
    await page.$eval('#trainingFeedbackFilterStart', input => { input.value = ''; });
    await page.$eval('#trainingFeedbackFilterEnd', input => { input.value = ''; });
    await page.select('#trainingFeedbackFilterStatus', 'Pending');
    await page.click('#trainingFeedbackApplyFilter');
    assert.equal(await page.$eval('preview-top-bar', node => node.inert), false);
    assert.deepEqual(await cardIds(page), ['leadership-crisis-feedback']);
    assert.equal(await page.$eval('#trainingFeedbackFilterSummary', node => node.textContent.trim()), 'Pending');
    assert.equal(await page.$eval('#trainingFeedbackTotalRecords', node => node.textContent.trim()), '1');
    await page.click('#trainingFeedbackFilterTrigger');
    await page.click('#trainingFeedbackResetFilter');
    assert.deepEqual(await cardIds(page), ['leadership-crisis-feedback', 'microsoft-feedback']);
    assert.equal(await page.$eval('#trainingFeedbackTotalRecords', node => node.textContent.trim()), '2');

    await clickVisible(page, '[data-feedback-id="leadership-crisis-feedback"] .training-feedback-action');
    await page.waitForSelector('#trainingFeedbackForm');
    assert.match(page.url(), /training-feedback-form\.html\?theme=dark&feedback=leadership-crisis-feedback$/);
    assert.equal(await page.$eval('h1', node => node.textContent.trim()), 'Training Feedback');
    assert.equal(await page.$eval('#trainingFeedbackFormBack', node => node.getAttribute('href')), 'training-feedback.html?theme=dark');
    assert.deepEqual(await page.$eval('#trainingFeedbackGeneralToggle', button => ({
      expanded: button.getAttribute('aria-expanded'),
      controls: button.getAttribute('aria-controls'),
      icon: button.querySelector('i').className
    })), {
      expanded: 'true',
      controls: 'trainingFeedbackGeneralBody',
      icon: 'fa-solid fa-chevron-down'
    });
    await page.click('#trainingFeedbackGeneralToggle');
    assert.equal(await page.$eval('#trainingFeedbackGeneralBody', node => node.hidden), true);
    assert.equal(await page.$eval('#trainingFeedbackGeneralToggle', node => node.getAttribute('aria-expanded')), 'false');
    assert.equal(await page.$eval('#trainingFeedbackGeneralToggle i', node => node.className), 'fa-solid fa-chevron-right');
    await page.click('#trainingFeedbackGeneralToggle');
    assert.equal(await page.$eval('#trainingFeedbackGeneralBody', node => node.hidden), false);
    assert.deepEqual(await page.$$eval('.training-feedback-general-row dt', nodes => nodes.map(node => node.textContent.trim())), ['Course', 'Start Date', 'End Date']);
    assert.deepEqual(await page.$$eval('.training-feedback-general-row dd', nodes => nodes.map(node => node.textContent.trim())), ['Leadership & Crisis Management', '15 Jun 2026', '16 Jun 2026']);
    assert.equal(await page.$eval('#trainingFeedbackRemark', node => node.required), true);
    assert.deepEqual(await page.evaluate(() => ({
      filesMultiple: document.getElementById('trainingFeedbackFiles').multiple,
      cameraAccept: document.getElementById('trainingFeedbackCamera').accept,
      cameraCapture: document.getElementById('trainingFeedbackCamera').getAttribute('capture'),
      uploadHeading: document.querySelector('.training-feedback-upload legend').textContent.trim(),
      uploadLabels: [...document.querySelectorAll('.training-feedback-upload-button')].map(button => button.textContent.trim()),
      iconWrappers: document.querySelectorAll('.training-feedback-upload-icon').length,
      cameraStyle: document.querySelector('[data-file-target="trainingFeedbackCamera"]').classList.contains('is-camera')
    })), {
      filesMultiple: true,
      cameraAccept: 'image/*',
      cameraCapture: 'environment',
      uploadHeading: 'Upload Attachment',
      uploadLabels: ['Select File(s)', 'Take a Picture'],
      iconWrappers: 2,
      cameraStyle: true
    });

    await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
      'microsoft-feedback': {
        remark: 'Saved response with an existing attachment.',
        ratings: {
          'trainer-knowledge': 4,
          'trainer-preparation': 4,
          'trainer-participation': 4,
          'trainer-response': 4,
          'session-interest': 4
        },
        attachments: [{
          name: 'existing.txt',
          type: 'text/plain',
          size: 1.4 * 1024 * 1024,
          dataUrl: 'data:text/plain;base64,eA=='
        }]
      }
    })), responseKey);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const file = new File(['new'], 'new-record.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1.2 * 1024 * 1024 });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      const input = document.getElementById('trainingFeedbackFiles');
      Object.defineProperty(input, 'files', { value: transfer.files, configurable: true });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => /all feedback responses/i.test(document.getElementById('trainingFeedbackFormError').textContent));
    assert.equal(await page.$eval('#trainingFeedbackAttachments', node => node.children.length), 0, 'Attachment limit covers all saved feedback responses');
    await page.evaluate(key => localStorage.removeItem(key), responseKey);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      const NativeImage = window.Image;
      const nativeCreateElement = document.createElement.bind(document);
      const nativeCreateObjectURL = URL.createObjectURL.bind(URL);
      const nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
      window.Image = class {
        constructor() {
          this.naturalWidth = 1800;
          this.naturalHeight = 1200;
          this.listeners = {};
        }
        addEventListener(type, listener) { this.listeners[type] = listener; }
        set src(value) { setTimeout(() => this.listeners.load?.(), 0); }
      };
      document.createElement = tagName => {
        if (tagName !== 'canvas') return nativeCreateElement(tagName);
        return {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage() {} }),
          toBlob: callback => callback(new Blob(['jpeg'], { type: 'image/jpeg' }))
        };
      };
      URL.createObjectURL = () => 'blob:training-feedback-test';
      URL.revokeObjectURL = () => {};
      window.__restoreTrainingFeedbackImageMocks = () => {
        window.Image = NativeImage;
        document.createElement = nativeCreateElement;
        URL.createObjectURL = nativeCreateObjectURL;
        URL.revokeObjectURL = nativeRevokeObjectURL;
      };
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(1.6 * 1024 * 1024)], 'large-source.png', { type: 'image/png' }));
      const input = document.getElementById('trainingFeedbackFiles');
      Object.defineProperty(input, 'files', { value: transfer.files, configurable: true });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => document.getElementById('trainingFeedbackAttachments').children.length === 1);
    assert.deepEqual(await page.$eval('#trainingFeedbackAttachments a', node => ({
      name: node.textContent.trim(),
      download: node.download,
      type: node.href.split(';')[0]
    })), {
      name: 'large-source.jpg',
      download: 'large-source.jpg',
      type: 'data:image/jpeg'
    }, 'Optimized JPEG attachment uses a matching file extension');
    assert.equal(await page.$$('#trainingFeedbackAttachments .training-feedback-attachment-remove').then(nodes => nodes.length), 1);
    await page.click('#trainingFeedbackAttachments .training-feedback-attachment-remove');
    assert.equal(await page.$eval('#trainingFeedbackAttachments', node => node.children.length), 0, 'Selected attachments can be removed');
    await page.evaluate(() => window.__restoreTrainingFeedbackImageMocks());
    await page.reload({ waitUntil: 'domcontentloaded' });

    assert.deepEqual(await page.$$eval('#trainingFeedbackRatings thead th', nodes => nodes.map(node => node.textContent.trim())), ['Feedback Criteria', 'Rating', 'Edit']);
    assert.equal(await page.$$('.training-feedback-rating-row').then(rows => rows.length), 5);
    assert.deepEqual(await page.$$eval('[data-rating-value]', nodes => nodes.map(node => node.textContent.trim())), ['0', '0', '0', '0', '0']);
    assert.equal(await page.$$('.training-feedback-edit-rating i').then(nodes => nodes.length), 0, 'Rating Edit actions are text only');

    await clickVisible(page, '.training-feedback-edit-rating');
    assert.equal(await page.$eval('#trainingFeedbackRatingOverlay', node => node.hidden), false);
    assert.match(await page.$eval('#trainingFeedbackRatingCriterion', node => node.textContent), /trainer was knowledgeable/i);
    assert.deepEqual(await page.$$eval('[data-rating-option]', nodes => nodes.map(node => node.textContent.trim())), ['1', '2', '3', '4', '5']);
    assert.deepEqual(await page.$$eval('[data-rating-option]', nodes => nodes.map(node => node.tabIndex)), [0, -1, -1, -1, -1], 'Rating options use one roving tab stop');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.ratingOption), '1');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.ratingOption), '2');
    assert.equal(await page.$eval('[data-rating-option="2"]', node => node.getAttribute('aria-checked')), 'true');
    for (let index = 0; index < 5; index += 1) await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.getElementById('trainingFeedbackRatingOverlay').contains(document.activeElement)), true, 'Rating sheet traps keyboard focus');
    await page.click('[data-rating-option="5"]');
    await page.click('#trainingFeedbackSaveRating');
    assert.equal(await page.$eval('[data-rating-value]', node => node.textContent.trim()), '5');
    await page.type('#trainingFeedbackRemark', 'The training was practical and clearly delivered.');
    await page.evaluate(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['notes'], 'session-notes.txt', { type: 'text/plain' }));
      const input = document.getElementById('trainingFeedbackFiles');
      Object.defineProperty(input, 'files', { value: transfer.files, configurable: true });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => document.getElementById('trainingFeedbackAttachments').textContent.trim() === 'session-notes.txt');
    assert.equal(await page.$eval('#trainingFeedbackAttachments .training-feedback-attachment-remove', node => node.getAttribute('aria-label')), 'Remove session-notes.txt');
    await page.evaluate(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([new Uint8Array(2 * 1024 * 1024)], 'oversized-document.pdf', { type: 'application/pdf' }));
      const input = document.getElementById('trainingFeedbackFiles');
      Object.defineProperty(input, 'files', { value: transfer.files, configurable: true });
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => /1\.5 MB/.test(document.getElementById('trainingFeedbackFormError').textContent));
    assert.equal(await page.$eval('#trainingFeedbackAttachments', node => node.textContent.trim()), 'session-notes.txt', 'Oversized attachment is rejected without replacing valid files');
    await clickVisible(page, '#trainingFeedbackSubmit');
    assert.match(await page.$eval('#trainingFeedbackFormError', node => node.textContent), /rate every feedback criterion/i);

    const editButtons = await page.$$('.training-feedback-edit-rating');
    for (let index = 1; index < editButtons.length; index += 1) {
      await editButtons[index].evaluate(node => node.scrollIntoView({ block: 'center' }));
      await editButtons[index].click();
      await page.click('[data-rating-option="4"]');
      await page.click('#trainingFeedbackSaveRating');
    }
    const attachmentBusyState = await page.evaluate(() => {
      const nativeReadAsDataURL = FileReader.prototype.readAsDataURL;
      FileReader.prototype.readAsDataURL = function delayedReadAsDataURL(file) {
        setTimeout(() => nativeReadAsDataURL.call(this, file), 300);
      };
      const transfer = new DataTransfer();
      transfer.items.add(new File(['race'], 'race-notes.txt', { type: 'text/plain' }));
      const input = document.getElementById('trainingFeedbackFiles');
      Object.defineProperty(input, 'files', { value: transfer.files, configurable: true });
      input.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('trainingFeedbackForm').requestSubmit();
      return {
        disabled: document.getElementById('trainingFeedbackSubmit').disabled,
        busy: document.getElementById('trainingFeedbackForm').getAttribute('aria-busy')
      };
    });
    assert.deepEqual(attachmentBusyState, { disabled: true, busy: 'true' }, 'Submission waits while attachments are processed');
    await page.waitForSelector('#trainingFeedbackList');
    assert.match(page.url(), /training-feedback\.html\?theme=dark$/);
    assert.equal(await page.$eval('[data-feedback-id="leadership-crisis-feedback"] [data-feedback-status]', node => node.textContent.trim()), 'Completed');
    assert.deepEqual(await page.evaluate(key => {
      const saved = JSON.parse(localStorage.getItem(key));
      const response = saved['leadership-crisis-feedback'];
      return {
        remark: response.remark,
        ratings: Object.values(response.ratings),
        attachments: response.attachments.map(attachment => ({
          name: attachment.name,
          type: attachment.type,
          dataUrl: attachment.dataUrl
        }))
      };
    }, responseKey), {
      remark: 'The training was practical and clearly delivered.',
      ratings: [5, 4, 4, 4, 4],
      attachments: [
        {
          name: 'session-notes.txt',
          type: 'text/plain',
          dataUrl: 'data:text/plain;base64,bm90ZXM='
        },
        {
          name: 'race-notes.txt',
          type: 'text/plain',
          dataUrl: 'data:text/plain;base64,cmFjZQ=='
        }
      ]
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.$eval('[data-feedback-id="leadership-crisis-feedback"] [data-feedback-status]', node => node.textContent.trim()), 'Completed');
    await clickVisible(page, '[data-feedback-id="leadership-crisis-feedback"] .training-feedback-action');
    await page.waitForSelector('#trainingFeedbackForm');
    assert.equal(await page.$eval('#trainingFeedbackRemark', node => node.value), 'The training was practical and clearly delivered.');
    assert.deepEqual(await page.$$eval('[data-rating-value]', nodes => nodes.map(node => node.textContent.trim())), ['5', '4', '4', '4', '4']);
    assert.deepEqual(await page.$$eval('#trainingFeedbackAttachments a', nodes => nodes.map(node => node.textContent.trim())), ['session-notes.txt', 'race-notes.txt']);
    assert.deepEqual(await page.$eval('#trainingFeedbackAttachments a', node => ({
      href: node.getAttribute('href'),
      download: node.getAttribute('download')
    })), { href: 'data:text/plain;base64,bm90ZXM=', download: 'session-notes.txt' }, 'Persisted attachment content remains downloadable');

    for (const theme of ['dark', 'light']) {
      for (const width of [360, 420]) {
        await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
        await open(page, theme);
        const listLayout = await page.evaluate(() => ({
          theme: document.documentElement.dataset.theme,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          historyBorder: getComputedStyle(document.querySelector('.training-feedback-card')).borderLeftWidth,
          statusShape: getComputedStyle(document.querySelector('.card-status-badge')).borderRadius,
          backHref: document.getElementById('trainingFeedbackBack').getAttribute('href')
        }));
        assert.equal(listLayout.theme, theme);
        assert.ok(listLayout.overflow <= 1, `${theme} ${width}px list has no horizontal overflow`);
        assert.equal(listLayout.historyBorder, '5px');
        assert.notEqual(listLayout.statusShape, '0px');
        assert.equal(listLayout.backHref, `../index.html?scope=individual&theme=${theme}`);

        await clickVisible(page, '[data-feedback-id="leadership-crisis-feedback"] .training-feedback-action');
        await page.waitForSelector('#trainingFeedbackForm');
        assert.ok(await page.$eval('.training-feedback-form-content', node => node.scrollWidth <= node.clientWidth + 1), `${theme} ${width}px form has no overflow`);
        assert.equal(await page.$eval('#trainingFeedbackFormBack', node => node.getAttribute('href')), `training-feedback.html?theme=${theme}`);
      }
    }

    assert.deepEqual(pageErrors, [], `Pages should have no JavaScript errors: ${pageErrors.join('; ')}`);
    console.log('PASS: Training Feedback filtering, cards, ratings, attachments, submission, persistence, themes and responsive layouts.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
