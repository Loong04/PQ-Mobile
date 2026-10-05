const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const leaveUrl = pathToFileURL(path.resolve(__dirname, '..', 'leave.html')).href;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.setViewport({ width: 390, height: 950 });
    await page.goto(leaveUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.openApprovalThreeDotsMenu === 'function' && typeof window.triggerViewDetailsFromMenu === 'function');

    await page.evaluate(() => showLeaveSection('viewTeamApprovals'));
    const firstApprovalCardText = await page.$eval('#approvalCard1', card => card.textContent.replace(/\s+/g, ' ').trim());
    assert.doesNotMatch(firstApprovalCardText, /Requested On Behalf By|Benjamin Lee|Business Development Executive/);

    await page.evaluate(() => {
      window.openApprovalThreeDotsMenu(
        'Kathleen lee chee dee',
        'MEDICAL LEAVE',
        '15 May 2020',
        'Full Day',
        '',
        {
          docRef: 'VLV000000000792',
          docStatus: 'Final Approval',
          employee: 'EBB21 - Kathleen lee chee dee',
          branch: 'TIMES SQUARE BRANCH',
          department: 'HUMAN RESOURCE',
          leaveYear: '2020',
          cutoffPeriod: '01/01/2020 – 31/12/2020',
          submitter: 'EBB21 - Kathleen lee chee dee',
          submitDate: '12 May 2020',
          fromDate: '15 May 2020',
          toDate: '15 May 2020',
          leaveDays: '1.000',
          mcChitNo: '1231313',
          reliever: '',
          remark: '',
          attachment: 'lighthouse-clip-art-png.png',
          advanceLeave: 'No',
          shortNotice: 'No'
        }
      );
      window.triggerViewDetailsFromMenu();
    });

    await page.waitForFunction(() => document.getElementById('approvalDetailsModalOverlay')?.classList.contains('active'));

    const expectedLabels = [
      'Document Reference', 'Document Status', 'Employee', 'Branch', 'Department',
      'Leave Year', 'Leave Type', 'Cutoff Period', 'Submitter', 'Submit Date',
      'Start Date', 'End Date', 'Duration', 'Leave Days/Hours', 'MC Chit No',
      'Reliever', 'Reason', 'Advance Leave', 'Short Notice Leave', 'Attachment'
    ];
    const labels = await page.$$eval(
      '#standardLeaveDetailsView [data-leave-approval-general] tr > td:first-child',
      cells => cells.map(cell => cell.textContent.replace(/\s+/g, ' ').trim())
    );
    assert.deepEqual(labels, expectedLabels);

    const detail = await page.evaluate(() => ({
      title: document.getElementById('approvalDetailsModalHeaderTitle')?.textContent.trim(),
      docRef: document.getElementById('detailsDocRef')?.textContent.trim(),
      status: document.getElementById('detailsDocStatus')?.textContent.trim(),
      employeeName: document.getElementById('detailsEmployeeName')?.textContent.trim(),
      employeeId: document.getElementById('detailsEmployeeId')?.textContent.trim(),
      branch: document.getElementById('detailsBranch')?.textContent.trim(),
      department: document.getElementById('detailsDepartment')?.textContent.trim(),
      leaveYear: document.getElementById('detailsLeaveYear')?.textContent.trim(),
      leaveType: document.getElementById('detailsLeaveType')?.textContent.trim(),
      cutoff: document.getElementById('detailsCutoffPeriod')?.textContent.trim(),
      submitDate: document.getElementById('detailsSubmitDate')?.textContent.trim(),
      fromDate: document.getElementById('detailsFromDate')?.textContent.trim(),
      toDate: document.getElementById('detailsToDate')?.textContent.trim(),
      duration: document.getElementById('detailsDuration')?.textContent.trim(),
      leaveDays: document.getElementById('detailsLeaveDays')?.textContent.trim(),
      mcChit: document.getElementById('detailsMcChitNo')?.textContent.trim(),
      reliever: document.getElementById('detailsReliever')?.textContent.trim(),
      reason: document.getElementById('detailsReasonText')?.textContent.trim(),
      advanceLeave: document.getElementById('detailsAdvanceLeaveContainer')?.textContent.trim(),
      shortNotice: document.getElementById('detailsShortNoticeContainer')?.textContent.trim(),
      attachment: document.getElementById('detailsAttachmentName')?.textContent.trim(),
      commentsTitle: document.querySelector('.leave-approval-comments label')?.textContent.trim(),
      commentsPlaceholder: document.getElementById('approvalActionCommentsInput')?.placeholder,
      actions: [...document.querySelectorAll('#approvalDetailsFooter button')]
        .filter(button => getComputedStyle(button).display !== 'none')
        .map(button => button.textContent.replace(/\s+/g, ' ').trim()),
      attachmentSeparate: !document.getElementById('detailsAttachmentName')?.closest('[data-leave-approval-general]'),
      attachmentButtonCount: document.getElementById('detailsAttachmentName')?.closest('td')?.querySelectorAll('button').length
    }));

    assert.deepEqual(detail, {
      title: 'Leave Approval',
      docRef: 'VLV000000000792',
      status: 'Final Approval',
      employeeName: 'Kathleen lee chee dee',
      employeeId: '#EBB21',
      branch: 'TIMES SQUARE BRANCH',
      department: 'HUMAN RESOURCE',
      leaveYear: '2020',
      leaveType: 'MEDICAL LEAVE',
      cutoff: '01/01/2020 – 31/12/2020',
      submitDate: '12 May 2020',
      fromDate: '15 May 2020',
      toDate: '15 May 2020',
      duration: 'Full Day',
      leaveDays: '1.000',
      mcChit: '1231313',
      reliever: '—',
      reason: '—',
      advanceLeave: 'No',
      shortNotice: 'No',
      attachment: 'lighthouse-clip-art-png.png',
      commentsTitle: 'Approver Action Comments',
      commentsPlaceholder: 'Add approver action comments (optional)...',
      actions: ['Approve', 'Resubmit', 'Cancel', 'Reject'],
      attachmentSeparate: false,
      attachmentButtonCount: 0
    });

    await page.evaluate(() => {
      window.openApprovalThreeDotsMenu(
        'Siti Nurhaliza',
        'Personal Time Off',
        '23 Sep 2026',
        '2.5 Hours (14:30 - 17:00)',
        'Urgent Family Care',
        {
          docRef: 'VOT000000000281',
          fromDate: '23 Sep 2026',
          duration: '2.5 Hours',
          remark: 'Emergency visit to school clinic for child health concern.',
          approverRemarks: 'Pending supervisor review'
        }
      );
      window.triggerViewDetailsFromMenu();
    });
    await page.waitForFunction(() => document.getElementById('approvalDetailsModalHeaderTitle')?.textContent.trim() === 'Time Off Approval');

    assert.deepEqual(
      await page.$$eval(
        '#timeOffDetailsView [data-time-off-approval-general] tr > td:first-child',
        cells => cells.map(cell => cell.textContent.replace(/\s+/g, ' ').trim())
      ),
      ['Document Status', 'Date', 'Start Time', 'End Time', 'Hours', 'Reason', 'Remarks', 'Approver Remarks']
    );
    assert.deepEqual(
      await page.$$eval(
        '#timeOffDetailsView [data-time-off-approval-general] tr > td:last-child',
        cells => cells.map(cell => cell.textContent.replace(/\s+/g, ' ').trim())
      ),
      [
        'Pending Approval',
        '23 Sep 2026',
        '14:30',
        '17:00',
        '2.5 Hours',
        'Urgent Family Care',
        'Emergency visit to school clinic for child health concern.',
        'Pending supervisor review'
      ]
    );
    assert.equal(await page.$eval('#standardLeaveDetailsView', node => getComputedStyle(node).display), 'none');
    assert.equal(await page.$eval('#timeOffDetailsView', node => getComputedStyle(node).display), 'flex');

    await page.evaluate(() => {
      window.openApprovalThreeDotsMenu(
        'Farhan binti rahmat',
        'REPLACEMENT LEAVE',
        '3 Jul 2024',
        '1.000 Day',
        'OTHERS',
        {
          isCredit: true,
          docRef: 'LVR000000000589',
          docStatus: 'Final Approval',
          employee: 'EBB12 - Farhan binti rahmat',
          creditLeave: 'REPLACEMENT LEAVE',
          creditType: 'Working on Public Holiday',
          submitter: 'EBB12 - Farhan binti rahmat',
          submitDate: '12 Jul 2024',
          fromDate: '3 Jul 2024',
          toDate: '3 Jul 2024',
          creditDays: '1.000',
          effectiveDate: '4 Jul 2024',
          attachment: 'replacement-leave.jpg'
        }
      );
      window.triggerViewDetailsFromMenu();
    });
    await page.waitForFunction(() => document.getElementById('approvalDetailsModalHeaderTitle')?.textContent.trim() === 'Leave Credit Approval');
    const creditState = await page.evaluate(() => ({
      standardDisplay: getComputedStyle(document.getElementById('standardLeaveDetailsView')).display,
      creditDisplay: getComputedStyle(document.getElementById('leaveCreditDetailsView')).display,
      footerDisplay: getComputedStyle(document.getElementById('approvalDetailsFooter')).display,
      statusHasInlineStyle: document.getElementById('lcDetailsDocStatus').hasAttribute('style'),
      attachmentButtonCount: document.getElementById('lcDetailsAttachment').closest('td').querySelectorAll('button').length,
      actions: [...document.querySelectorAll('#approvalDetailsFooter button')]
        .filter(button => getComputedStyle(button).display !== 'none')
        .map(button => button.textContent.replace(/\s+/g, ' ').trim())
    }));
    assert.equal(creditState.standardDisplay, 'none');
    assert.equal(creditState.creditDisplay, 'flex');
    assert.notEqual(creditState.footerDisplay, 'none');
    assert.equal(creditState.statusHasInlineStyle, false);
    assert.equal(creditState.attachmentButtonCount, 0);
    assert.deepEqual(creditState.actions, ['Approve', 'Resubmit', 'Cancel', 'Reject']);
    assert.deepEqual(pageErrors, []);
    console.log('PASS: Leave Pending Approval exposes the required leave application details.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
