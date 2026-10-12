const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files', '--no-sandbox'] });
  const findings = [];
  try {
    const page = await browser.newPage();
    const capture = async (file, label, read, query = '') => {
      await page.goto(pathToFileURL(path.resolve(file)).href + query, { waitUntil: 'load' });
      const values = await page.evaluate(read);
      findings.push({ file, label, values });
    };
    await capture('modules/attendance/options/clocking-history.html', 'Clocking / OT Plan full dates', () => [...document.querySelectorAll('.legacy-history-full-date')].map(n => n.textContent.trim()));
    await capture('modules/attendance/options/feedback-history.html', 'Pending feedback card dates', () => [...document.querySelectorAll('.history-card-ref')].map(n => n.textContent.trim()));
    await capture('modules/attendance/options/attendance.html', 'Shared feedback clock dates and add-date buttons', () => [...document.querySelectorAll('#feedbackModalOverlay .pill-tab, #fbClockCardsTrack .fb-clock-date-label, #fbClockCardsTrack .fb-clock-bottom-date')].map(n => n.textContent.trim()), '?feedbackFrom=pending-feedback&feedbackDate=2025-12-31&feedbackClockTimes=07:02');
    await capture('modules/attendance/options/team.html', 'Feedback approval original / amended clock dates', () => {
      renderFeedbackApprovalDetails({ date: '2026-02-24', punches: [{ date: '2026-02-24', original: '07:02', amended: '06:02' }] });
      return [...document.querySelectorAll('#attFeedbackClockAmendments time')].map(n => n.textContent);
    });
    await capture('team.html', 'Team approval dates', () => [...document.querySelectorAll('.approval-date')].map(n => n.textContent.trim()));
    await capture('team-v2.html', 'Team alternate design approval dates', () => document.body.innerText.split('\n').map(text => text.trim()).filter(text => /Oct 12|Oct 10/.test(text)));
    await capture('payslip.html', 'Root payslip archive payment dates', () => [...document.querySelectorAll('.history-meta')].map(n => n.textContent.trim()));
    await capture('light.html', 'Root home For You approval subtitle', () => [...document.querySelectorAll('.sheet-item-card span')].map(n => n.textContent.trim()).filter(text => text.includes('Oct 12-13')));
    await capture('homedark.html', 'Notification catalog date subtitles', () => NOTIFICATIONS_CATALOG.filter(item => /Oct 12|Sep 02/.test(item.subtitle)).map(item => item.subtitle));
    await capture('modules/claims/index.html', 'Individual travel calendar compact date range', () => {
      window.ClaimsEngine.selectIndividualCalendarDay(28);
      return document.getElementById('individual-trip-detail-card').textContent.replace(/\s+/g, ' ').trim();
    });
    await capture('leave.html', 'Leave history compact date range', () => {
      renderHistoryCards();
      return [...document.querySelectorAll('.history-item-card')].map(n => n.textContent.replace(/\s+/g, ' ').trim()).filter(text => text.includes('10 Sep - 11 Sep 2026'));
    });
    await capture('leave.html', 'Expiring credit tabs without parentheses', () => {
      const buttons = [...document.querySelectorAll('#expiringTimeframeFilterScroller button')];
      return buttons.map(button => {
        button.click();
        return { text: button.textContent.trim(), visible: [...document.querySelectorAll('.expiring-credit-card')].filter(card => card.style.display !== 'none').length };
      });
    });
    fs.writeFileSync(path.join(__dirname, 'incomplete-date-runtime-audit.json'), JSON.stringify(findings, null, 2));
    for (const finding of findings) console.log(JSON.stringify(finding));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
