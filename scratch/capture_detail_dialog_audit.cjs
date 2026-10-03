const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');
const root = path.resolve(__dirname, '..');
const output = path.join(__dirname, 'detail-dialog-audit');
const cases = [];
function add(group, name, file, code, overlay, dialog, related = false) {
  cases.push({ group, name, file, code, overlay, dialog, related });
}
for (const category of ['benefit', 'medical', 'ot', 'travel', 'travelRequest', 'entertainment', 'advance', 'expense']) {
  add('Claims History', category, 'modules/claims/options/history.html',
    `switchClaimTab('${category}'); openClaimDetailsModal(HISTORY_DATA['${category}'][0]);`,
    '#detailsModalOverlay', '#claimDetailsModalContainer');
}
for (const [category, id] of [['Benefit', '1'], ['Medical', '2'], ['OT', '3'], ['Travel Mileage', '6'], ['Travel Request', '12'], ['Entertainment', '5'], ['Advance', '4'], ['Expense', '7']]) {
  add('Claims Pending Approval', category, 'modules/claims/options/pending-approval.html',
    `document.querySelectorAll('.filter-pill').forEach(tab => { if(tab.textContent.trim() === '${category}') tab.click(); }); const claim = window.MOCK_TEAM_APPROVALS.find(item => item.optionName.toLowerCase().includes('${category === 'Travel Mileage' ? 'travel claim' : category.toLowerCase()}')); if (!claim) throw new Error('No matching claim'); window.ClaimsEngine.triggerClaimViewDetails(claim.id);`,
    '#claimDetailsModalOverlay', '#claimDetailsModalOverlay > .indicators-sheet');
}
for (const [tab, data] of [['leave', 'HISTORY_LEAVE_DATA'], ['credit', 'HISTORY_CREDIT_DATA'], ['offtime', 'HISTORY_OFFTIME_DATA']]) {
  add('Leave History', tab, 'leave.html', `showLeaveSection('viewMyHistory'); switchHistoryTab('${tab}'); openHistoryDetailsModal(${data}[0].ref);`,
    '#historyDetailsModalOverlay', '.history-details-dialog');
}
add('Leave Team', 'Employee leave', 'leave.html', `openTeamMemberLeaveDetails(Object.keys(TEAM_LEAVE_DETAILS)[0]);`, '#historyDetailsModalOverlay', '.history-details-dialog');
for (const credit of [false, true]) {
  add('Leave Pending Approval', credit ? 'Leave Credit' : 'Leave', 'leave.html',
    `currentSelectedApprovalData.isCredit = ${credit}; currentApprovalCategory = '${credit ? 'credit' : 'leave'}'; triggerViewDetailsFromMenu();`,
    '#approvalDetailsModalOverlay', '#approvalDetailsModalOverlay > .indicators-sheet');
}
for (const file of ['history.html', 'clocking-history.html']) {
  for (const [name, code, overlay] of [
    ['Clocking', `openClockDetailsModal('CLK-804291','Clock In','23 Sep 2026','08:00','Main Office','Management','No','No');`, '#clockDetailsModal'],
    ['Time Off', `openOtDetailsModal('OTB000000001612','Submitted','Farhan binti rahmat','EBB04','23 Sep 2026','23 Sep 2026','8.00AM-5.30PM','0800,1730','1800','2000','0.00','2.00','OT 1.5','Operations','Review','No','No','Review pending','');`, '#otDetailsModal'],
    ['Attendance Advice', `openFeedbackDetailsModal('AXTGEN000078881','Submitted','Farhan binti rahmat','TIMES SQUARE BRANCH','HUMAN RESOURCE','23 Sep 2026','8.00AM-5.30PM','Farhan binti rahmat','23 Sep 2026','');`, '#feedbackDetailsModal']
  ]) add('Attendance ' + file, name, 'modules/attendance/options/' + file, code, overlay, overlay + ' > div');
}
for (const [category, type] of [['ot_plan', 'OT Plan Request'], ['feedback', 'Attendance Feedback'], ['final_ot', 'Final OT Request']]) {
  add('Attendance Pending Approval', type, 'modules/attendance/options/team.html',
    `currentAttendanceSelectedData = { name:'Farhan binti rahmat', empId:'#EBB12', category:'${category}', type:'${type}', dept:'HUMAN RESOURCE', dates:'23 Sep 2026', duration:'2.0 Hours', otType:'OT 1.5', remark:'Review pending' }; triggerAttendanceViewDetails();`,
    '#attendanceDetailsModalOverlay', '#attendanceDetailsModalOverlay > .details-popout-card');
}
for (const category of ['tax', 'deduction']) {
  add('Payroll History', category, 'modules/payroll/options/history.html?category=' + category,
    `document.querySelector('.history-card-main').click();`, '#historyDetailsModal', '.history-detail-panel');
  add('Payroll Pending Approval', category, 'modules/payroll/options/pending-approval.html?tab=' + category,
    `document.querySelector('.approval-request-card .three-dots-btn').click(); document.getElementById('payrollPendingViewDetails').click();`,
    '#payrollPendingDetails', '#payrollPendingDetails .payroll-approval-panel');
}
add('Payroll Team', 'Tax Relief', 'modules/payroll/options/tax-relief.html', `document.querySelector('.tax-relief-record-card').click();`, '#taxReliefDetailModal', '.tax-relief-detail-modal', true);
add('Payroll', 'Prior Pay Data', 'modules/payroll/options/prior-pay-data.html', `document.querySelector('.prior-record-open').click();`, '#priorRecordDetails', '.prior-record-modal', true);
for (const tab of ['workPlan', 'timesheet']) {
  add('Project & Task History', tab, 'modules/project-task/options/history.html',
    `document.getElementById('historyTab-${tab}').click(); document.querySelector('#${tab}HistoryList .project-history-card').click();`,
    '#projectHistoryDetailOverlay', '.project-history-detail-sheet', true);
}
add('Project & Task Pending Approval', 'Timesheet', 'modules/project-task/options/pending-approval.html',
  `document.querySelector('.project-approval-menu-trigger').click(); document.getElementById('projectApprovalViewDetails').click();`,
  '#projectApprovalDetails', '.project-approval-details-sheet');
for (const [file, code, overlay] of [
  ['attendance.html', `openModal('attendanceDetailsModalOverlay');`, '#attendanceDetailsModalOverlay'],
  ['feedback-history.html', `openModal('attendanceDetailsModalOverlay');`, '#attendanceDetailsModalOverlay'],
  ['overtime.html', `openDetails();`, '#modal-ot-details'],
  ['hours-summary.html', `openAttendanceDetailsByIndex(0);`, '#modal-attendance-details'],
  ['staff-hours-summary.html', `openAttendanceDetailsByIndex(0, 'Normal Hours');`, '#modal-attendance-details']
]) add('Attendance — Similar field rows', file, 'modules/attendance/options/' + file, code, overlay, overlay + ' > .popup-modal-content', true);
add('Attendance — Similar table', 'Work Hour Violation', 'modules/attendance/options/work-hour-violation.html',
  `document.querySelector('.violation-card').click();`, '#detailModal', '#detailModal > div', true);

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
module.exports = { cases };
if (require.main === module) {
(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });
  const requested = process.argv[2] === '--render-only' ? new Set() : process.argv[2] ? new Set(process.argv[2].split(',').map(Number)) : null;
  let results = requested ? JSON.parse(await fs.readFile(path.join(output, 'inventory.json'), 'utf8')) : [];
  results = results.filter(item => !requested?.has(item.index));
  for (const result of results) result.related = cases[result.index - 1].related;
  let cursor = 0;
  try {
    await Promise.all(Array.from({ length: 3 }, async () => {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: 450, height: 950 });
      await page.setRequestInterception(true);
      page.on('request', req => /^(file:|data:|blob:|about:)/.test(req.url()) ? req.continue() : req.abort());
      page.on('dialog', dialog => dialog.dismiss());
      while (cursor < cases.length) {
        const index = cursor++;
        const job = cases[index];
        if (requested && !requested.has(index + 1)) continue;
        const result = { index: index + 1, ...job };
        delete result.code;
        try {
          const [file, search = ''] = job.file.split('?');
          await page.goto(pathToFileURL(path.join(root, file)).href + (search ? '?' + search : ''), { waitUntil:'domcontentloaded' });
          if (file.includes('prior-pay-data')) await page.waitForSelector('.prior-record-open');
          if (file === 'modules/payroll/options/history.html') await page.waitForSelector('.history-card-main');
          await page.evaluate(code => eval(code), job.code);
          await page.waitForFunction(selector => {
            const el = document.querySelector(selector);
            return el && !el.hidden && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
          }, { timeout: 2500 }, job.overlay);
          await new Promise(resolve => setTimeout(resolve, 320));
          result.structure = await page.evaluate(selector => {
            const dialog = document.querySelector(selector);
            if (!dialog) throw new Error('Missing dialog: ' + selector);
            const heading = dialog.querySelector('h1,h2,h3');
            let header = heading;
            let gradient = '';
            while (header && header !== dialog) {
              const style = getComputedStyle(header);
              if (style.backgroundImage !== 'none') { gradient = style.backgroundImage; break; }
              header = header.parentElement;
            }
            return {
              title: heading?.textContent.trim(), gradient,
              tables: dialog.querySelectorAll('table').length,
              tableRows: dialog.querySelectorAll('tr').length,
              labels: [...dialog.querySelectorAll('tr')].filter(row => row.cells.length === 2).map(row => row.cells[0].textContent.trim()),
              fieldRows: dialog.querySelectorAll('.project-history-detail-row,.tax-relief-detail-row,dl > div').length
            };
          }, job.dialog);
          result.image = String(index + 1).padStart(2, '0') + '.png';
          const dialog = await page.$(job.dialog);
          await dialog.screenshot({ path: path.join(output, result.image) });
        } catch (error) { result.error = error.message; }
        results.push(result);
        console.log(JSON.stringify({ index: result.index, group: job.group, name: job.name, structure: result.structure, error: result.error }));
      }
      await context.close();
    }));
  } finally { await browser.close(); }
  results.sort((a,b) => a.index - b.index);
  await fs.writeFile(path.join(output, 'inventory.json'), JSON.stringify(results, null, 2));
  const cards = results.map(item => `<article data-related="${item.related}"><h2>${item.index}. ${escapeHtml(item.group)} · ${escapeHtml(item.name)}</h2><p>${escapeHtml(item.structure?.title || item.error)} · ${item.related ? '相近布局' : '两列表格详情'}</p><a href="${pathToFileURL(path.join(root, item.file.split('?')[0])).href}${item.file.includes('?') ? '?' + item.file.split('?')[1] : ''}">${escapeHtml(item.file)}</a>${item.image ? `<a href="${item.image}"><img loading="lazy" src="${item.image}" alt="${escapeHtml(item.structure?.title || item.name)}"></a>` : ''}</article>`).join('');
  await fs.writeFile(path.join(output, 'gallery.html'), `<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>View Details 页面清单</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;font-family:system-ui,sans-serif;background:#0b0b14;color:#eee}h1{font-size:26px}header{margin-bottom:24px}header p{color:#b4b4c8}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}article{padding:16px;border:1px solid #333344;border-radius:14px;background:#151523}h2{font-size:15px;line-height:1.5}p,a{font-size:12px;overflow-wrap:anywhere}a{color:#c2a8ff}img{display:block;margin-top:14px;width:100%;height:auto;border-radius:10px}button{padding:9px 16px;border:1px solid #675285;border-radius:8px;background:#27203b;color:white;cursor:pointer}</style><header><h1>View Details 页面清单</h1><p>扫描 88 个 HTML 页面。按入口及类型去重展示；不同员工、记录、状态共用同一详情模板。截图使用现有示例记录。</p><p>${results.filter(x => !x.error).length} 个已打开的详情入口；${results.filter(x => x.error).length} 个待核对入口。两列字段表格与类似字段行均已标记。</p><button onclick="document.querySelectorAll('[data-related=true]').forEach(card=>card.hidden=!card.hidden)">显示 / 隐藏相近字段行样式</button></header><main>${cards}</main></html>`);
  console.log('Gallery: scratch/detail-dialog-audit/gallery.html');
})().catch(error => { console.error(error); process.exitCode = 1; });
}
