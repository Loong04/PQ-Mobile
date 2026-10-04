const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const url = file => pathToFileURL(path.join(root, file)).href;
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 950 });

    await page.goto(url('modules/attendance/options/team.html'), { waitUntil: 'domcontentloaded' });

    await check('attendance approval details are sourced from the selected record', async () => {
      const actual = await page.evaluate(() => {
        const record = staffDatabase.pending_approval.find(item => item.id === '#001002');
        openAttendanceThreeDotsMenu(null, record.id);
        triggerAttendanceViewDetails();
        return {
          selected: {
            name: currentAttendanceSelectedData.name,
            reason: currentAttendanceSelectedData.reason,
            dates: currentAttendanceSelectedData.dates,
            duration: currentAttendanceSelectedData.duration,
            remark: currentAttendanceSelectedData.remark
          },
          expected: {
            name: record.name,
            reason: record.reason,
            dates: record.startDate,
            duration: record.duration,
            remark: record.remark
          }
        };
      });
      assert.deepEqual(actual.selected, actual.expected);
    });

    await check('attendance dashboard counts derive from the pending and verification datasets', async () => {
      const values = await page.evaluate(() => ({
        taskBadge: document.querySelector('.team-action-required-badge').textContent.trim(),
        pending: document.querySelector('.team-pending-approval-count').textContent.trim(),
        expectedPending: staffDatabase.pending_approval.length,
        expectedTasks: staffDatabase.pending_approval.length + staffDatabase.attendance_verification.length
      }));
      assert.equal(values.pending, String(values.expectedPending));
      assert.equal(values.taskBadge, `${values.expectedTasks} Tasks`);
    });

    await check('attendance staff cards put a normalized ID directly below the name', async () => {
      const identity = await page.evaluate(() => {
        renderStaffList(staffDatabase.scheduled.slice(0, 1));
        const card = document.querySelector('#staffListContent .staff-card-item');
        const name = [...card.querySelectorAll('div')].find(node => node.textContent.trim() === staffDatabase.scheduled[0].name);
        const id = name.nextElementSibling;
        const css = getComputedStyle(id);
        return { text: id.textContent.trim(), size: css.fontSize, weight: css.fontWeight, family: css.fontFamily };
      });
      assert.match(identity.text, /^#[A-Z0-9-]+$/);
      assert.equal(identity.size, '11.5px');
      assert.equal(identity.weight, '700');
      assert.match(identity.family.toLowerCase(), /mono/);
    });

    await page.goto(url('leave.html') + '?mode=team', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#hubSectionTeam', { visible: true });

    await check('leave dashboard count matches all unhandled approval cards', async () => {
      const values = await page.evaluate(() => ({
        cards: [...document.querySelectorAll('#teamApprovalsListContainer .approval-request-card')]
          .filter(card => card.dataset.handled !== 'true').length,
        pending: document.getElementById('teamPendingCount').textContent.trim(),
        tasks: document.getElementById('leaveTeamActionRequiredCount').textContent.trim()
      }));
      assert.equal(values.pending, String(values.cards));
      assert.equal(values.tasks, `${values.cards} Tasks`);
    });

    await check('leave approval cards put a normalized employee ID directly below the name', async () => {
      const rows = await page.$$eval('#teamApprovalsListContainer .approval-request-card', cards => cards.map(card => {
        const id = card.querySelector('.employee-id-standard');
        if (!id) return { text: '', size: '', weight: '', family: '' };
        const css = getComputedStyle(id);
        return { text: id.textContent.trim(), size: css.fontSize, weight: css.fontWeight, family: css.fontFamily };
      }));
      assert.ok(rows.length >= 9);
      for (const row of rows) {
        assert.match(row.text, /^#[A-Z0-9-]+$/);
        assert.equal(row.size, '11.5px');
        assert.equal(row.weight, '700');
        assert.match(row.family.toLowerCase(), /mono/);
      }
    });

    await check('leave calendar, entitlement, and workflow cards use the standard ID line', async () => {
      const result = await page.evaluate(() => {
        openCalDateDetailsModal(5);
        openStaffEntitlementModal('004177');
        const collect = selector => [...document.querySelectorAll(selector)].map(node => {
          const css = getComputedStyle(node);
          return { text: node.textContent.trim(), size: css.fontSize, weight: css.fontWeight, family: css.fontFamily };
        });
        return {
          calendar: collect('#calModalStaffListContainer .employee-id-standard'),
          entitlement: collect('#entModalStaffContentContainer .employee-id-standard'),
          workflow: collect('#level1Approvers .employee-id-standard')
        };
      });
      assert.equal(result.calendar.length, 1);
      assert.equal(result.entitlement.length, 1);
      assert.ok(result.workflow.length >= 5);
      for (const row of [...result.calendar, ...result.entitlement, ...result.workflow]) {
        assert.match(row.text, /^#[A-Z0-9-]+$/);
        assert.equal(row.size, '11.5px');
        assert.equal(row.weight, '700');
        assert.match(row.family.toLowerCase(), /mono/);
      }
    });

    await page.goto(url('modules/attendance/options/hours-summary.html'), { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => setView('list'));
    await check('hours summary View Chart is a compliant labeled pill', async () => {
      const button = await page.$eval('#btn-chart-toggle', node => {
        const rect = node.getBoundingClientRect();
        return {
          text: node.textContent.replace(/\s+/g, ' ').trim(),
          hasPie: Boolean(node.querySelector('.fa-chart-pie')),
          whiteSpace: getComputedStyle(node).whiteSpace,
          width: rect.width,
          height: rect.height
        };
      });
      assert.equal(button.text, 'View Chart');
      assert.equal(button.hasPie, true);
      assert.equal(button.whiteSpace, 'nowrap');
      assert.ok(button.width > button.height);
    });

    await page.goto(url('modules/attendance/options/daily-ot.html'), { waitUntil: 'domcontentloaded' });
    await check('daily OT View Chart stays on one line', async () => {
      assert.equal(await page.$eval('.view-chart-btn', node => getComputedStyle(node).whiteSpace), 'nowrap');
    });
  } finally {
    await browser.close();
  }

  if (failures.length) {
    throw new Error(`\n${failures.join('\n')}`);
  }
  console.log('Attendance/Leave report fixes verified.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
