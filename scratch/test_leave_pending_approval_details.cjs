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
      'From Date', 'To Date', 'Duration', 'Leave Days/Hours', 'MC Chit No',
      'Reliever', 'Reason', 'Advance Leave', 'Short Notice Leave'
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
      attachmentSeparate: !document.getElementById('detailsAttachmentName')?.closest('[data-leave-approval-general]')
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
      attachmentSeparate: true
    });

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
      actions: [...document.querySelectorAll('#approvalDetailsFooter button')]
        .filter(button => getComputedStyle(button).display !== 'none')
        .map(button => button.textContent.replace(/\s+/g, ' ').trim())
    }));
    assert.equal(creditState.standardDisplay, 'none');
    assert.equal(creditState.creditDisplay, 'flex');
    assert.notEqual(creditState.footerDisplay, 'none');
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
