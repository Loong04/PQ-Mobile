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
      assert.equal(await page.$('#projectHeaderScope'), null);
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
        ['MY WORK STATUS', 'QUICK OPTIONS', 'MY WORK CALENDAR']
      );
      assert.deepEqual(
        await page.$$eval('#projectPanel-individual .project-dashboard-status-card', cards => cards.map(card => ({
          value: card.querySelector('strong').textContent.trim(),
          label: card.querySelector('span').textContent.trim(),
          note: card.querySelector('small').textContent.trim()
        }))),
        [
          { value: '3', label: 'Submitted', note: 'In Review' },
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
      assert.equal(await page.$eval('#projectCalendarDetailStatus', status => status.textContent.trim()), 'Draft');
      assert.equal(await page.$eval('#projectCalendarDetailDate', date => date.textContent.trim()), '2 Oct 2026');
      assert.deepEqual(
        await page.$eval('.project-calendar-detail-reference', reference => ({
          label: reference.querySelector('span').textContent.trim(),
          value: reference.querySelector('strong').textContent.trim()
        })),
        { label: 'Reference #', value: 'ETS00000002819' }
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
      assert.equal(dashboardLayout.statusColumns, 3);
      assert.equal(dashboardLayout.quickColumns, 3);
      assert.equal(dashboardLayout.overflow, false);

      await page.click('#projectTab-team');
      assert.equal(await page.$eval('#projectPanel-team', panel => panel.hidden), false);
      assert.deepEqual(
        await page.$$eval('#projectPanel-team .project-dashboard-section-title', titles => titles.map(title => title.textContent.replace(/\s+/g, ' ').trim())),
        ['QUICK ACTION', 'OPTIONS']
      );
      assert.equal(await page.$('#projectPanel-team .project-dashboard-status-grid'), null);
      assert.equal(await page.$('#projectPanel-team .project-dashboard-calendar-card'), null);
      assert.deepEqual(
        await page.$eval('#projectTeamPendingApproval', card => ({
          title: card.querySelector('.project-team-action-title').textContent.trim(),
          description: card.querySelector('.project-team-action-description').textContent.trim(),
          count: card.querySelector('.project-team-action-count').textContent.trim(),
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
      assert.equal(await page.$eval('#projectPanel-individual', panel => panel.hidden), false);
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
