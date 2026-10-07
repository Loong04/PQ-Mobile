const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  try {
    for (const theme of ['light', 'dark']) {
      for (const [width, height] of [[360, 844], [420, 844], [360, 640]]) {
        const page = await browser.newPage();
        await page.setViewport({ width, height });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/staff-attendance.html')).href + `?theme=${theme}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.staff-card-item');
        await page.click('.filter-trigger-btn');
        await page.waitForSelector('#filterModal.active');
        await new Promise(resolve => setTimeout(resolve, 350));
        await page.screenshot({ path: path.resolve(__dirname, `staff-attendance-filter-${theme}-${width}-${height}.png`) });
        await page.click('#filterModal .standard-filter-close');
        await page.waitForSelector('#filterModal', { hidden: true });
        assert.deepEqual(await page.$eval('#staffVerifyAll', node => ({ checked: node.checked, mixed: node.indeterminate })), { checked: false, mixed: false }, 'Verify All shows an empty checkbox until every visible record is verified');
        await page.click('.verify-all-wrap span');
        assert.equal(await page.$$eval('.staff-card-item .staff-verify-checkbox', nodes => nodes.every(node => node.checked)), true, 'Clicking the Verify All label selects every visible record');
        assert.deepEqual(await page.$eval('#staffVerifyAll', node => ({ checked: node.checked, mixed: node.indeterminate })), { checked: true, mixed: false });
        await page.click('[data-emp-no="000008"] .staff-verify-checkbox');
        assert.deepEqual(await page.$eval('#staffVerifyAll', node => ({ checked: node.checked, mixed: node.indeterminate })), { checked: false, mixed: false }, 'Unchecking one record clears the Verify All checkmark without showing a dash');
        await page.click('.verify-all-wrap span');
        assert.equal(await page.$$eval('.staff-card-item .staff-verify-checkbox', nodes => nodes.every(node => node.checked)), true, 'Verify All selects the remaining unchecked records');
        await page.click('.verify-all-wrap span');
        assert.equal(await page.$$eval('.staff-card-item .staff-verify-checkbox', nodes => nodes.every(node => !node.checked)), true, 'Clicking Verify All again clears every visible record');
        await page.focus('#staffVerifyAll');
        await page.keyboard.press('Space');
        assert.equal(await page.$$eval('.staff-card-item .staff-verify-checkbox', nodes => nodes.every(node => node.checked)), true, 'Keyboard Verify All selects every record');
        await page.click('#staffAttendanceUpdate');
        assert.equal(await page.$eval('#staffAttendanceUpdate', node => node.disabled), true);
        assert.equal(await page.$eval('#staffVerifyAll', node => node.checked), true, 'Saved verified records retain their Verify All state');
        await page.click('#staffVerifyAll');
        assert.equal(await page.$eval('#staffAttendanceUpdate', node => node.disabled), false, 'Clearing Verify All after Update is a new change');
        assert.equal(await page.$$eval('.staff-card-item .staff-verify-checkbox', nodes => nodes.every(node => !node.checked)), true);
        await page.goto(pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/staff-attendance.html')).href + `?theme=${theme}`, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.staff-card-item');
        const initialScroll = await page.$eval('#view-list .main-content', node => ({ height: node.clientHeight, total: node.scrollHeight }));
        assert.ok(initialScroll.total > initialScroll.height, 'Staff list must scroll inside the phone frame');
        await page.hover('#view-list .main-content');
        await page.mouse.wheel({ deltaY: 350 });
        await page.waitForFunction(() => document.querySelector('#view-list .main-content').scrollTop > 0);
        await page.$eval('#view-list .main-content', node => { node.scrollTop = node.scrollHeight; });
        assert.ok(await page.$eval('#view-list .main-content', node => node.scrollTop) > 0, 'Scrolling must reach the last employee');
        assert.ok(await page.$eval('.staff-card-item:last-child', card => card.getBoundingClientRect().bottom <= card.closest('.main-content').getBoundingClientRect().bottom), 'Last employee card is fully accessible');
        await page.$eval('#view-list .main-content', node => { node.scrollTop = 0; });
        assert.equal(await page.$eval('#staffAttendanceUpdate', node => node.disabled), true, 'Update stays visible but disabled before changes');
        await page.screenshot({ path: path.resolve(__dirname, `staff-attendance-${theme}-${width}.png`) });
        assert.equal(await page.$$eval('.staff-card-item', nodes => nodes.length), 4);
        assert.equal(await page.$$eval('.staff-card-item input[type="checkbox"]', nodes => nodes.length), 4, 'Each record has a Verify checkbox');
        const cards = await page.$$eval('.staff-card-item', nodes => nodes.map(card => {
          const name = card.querySelector('.staff-hdr-name');
          const id = card.querySelector('.staff-hdr-empno');
          return {
            radius: getComputedStyle(card).borderRadius,
            id: id.textContent,
            idBelowName: id.getBoundingClientRect().top >= name.getBoundingClientRect().bottom,
            labels: [...card.querySelectorAll('.attendance-record-detail > span')].map(node => node.textContent),
            date: card.querySelector('.attendance-record-reference')?.textContent,
            shift: card.querySelector('.history-time-row')?.textContent,
            status: card.querySelector('.attendance-exception-status')?.textContent.trim(),
            actions: [...card.querySelectorAll('.staff-card-actions button')].map(node => node.textContent.trim())
          };
        }));
        for (const card of cards) {
          assert.equal(card.radius, '18px');
          assert.match(card.id, /^#/);
          assert.equal(card.idBelowName, true);
          assert.deepEqual(card.labels, ['Times', 'Normal Hours', 'OT Hours']);
          assert.match(card.date, /^Date: /);
          assert.ok(card.shift);
          assert.equal(card.status, 'No Exception');
          assert.deepEqual(card.actions, ['Feedback', 'Follow Up']);
        }
        assert.equal(await page.$eval('[data-emp-no="000100"] .staff-verify-checkbox', node => node.checked), true, 'Existing verification state is retained');
        await page.click('[data-emp-no="000008"] .staff-verify-checkbox');
        assert.equal(await page.$eval('#staffAttendanceUpdate', node => node.disabled), false, 'Verification changes enable Update');
        const updateBeforeScroll = await page.$eval('#staffAttendanceUpdate', node => ({ top: node.getBoundingClientRect().top, right: node.getBoundingClientRect().right }));
        await page.$eval('#view-list .main-content', node => { node.scrollTop = node.scrollHeight; });
        const updateAfterScroll = await page.$eval('#staffAttendanceUpdate', node => {
          const button = node.getBoundingClientRect();
          const frame = node.closest('.phone-container').getBoundingClientRect();
          const lastCard = document.querySelector('.staff-card-item:last-child').getBoundingClientRect();
          return { top: button.top, right: button.right, rightGap: frame.right - button.right, bottomGap: frame.bottom - button.bottom, lastCardAboveButton: lastCard.bottom <= button.top };
        });
        assert.equal(updateAfterScroll.top, updateBeforeScroll.top, 'Update does not move when scrolling');
        assert.equal(updateAfterScroll.right, updateBeforeScroll.right);
        assert.ok(updateAfterScroll.rightGap >= 16 && updateAfterScroll.rightGap <= 24 && updateAfterScroll.bottomGap >= 16 && updateAfterScroll.bottomGap <= 24, 'Update is anchored at bottom right');
        assert.equal(updateAfterScroll.lastCardAboveButton, true, 'Bottom spacing keeps the last card actions above Update');
        await page.screenshot({ path: path.resolve(__dirname, `staff-attendance-scroll-bottom-${theme}-${width}.png`) });
        await page.click('#staffAttendanceUpdate');
        assert.equal(await page.$eval('#staffAttendanceUpdate', node => node.disabled), true, 'Update saves the current verification state');
        await page.$eval('#view-list .main-content', node => { node.scrollTop = 0; });
        assert.equal(await page.evaluate(() => masterStaffDataset.find(item => item.cleanEmpNo === '000008').verified), true);
        assert.equal(await page.$eval('#detailsModal', node => getComputedStyle(node).display), 'none', 'Verify does not open details');
        await page.$eval('#filterKeyword', node => { node.value = 'Aqilah'; });
        await page.evaluate(() => renderStaffCards());
        await page.$eval('#filterKeyword', node => { node.value = 'Kavitha'; });
        await page.click('#staffVerifyAll');
        assert.equal(await page.evaluate(() => masterStaffDataset.find(item => item.cleanEmpNo === '000008').verified), false, 'Verify All clears checked records in the visible filter');
        assert.equal(await page.evaluate(() => masterStaffDataset.find(item => item.cleanEmpNo === '000100').verified), true, 'Verify All preserves records outside the filter');
        assert.equal(await page.$eval('.staff-hdr-name', node => node.textContent), 'Aqilah antasha', 'Draft filters do not change the rendered records on verification');
        await page.evaluate(() => history.replaceState({ staffHistorySentinel: true }, ''));
        await page.click('.btn-action-feedback');
        await page.waitForSelector('#feedbackModalOverlay', { visible: true });
        await page.waitForFunction(() => {
          const overlay = document.getElementById('feedbackModalOverlay');
          const sheet = overlay.querySelector('.side-page-content');
          return Math.abs(sheet.getBoundingClientRect().left - overlay.getBoundingClientRect().left) < 2 && Number(getComputedStyle(overlay).opacity) > .99;
        });
        assert.ok(new URL(page.url()).pathname.endsWith('/attendance.html'), 'Staff Feedback reuses the Individual Attendance form');
        const feedbackScroll = await page.$eval('#feedbackModalOverlay .sheet-content', node => {
          node.scrollTop = node.scrollHeight;
          return { top: node.scrollTop, formBottom: node.lastElementChild.getBoundingClientRect().bottom, viewportBottom: node.getBoundingClientRect().bottom };
        });
        assert.ok(feedbackScroll.top > 0 && feedbackScroll.formBottom <= feedbackScroll.viewportBottom, 'Feedback form scrolls to its submit actions');
        assert.equal(await page.$eval('#fbMetaEmployeeName', node => node.textContent), 'Aqilah antasha');
        assert.equal(await page.$eval('#fbMetaEmployeeNo', node => node.textContent), '#000008');
        assert.equal(await page.$eval('#fbMetaDate', node => node.textContent), '20 Sep 2026');
        await page.click('[data-feedback-back]');
        await page.waitForSelector('.staff-card-item');
        assert.equal(await page.evaluate(() => history.state?.staffHistorySentinel), true, 'Feedback Back returns to the original Staff history entry');
        assert.equal(await page.$eval('.staff-hdr-name', node => node.textContent), 'Aqilah antasha', 'Returning preserves the applied filter rather than applying a draft');
        assert.equal(await page.$eval('#filterKeyword', node => node.value), 'Kavitha', 'Returning preserves draft filter fields');
        assert.equal(await page.$eval('#staffAttendanceUpdate', node => node.disabled), false, 'Returning preserves unsaved verification');
        assert.equal(await page.evaluate(() => masterStaffDataset.find(item => item.cleanEmpNo === '000100').verified), true);
        await page.click('.btn-action-follow-up');
        await page.waitForSelector('#view-follow-up', { visible: true });
        assert.equal(await page.$('#view-follow-up [role="dialog"]'), null, 'Follow Up is a page, not a dialog');
        assert.equal(await page.$eval('#view-list', node => getComputedStyle(node).display), 'none');
        assert.equal(await page.$eval('#view-follow-up', node => {
          const view = node.getBoundingClientRect();
          const frame = node.closest('.phone-container').getBoundingClientRect();
          return Math.abs(view.height - frame.height) < 2;
        }), true, 'Follow Up fills the phone view');
        assert.equal(await page.$eval('#followUpEmployeeName', node => node.textContent), 'Aqilah antasha');
        assert.equal(await page.$eval('#followUpEmployeeId', node => node.textContent), '#000008');
        assert.equal(await page.$eval('#followUpDate', node => node.textContent), '20 Sep 2026');
        assert.equal(await page.$eval('#followUpShift', node => node.textContent), '8.30AM-5.30PM (W01)');
        await page.type('#followUpRemarks', 'Check the missing clock entry.');
        await new Promise(resolve => setTimeout(resolve, 300));
        await page.screenshot({ path: path.resolve(__dirname, `staff-attendance-follow-up-${theme}-${width}.png`) });
        const actionsBeforeScroll = await page.$eval('.staff-follow-up-actions', node => node.getBoundingClientRect().top);
        await page.$eval('#followUpRemarks', node => { node.style.height = '500px'; });
        await page.$eval('#staffFollowUpForm .main-content', node => { node.scrollTop = node.scrollHeight; });
        assert.ok(await page.$eval('#staffFollowUpForm .main-content', node => node.scrollTop) > 0, 'Follow Up has its own scrollable content');
        assert.equal(await page.$eval('.staff-follow-up-actions', node => node.getBoundingClientRect().top), actionsBeforeScroll, 'Cancel and Submit stay accessible while Follow Up scrolls');
        await page.$eval('#followUpRemarks', node => { node.style.height = ''; });
        await page.click('#followUpCancel');
        await page.waitForSelector('#view-follow-up', { hidden: true });
        assert.equal(await page.evaluate(() => masterStaffDataset[0].followUps?.length || 0), 0, 'Cancel does not save remarks');
        assert.equal(await page.evaluate(() => document.activeElement.classList.contains('btn-action-follow-up')), true, 'Cancel restores focus to Follow Up');
        await page.click('.btn-action-follow-up');
        assert.equal(await page.$eval('#followUpRemarks', node => node.value), '');
        await page.click('#followUpSubmit');
        assert.equal(await page.$eval('#view-follow-up', node => getComputedStyle(node).display), 'flex', 'Empty remarks do not submit');
        await page.type('#followUpRemarks', 'Please check the clock entry.');
        await page.click('#followUpSubmit');
        await page.waitForSelector('#view-follow-up', { hidden: true });
        assert.equal(await page.evaluate(() => masterStaffDataset[0].followUps[0].remarks), 'Please check the clock entry.');
        await page.$eval('#filterKeyword', node => { node.value = ''; });
        await page.evaluate(() => renderStaffCards());
        await page.$eval('#view-list .main-content', node => { node.scrollTop = node.scrollHeight; });
        const savedScroll = await page.$eval('#view-list .main-content', node => node.scrollTop);
        await page.click('[data-emp-no="004199"] .btn-action-feedback');
        await page.waitForSelector('#feedbackModalOverlay', { visible: true });
        await page.waitForFunction(() => {
          const overlay = document.getElementById('feedbackModalOverlay');
          const sheet = overlay.querySelector('.side-page-content');
          return Math.abs(sheet.getBoundingClientRect().left - overlay.getBoundingClientRect().left) < 2 && Number(getComputedStyle(overlay).opacity) > .99;
        });
        assert.equal(await page.$eval('#fbMetaEmployeeName', node => node.textContent), 'Kavitha Raj');
        assert.equal(await page.$eval('#fbMetaEmployeeNo', node => node.textContent), '#004199');
        assert.equal(await page.$eval('#fbMetaShift', node => node.textContent), '8.00AM-5.00PM (W02)');
        assert.deepEqual(await page.$$eval('#fbClockCardsTrack .fb-clock-pill-blue', nodes => nodes.map(node => node.textContent.trim())), ['07:50']);
        const feedbackAction = width === 420 ? 'draft' : height === 640 ? 'submit' : 'cancel';
        await page.$eval('#feedbackModalOverlay .sheet-content', node => { node.scrollTop = node.scrollHeight; });
        await page.click(`#feedbackModalOverlay .attendance-form-${feedbackAction}`);
        await page.waitForSelector('.staff-card-item');
        assert.equal(await page.$eval('#view-list .main-content', node => node.scrollTop), savedScroll, 'Feedback Back restores list scroll');
        assert.equal(await page.evaluate(() => masterStaffDataset[0].followUps.length), 1, 'Feedback navigation preserves Follow Up submissions');
        await page.click('[data-emp-no="004199"] .btn-action-follow-up');
        assert.equal(await page.$eval('#followUpEmployeeName', node => node.textContent), 'Kavitha Raj');
        assert.equal(await page.$eval('#followUpEmployeeId', node => node.textContent), '#004199');
        assert.equal(await page.$eval('#followUpShift', node => node.textContent), '8.00AM-5.00PM (W02)');
        await page.type('#followUpRemarks', 'Follow up with Kavitha.');
        await page.click('#followUpSubmit');
        await page.waitForSelector('#view-follow-up', { hidden: true });
        assert.equal(await page.evaluate(() => masterStaffDataset.find(item => item.cleanEmpNo === '004199').followUps[0].remarks), 'Follow up with Kavitha.');
        assert.equal(await page.evaluate(() => masterStaffDataset[0].followUps.length), 1, 'Second employee submission does not change the first employee');
        await page.click('[data-emp-no="004199"] .btn-action-follow-up');
        await page.click('#view-follow-up .header-btn-icon');
        await page.waitForSelector('#view-follow-up', { hidden: true });
        await page.click('[data-emp-no="004199"] .btn-action-feedback');
        await page.waitForSelector('#feedbackModalOverlay', { visible: true });
        await page.waitForFunction(() => {
          const overlay = document.getElementById('feedbackModalOverlay');
          const sheet = overlay.querySelector('.side-page-content');
          return Math.abs(sheet.getBoundingClientRect().left - overlay.getBoundingClientRect().left) < 2 && Number(getComputedStyle(overlay).opacity) > .99;
        });
        await page.goBack({ waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.staff-card-item');
        assert.equal(await page.evaluate(() => masterStaffDataset.find(item => item.cleanEmpNo === '004199').followUps.length), 1, 'Browser Back also preserves Staff state');
        assert.equal(await page.evaluate(() => sessionStorage.getItem(staffFeedbackStateKey)), null, 'Return state is consumed after browser Back');
        await page.click('.staff-card-details-trigger');
        await page.waitForSelector('#detailsModal', { visible: true });
        assert.equal(await page.$eval('#staffDetailsName', node => node.textContent), 'Aqilah antasha');
        assert.match(await page.$eval('#detailsModalTableBody', node => node.textContent), /20 Sep 2026/);
        await page.keyboard.press('Escape');
        await page.waitForSelector('#detailsModal', { hidden: true });
        await page.evaluate(() => {
          document.getElementById('filterKeyword').value = '';
          masterStaffDataset[0].exception = 'Missing Clock Out';
          renderStaffCards();
        });
        assert.equal(await page.$eval('.staff-card-item .attendance-exception-status', node => node.textContent.trim()), 'Missing Clock Out');
        assert.equal(await page.$eval('.staff-card-item', node => getComputedStyle(node).borderLeftColor), 'rgb(245, 158, 11)');
        assert.equal(await page.$eval('#view-list .main-content', node => node.scrollWidth > node.clientWidth), false);
        assert.deepEqual(errors, []);
        await page.screenshot({ path: path.resolve(__dirname, `staff-attendance-exception-${theme}-${width}.png`) });
        console.log(`PASS staff attendance ${theme} ${width}x${height}: actual scrolling, fixed Update and save, cards, verification, Feedback and Follow Up`);
        await page.close();
      }
    }
    // A shared Feedback URL opened directly has no Staff history entry to return to.
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage();
      await page.setViewport({ width: 360, height: 640 });
      const url = pathToFileURL(path.resolve(__dirname, '../modules/attendance/options/attendance.html'));
      url.search = new URLSearchParams({ theme, feedbackFrom: 'staff-attendance', feedbackDate: '20 Sep 2026', feedbackEmployeeName: 'Kavitha Raj', feedbackEmployeeNo: '004199' });
      await page.goto(url.href, { waitUntil: 'networkidle0' });
      await page.waitForSelector('#feedbackModalOverlay', { visible: true });
      await page.click('[data-feedback-back]');
      await page.waitForSelector('.staff-card-item');
      assert.ok(new URL(page.url()).pathname.endsWith('/staff-attendance.html'), 'Direct Feedback links return to Staff through the fallback route');
      assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
      await page.close();
      console.log(`PASS direct Staff Feedback return ${theme}`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
