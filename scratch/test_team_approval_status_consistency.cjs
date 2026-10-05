const assert = require('node:assert/strict');
const path = require('node:path');
const puppeteer = require('puppeteer');

const expected = {
  approvalCard1: 'pending',
  approvalCard2: 'pending',
  approvalCard3: 'resubmitted',
  approvalCard4: 'pending',
  approvalCardCredit1: 'pending',
  approvalCardCredit2: 'resubmitted',
  approvalCardOfftime1: 'pending',
  approvalCardOfftime2: 'pending',
  approvalCardOfftime3: 'pending'
};

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 900 });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`file://${path.resolve(__dirname, '../leave.html')}`, {
      waitUntil: 'domcontentloaded'
    });

    const result = await page.evaluate(cardExpectations => {
      showLeaveSection('viewTeamApprovals');
      const normalized = value => value.replace(/\s+/g, ' ').trim();
      const cards = {};

      for (const [id] of Object.entries(cardExpectations)) {
        const card = document.getElementById(id);
        const badge = card?.querySelector('.approval-status-badge');
        const button = card?.querySelector('button[title="Options"]');
        button?.click();
        const style = badge ? getComputedStyle(badge) : null;
        cards[id] = {
          status: badge?.dataset.approvalStatus || '',
          text: badge ? normalized(badge.textContent) : '',
          icon: badge?.querySelector('i')?.className || '',
          docStatus: currentSelectedApprovalData?.docStatus || '',
          geometry: style ? {
            display: style.display,
            borderRadius: style.borderRadius,
            padding: style.padding,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight
          } : null
        };
      }

      return cards;
    }, expected);

    const statusText = {
      pending: 'Pending Approval',
      resubmitted: 'Resubmitted'
    };
    const statusIcon = {
      pending: /fa-hourglass-half/,
      resubmitted: /fa-rotate-left/
    };

    for (const [id, status] of Object.entries(expected)) {
      const card = result[id];
      assert.ok(card, `${id} is missing`);
      assert.equal(card.status, status, `${id} status type is inconsistent`);
      assert.equal(card.text, statusText[status], `${id} status text is inconsistent`);
      assert.match(card.icon, statusIcon[status], `${id} status icon is inconsistent`);
      assert.equal(card.docStatus, statusText[status], `${id} detail status must match its card`);
      assert.deepEqual(card.geometry, {
        display: 'flex',
        borderRadius: '12px',
        padding: '4.5px 11px',
        fontSize: '11.5px',
        fontWeight: '800'
      }, `${id} status badge geometry is inconsistent`);
      assert.doesNotMatch(card.text, /Level|Supervisor|Backup|Department|Final|Next|Awaiting|Request/i);
    }

    async function readDisplayedStatus(cardId, statusId) {
      return page.evaluate(async ({ cardId, statusId }) => {
        document.querySelector(`#${cardId} button[title="Options"]`).click();
        triggerViewDetailsFromMenu();
        await new Promise(resolve => setTimeout(resolve, 350));
        return document.getElementById(statusId)?.textContent.trim() || '';
      }, { cardId, statusId });
    }

    assert.equal(await readDisplayedStatus('approvalCard3', 'detailsDocStatus'), 'Resubmitted');
    assert.equal(await readDisplayedStatus('approvalCardCredit2', 'lcDetailsDocStatus'), 'Resubmitted');
    assert.equal(await readDisplayedStatus('approvalCardOfftime1', 'timeOffDetailsDocStatus'), 'Pending Approval');

    assert.deepEqual(pageErrors, []);
    console.log('PASS: All Team Approval cards use consistent Pending Approval or Resubmitted statuses.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});