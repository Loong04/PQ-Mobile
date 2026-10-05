const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const puppeteer = require('puppeteer');

const dashboardUrl = theme => pathToFileURL(
  path.resolve(__dirname, '..', 'modules/project-task/index.html')
).href + '?scope=individual&theme=' + theme;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const faults = [];
    page.on('pageerror', error => faults.push(error.message));

    for (const theme of ['dark', 'light']) {
      await page.setViewport({ width: 390, height: 950 });
      await page.goto(dashboardUrl(theme), { waitUntil: 'domcontentloaded' });

      assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
      assert.equal(await page.$eval('.project-header h1', node => node.textContent.trim()), 'Project & Task Dashboard');
      assert.equal(await page.$eval('#projectHeaderScope', node => node.textContent.trim()), 'Individual');
      assert.deepEqual(
        await page.$$eval('.project-scope-tab', tabs => tabs.map(tab => tab.textContent.trim())),
        ['Individual', 'Team']
      );
      const scopeTabStyles = await page.evaluate(() => {
        const switcher = getComputedStyle(document.querySelector('.project-scope-tabs'));
        const active = getComputedStyle(document.querySelector('.project-scope-tab[aria-selected="true"]'));
        return {
          switcherDisplay: switcher.display,
          switcherRadius: switcher.borderRadius,
          switcherPadding: switcher.padding,
          switcherMarginTop: switcher.marginTop,
          switcherMarginBottom: switcher.marginBottom,
          activeRadius: active.borderRadius,
          activeFontSize: active.fontSize,
          activeFontWeight: active.fontWeight,
          activeBackground: active.backgroundImage,
          activeShadow: active.boxShadow
        };
      });
      assert.equal(scopeTabStyles.switcherDisplay, 'flex');
      assert.equal(scopeTabStyles.switcherRadius, '20px');
      assert.equal(scopeTabStyles.switcherPadding, '4px');
      assert.equal(scopeTabStyles.switcherMarginTop, '2px');
      assert.equal(scopeTabStyles.switcherMarginBottom, '14px');
      assert.equal(scopeTabStyles.activeRadius, '16px');
      assert.equal(scopeTabStyles.activeFontSize, '13.5px');
      assert.equal(scopeTabStyles.activeFontWeight, '700');
      assert.match(scopeTabStyles.activeBackground, /linear-gradient/);
      assert.notEqual(scopeTabStyles.activeShadow, 'none');

      assert.deepEqual(
        await page.$$eval('#projectPanel-individual .project-dashboard-section-title', titles => titles.map(title => title.textContent.replace(/\s+/g, ' ').trim())),
        ['MY DOCUMENT STATUS', 'QUICK OPTIONS', 'MY WORK CALENDAR']
      );
      assert.deepEqual(
        await page.$$eval('#projectPanel-individual .project-dashboard-status-card', cards => cards.map(card => ({
          value: card.querySelector('strong').textContent.trim(),
          label: card.querySelector('span').textContent.trim(),
          note: card.querySelector('small').textContent.trim()
        }))),
        [
          { value: '3', label: 'Submitted', note: 'In Review' },
          { value: '0', label: 'Pending Resubmit', note: 'Needs Action' },
          { value: '1', label: 'Draft', note: 'Saved' },
          { value: '1', label: 'Overdue', note: 'Needs Action' }
        ]
      );

      const quickOptions = await page.$$eval('#projectPanel-individual .project-dashboard-quick-grid .project-option', links => links.map(link => ({
        title: link.querySelector('.project-option-title').textContent.trim(),
        file: new URL(link.href).pathname.split('/').pop()
      })));
      assert.deepEqual(quickOptions, [
        { title: 'Work Plan', file: 'work-plan.html' },
        { title: 'Time Sheet', file: 'time-sheet.html' },
        { title: 'History', file: 'history.html' }
      ]);

      assert.equal(await page.$eval('#projectCalendarMonth', node => node.textContent.trim()), 'October 2026');
      assert.deepEqual(
        await page.$$eval('#projectPanel-individual .project-calendar-weekday', days => days.map(day => day.textContent.trim())),
        ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      );
      assert.equal(await page.$$eval('#projectCalendarGrid .project-calendar-day', days => days.length), 35);
      assert.deepEqual(
        await page.$$eval('#projectCalendarGrid .project-calendar-day.has-event', days => days.map(day => ({
          date: day.dataset.date,
          badge: day.querySelector('.project-calendar-day-badge').textContent.trim()
        }))),
        [
          { date: '2026-10-02', badge: 'TS' },
          { date: '2026-10-05', badge: 'WP' },
          { date: '2026-10-12', badge: 'WP' },
          { date: '2026-10-22', badge: 'DL' },
          { date: '2026-10-30', badge: 'DL' }
        ]
      );
      const calendarEventPalette = await page.$$eval('#projectCalendarGrid .project-calendar-day.has-event', days => ({
        backgrounds: [...new Set(days.map(day => getComputedStyle(day).backgroundColor))],
        borders: [...new Set(days.map(day => getComputedStyle(day).borderTopColor))],
        badges: [...new Set(days.map(day => getComputedStyle(day.querySelector('.project-calendar-day-badge')).backgroundColor))]
      }));
      assert.equal(calendarEventPalette.backgrounds.length, 1);
      assert.equal(calendarEventPalette.borders.length, 1);
      assert.equal(calendarEventPalette.badges.length, 1);
      assert.deepEqual(
        await page.$$eval('#projectPanel-individual .project-calendar-legend-item', items => items.map(item => item.textContent.replace(/\s+/g, ' ').trim())),
        ['TS Timesheet', 'WP Scheduled', 'DL Deadline']
      );
      assert.equal(
        await page.$eval('#projectCalendarGrid [data-date="2026-10-02"]', day => day.tagName),
        'BUTTON'
      );
      assert.equal(
        await page.$eval('#projectCalendarGrid [data-date="2026-10-02"]', day => day.getAttribute('aria-pressed')),
        'true'
      );
      assert.equal(await page.$eval('#projectCalendarDetailDate', date => date.textContent.trim()), '2 Oct 2026');
      assert.equal(
        await page.$eval('.project-calendar-details-heading', heading => heading.textContent.replace(/\s+/g, ' ').trim()),
        '2 Oct 2026 Reference # ETS00000002819'
      );
      assert.equal(
        await page.$eval('.project-calendar-details-body', body => body.textContent.replace(/\s+/g, ' ').trim()),
        'Normal Hours 7.50hrs OT Hours 1.00hrs'
      );
      assert.deepEqual(
        await page.$$eval('.project-calendar-detail-metric', metrics => metrics.map(metric => ({
          label: metric.querySelector('span').textContent.trim(),
          value: metric.querySelector('strong').textContent.trim()
        }))),
        [
          { label: 'Normal Hours', value: '7.50' },
          { label: 'OT Hours', value: '1.00' }
        ]
      );
      const detailCardStyle = await page.$eval('#projectCalendarDetails', card => ({
        radius: getComputedStyle(card).borderRadius,
        headerBackground: getComputedStyle(card.querySelector('.project-calendar-details-heading')).backgroundImage,
        metricIcons: card.querySelectorAll('.project-calendar-detail-metric-icon').length,
        metricUnits: [...card.querySelectorAll('.project-calendar-detail-metric-value small')].map(unit => unit.textContent.trim()),
        metricColumns: getComputedStyle(card.querySelector('.project-calendar-detail-metrics')).gridTemplateColumns.split(' ').length
      }));
      assert.equal(detailCardStyle.radius, '18px');
      assert.match(detailCardStyle.headerBackground, /linear-gradient/);
      assert.equal(detailCardStyle.metricIcons, 2);
      assert.deepEqual(detailCardStyle.metricUnits, ['hrs', 'hrs']);
      assert.equal(detailCardStyle.metricColumns, 2);
      assert.equal(await page.$eval('#projectCalendarDetails', card => card.getAttribute('role')), 'button');
      const dashboardAddress = page.url();
      await page.click('#projectCalendarDetailNormalHours');
      await page.waitForSelector('#projectCalendarTimesheetOverlay:not([hidden])');
      assert.equal(page.url(), dashboardAddress, 'Calendar details must open on the dashboard');
      assert.equal(await page.$eval('#projectCalendarTimesheetSummary', summary => {
        const body = summary.parentElement.getBoundingClientRect();
        const bounds = summary.getBoundingClientRect();
        return bounds.height > 0 && bounds.top >= body.top && bounds.bottom <= body.bottom;
      }), true, 'All summary fields must be visible when the details open');
      assert.deepEqual(
        await page.$$eval('#projectCalendarTimesheetSummary .project-history-detail-row', rows => rows.map(row => [
          row.querySelector('span').textContent.trim(), row.querySelector('strong').textContent.trim()
        ])),
        [
          ['Reference #', 'ETS00000002819'],
          ['Date', '2 Oct 2026'],
          ['Remark', 'Client portal accessibility sprint.'],
          ['Status', 'Draft'],
          ['Normal Hours', '7.50 hrs'],
          ['OT Hours', '1.00 hrs']
        ]
      );
      assert.equal(await page.$eval('#projectCalendarTimesheetDetailsHeading', heading => heading.textContent.trim()), 'Details');
      assert.equal(await page.$('#projectCalendarTimesheetOverlay [role="tab"]'), null);
      assert.equal(await page.$('#projectCalendarTimesheetActivities .project-history-detail-activity-header'), null);
      assert.deepEqual(
        await page.$$eval('#projectCalendarTimesheetActivities .project-history-detail-activity', items => items.map(item => [...item.querySelectorAll('.project-history-detail-row > span')].map(label => label.textContent.trim()))),
        Array.from({ length: 2 }, () => ['Title', 'Description', 'Project', 'Is AdHoc Task?', 'Task', 'Is Overtime?', 'Time From', 'Completion %', 'Time To'])
      );
      assert.deepEqual(
        await page.$$eval('#projectCalendarTimesheetActivities .project-history-detail-activity', items => items.map(item => [...item.querySelectorAll('.project-history-detail-row > strong')].map(value => value.textContent.trim()))),
        [
          ['Responsive accessibility review', 'Verified navigation, focus states and mobile layouts.', 'Client Portal Upgrade', 'No', 'Portal Upgrade', 'No', '09:00', '75%', '16:30'],
          ['Regression fixes', 'Resolved issues found during review.', 'Client Portal Upgrade', 'Yes', 'Portal Upgrade', 'Yes', '18:00', '100%', '19:00']
        ]
      );
      const timesheetTableStyles = await page.$eval('#projectCalendarTimesheetOverlay', modal => {
        const presentation = element => {
          const style = getComputedStyle(element);
          return {
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius,
            borderTopWidth: style.borderTopWidth
          };
        };
        return {
          summary: presentation(modal.querySelector('#projectCalendarTimesheetSummary')),
          activities: [...modal.querySelectorAll('.project-history-detail-activity')].map(presentation)
        };
      });
      assert.ok(
        timesheetTableStyles.activities.every(style => JSON.stringify(style) === JSON.stringify(timesheetTableStyles.summary)),
        'Details tables must use the same presentation as the summary table'
      );
      assert.equal(await page.$eval('.main-content', main => main.inert), true);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'closeProjectCalendarTimesheet');
      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'closeProjectCalendarTimesheet');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'closeProjectCalendarTimesheet');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#projectCalendarTimesheetOverlay', overlay => overlay.hidden), true);
      assert.equal(await page.$eval('.main-content', main => main.inert), false);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'projectCalendarDetails');
      for (const key of ['Enter', 'Space']) {
        await page.keyboard.press(key);
        await page.waitForSelector('#projectCalendarTimesheetOverlay:not([hidden])');
        await page.click('#closeProjectCalendarTimesheet');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'projectCalendarDetails');
      }
      await page.click('#projectCalendarGrid [data-date="2026-10-08"]');
      assert.equal(
        await page.$eval('#projectCalendarGrid [data-date="2026-10-08"]', day => day.getAttribute('aria-pressed')),
        'true'
      );
      assert.equal(
        await page.$eval('#projectCalendarGrid [data-date="2026-10-02"]', day => day.getAttribute('aria-pressed')),
        'false'
      );
      assert.equal(await page.$eval('#projectCalendarDetails', card => card.hidden), true);
      await page.click('#projectCalendarGrid [data-date="2026-10-02"]');
      assert.equal(await page.$eval('#projectCalendarDetails', card => card.hidden), false);

      await page.click('#projectCalendarNext');
      assert.equal(await page.$eval('#projectCalendarMonth', node => node.textContent.trim()), 'November 2026');
      assert.equal(await page.$eval('#projectCalendarDetails', card => card.hidden), true);
      await page.click('#projectCalendarPrevious');
      assert.equal(await page.$eval('#projectCalendarMonth', node => node.textContent.trim()), 'October 2026');
      await page.click('#projectCalendarGrid [data-date="2026-10-02"]');
      assert.equal(await page.$eval('#projectCalendarDetails', card => card.hidden), false);

      const dashboardLayout = await page.evaluate(() => {
        const statusGrid = getComputedStyle(document.querySelector('.project-dashboard-status-grid'));
        const quickGrid = getComputedStyle(document.querySelector('.project-dashboard-quick-grid'));
        return {
          statusColumns: statusGrid.gridTemplateColumns.split(' ').length,
          quickColumns: quickGrid.gridTemplateColumns.split(' ').length,
          overflow: document.querySelector('.phone-container').scrollWidth > document.querySelector('.phone-container').clientWidth + 1
        };
      });
      assert.equal(dashboardLayout.statusColumns, 4);
      assert.equal(dashboardLayout.quickColumns, 3);
      assert.equal(dashboardLayout.overflow, false);

      await page.click('#projectTab-team');
      assert.equal(await page.$eval('#projectHeaderScope', node => node.textContent.trim()), 'Team');
      assert.equal(await page.$eval('#projectPanel-team', panel => panel.hidden), false);
      assert.deepEqual(
        await page.$$eval('#projectPanel-team .project-dashboard-section-title', titles => titles.map(title => title.textContent.replace(/\s+/g, ' ').trim())),
        ['OPTIONS', 'CURRENT PROJECT']
      );
      assert.equal(
        await page.$eval('#projectCurrentProjectTitle', title => title.nextElementSibling?.id),
        'projectTeamProjectOverview'
      );
      assert.equal(await page.$eval('#projectTeamQuickActionTitle', title => title.textContent.trim()), 'Action Required');
      assert.equal(await page.$('#projectPanel-team .project-dashboard-status-grid'), null);
      assert.equal(await page.$('#projectPanel-team .project-dashboard-calendar-card'), null);
      assert.deepEqual(
        await page.$eval('#projectTeamPendingApproval', card => ({
          title: card.querySelector('.team-pending-approval-title').textContent.trim(),
          description: card.querySelector('.team-pending-approval-description').textContent.trim(),
          count: card.querySelector('.team-pending-approval-count').textContent.trim(),
          file: new URL(card.href).pathname.split('/').pop()
        })),
        {
          title: 'Pending Approval',
          description: 'Timesheets awaiting review',
          count: '3',
          file: 'pending-approval.html'
        }
      );
      assert.deepEqual(
        await page.$$eval('#projectTeamOptions .project-option', options => options.map(option => ({
          title: option.querySelector('.project-option-title').textContent.trim(),
          file: new URL(option.href).pathname.split('/').pop()
        }))),
        [
          { title: 'Work Assignment', file: 'work-assignment.html' },
          { title: 'Timesheet Highlight', file: 'timesheet-highlight.html' }
        ]
      );
      assert.equal(
        await page.$eval('#projectTeamOptions', options => getComputedStyle(options).gridTemplateColumns.split(' ').length),
        2
      );
      assert.equal(
        await page.$eval('.phone-container', phone => phone.scrollWidth > phone.clientWidth + 1),
        false
      );

      await page.click('#projectTab-individual');
      assert.equal(await page.$eval('#projectHeaderScope', node => node.textContent.trim()), 'Individual');
      assert.equal(await page.$eval('#projectPanel-individual', panel => panel.hidden), false);

      for (const [tone, target] of [['submitted', 'strong'], ['draft', 'small'], ['overdue', 'span']]) {
        await page.goto(dashboardUrl(theme), { waitUntil: 'domcontentloaded' });
        const navigation = await Promise.allSettled([
          page.waitForFunction(() => location.pathname.endsWith('/options/history.html')
            && document.documentElement.dataset.projectHistoryReady === 'true', { timeout: 3000 }),
          page.click(`.project-dashboard-status-card[data-tone="${tone}"] ${target}`)
        ]);
        assert.equal(navigation[0].status, 'fulfilled', `${tone} status card must open History`);
        assert.equal(new URL(page.url()).pathname.split('/').pop(), 'history.html');
        await page.waitForFunction(() => document.documentElement.dataset.projectHistoryReady === 'true');
        assert.equal(await page.$eval('.project-header h1', title => title.textContent.trim()), 'History');
        assert.equal(await page.$eval('html', node => node.dataset.theme), theme);
      }

      await page.goto(dashboardUrl(theme), { waitUntil: 'domcontentloaded' });
      const switchedTheme = theme === 'dark' ? 'light' : 'dark';
      await page.click(`[data-set-theme="${switchedTheme}"]`);
      await page.focus('.project-dashboard-status-card[data-tone="submitted"]');
      await Promise.all([
        page.waitForFunction(() => location.pathname.endsWith('/options/history.html')
          && document.documentElement.dataset.projectHistoryReady === 'true'),
        page.keyboard.press('Enter')
      ]);
      assert.equal(new URL(page.url()).pathname.split('/').pop(), 'history.html');
      assert.equal(new URL(page.url()).searchParams.get('theme'), switchedTheme);
      assert.equal(await page.$eval('html', node => node.dataset.theme), switchedTheme);
    }

    assert.deepEqual(faults, []);
    console.log('PASS: Project & Task dashboards match the approved individual and team designs.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
