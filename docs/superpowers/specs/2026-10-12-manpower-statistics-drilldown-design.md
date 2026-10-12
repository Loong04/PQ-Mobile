# Manpower Statistics Drill-Down Design

Date: 2026-10-12

## Context

The Employee & Career Team module already has a Manpower Statistics table, filters, and chart. The table currently presents aggregated Description and Headcount values but has no way to inspect the statistics behind a description, see the employees represented by a headcount, or inspect an individual employee.

The approved change adds a three-level drill-down while keeping the existing page, filters, chart, theme support, and mobile layout.

## Goals

- Make every visible Description value an accessible control that opens the statistics for that group.
- Make every visible Headcount value an accessible control that opens the employees represented by that group.
- Show a consistent white Total Records summary card in the staff-records view.
- Let the user open an employee card and inspect that employee in a consistent purple-header detail popout.
- Keep aggregate totals, staff-record counts, filters, and detail values internally consistent.
- Support Job Type, Company, Branch, and Department summary modes.
- Preserve the active filter, table scroll position, and selected summary mode when returning from staff records.

## Non-Goals

- No server API, database, pagination, editing, exporting, or employee-profile navigation is added.
- Chart segments and chart legend rows do not gain drill-down behavior in this change.
- Existing Employee & Career Staff List records are not rewritten or coupled to this preview dataset.
- The supplied reference screenshots guide the information architecture, not the legacy visual styling. The implementation continues using the current PeopleHCM purple design system.

## Selected Approach

Use one page with explicit view state and two detail overlays:

1. The existing table remains the entry point.
2. Description opens a group-statistics modal.
3. Headcount switches the main content to an in-page staff-records view.
4. Selecting an employee opens an employee-detail modal above that staff view.

This keeps filters and scroll state in memory, avoids duplicating the application shell on a second page, and gives the employee list enough vertical space on mobile. Putting the employee list inside a modal was rejected because a long list would create nested scrolling and a cramped layout. A separate HTML page was rejected because it would duplicate state restoration and shell markup.

## Data Model

### Aggregate Source

Keep `window.MANPOWER_STATISTICS_DATA` as the source for the existing aggregate table. Its current 34 job types and 282 total headcount remain unchanged.

### Employee Drill-Down Source

Expose `window.MANPOWER_STATISTICS_STAFF` from `manpower-statistics-data.js`. Build it deterministically from each aggregate row so that:

- each aggregate row produces exactly `headcount` employee records;
- the full dataset contains exactly 282 active employee records;
- every record copies the aggregate row's company, branch, department, job type, and effective range;
- employee numbers are stable and unique;
- names and other demonstration values are deterministic across reloads.

Each employee record contains:

- `empNo`
- `name`
- `position`
- `superior`
- `job`
- `company`
- `branch`
- `base`
- `division`
- `department`
- `section`
- `costCenter`
- `line`
- `hireDate`
- `birthDate`
- `competencyPoints`
- `competencyMatchPercent`
- `basicPay`
- `incrementPercent`
- `bonusFactor`
- `attendancePercent`
- `monthlyOtHours`
- `trainingCost`
- `performanceScore`
- `annualAttritionPercent`
- optional `photo`

Generated numeric values must stay within realistic bounded ranges and must not use runtime randomness. This keeps screenshots and tests stable.

### Filter Contract

The staff subset is derived using the same effective-date, company, branch, and department predicates as the aggregate table. The selected table group is then applied using the active `summaryBy` field:

- Job Type uses `jobType`.
- Company uses `company`.
- Branch uses `branch`.
- Department uses `department`.

The resulting staff count must exactly equal the selected Headcount value.

## Group Statistics Popout

### Trigger

Render each Description value as a button within the first table cell. The control uses visible text, a clear focus style, and an accessible name such as `View statistics for ACCOUNT EXECUTIVE`.

The row itself is not clickable. This keeps Description and Headcount actions distinct.

### Layout

Use the existing Employee & Career detail-popout language:

- dimmed backdrop;
- centered mobile-safe panel;
- purple header;
- title `Manpower Statistics`;
- close button;
- one scrollable key-value table;
- no nested modal or horizontal scrolling.

### Fields and Order

1. Description
2. Headcount
3. Average Age
4. Average Service Years
5. Average Competency Points
6. Average Competency Match %
7. Average Basic Pay
8. Median Basic Pay
9. Minimum Basic Pay
10. Maximum Basic Pay
11. Average Increment %
12. Average Bonus Factor
13. Attendance %
14. Average Monthly OT Hours
15. Average Training Cost
16. Average Performance Score
17. Annual Attrition %

### Metric Rules

- Age and service years are calculated against the active Effective Date filter.
- Averages use the selected staff subset and display two decimal places.
- Median Basic Pay uses the middle value for an odd-sized set and the average of the two middle values for an even-sized set.
- Monetary fields use locale-formatted numbers with two decimal places and no hard-coded currency prefix.
- Minimum and maximum pay use the selected subset.
- Headcount is the selected subset length.
- An empty subset displays zero values rather than `NaN` or `Infinity`.

## Staff Records View

### Trigger

Render each Headcount value as a button in the second table cell with an accessible name such as `View 48 staff records for ACCOUNT EXECUTIVE`.

### Navigation and State

- Switch the main page from `manpowerTableView` to `manpowerStaffView`.
- Change the page title to `<Description> Staff Records`.
- The header back button returns to Manpower Statistics instead of leaving the module.
- Restore the previous table scroll position and focus to the selected Headcount control.
- Preserve the active filters and summary mode.
- If the user is already on the table view, the existing back link continues to Employee & Career.

### Summary

Place a white summary card at the top:

- label: `Total Records`
- value: selected staff-record count

The displayed value must equal both the clicked Headcount and the number of rendered employee cards.

### Employee Cards

Use the current PeopleHCM rounded-card style rather than the legacy pink reference cards. Each card is one accessible button and displays:

- employee name;
- employee number immediately below the name, prefixed with `#`, using muted monospace typography;
- Position;
- Department;
- right chevron indicating drill-down.

The employee-ID placement follows the repository-wide Employee ID Presentation Standard.

## Employee Detail Popout

### Trigger and Layout

Selecting an employee card opens a detail popout above the staff-records view. Use the same purple-header, close-button, scroll behavior, focus trap, and responsive dimensions as the group-statistics popout.

If an employee has a `photo`, display it in a restrained portrait area above the table. Otherwise display an initials avatar; no broken-image placeholder is shown.

### Fields and Order

1. Employee #
2. Name
3. Position
4. Superior
5. Job
6. Company
7. Branch
8. Base
9. Division
10. Department
11. Section
12. Cost Center
13. Line
14. Service Years

Employee # is prefixed with `#`. Service Years is calculated against the active Effective Date and displayed with two decimal places.

## Interaction and Accessibility

- Description, Headcount, and employee-card controls work with pointer, Enter, and Space.
- Overlays use `role="dialog"`, `aria-modal="true"`, labelled headers, and a focus trap.
- Opening an overlay moves focus to its close button.
- Escape and backdrop click close the active overlay.
- Closing restores focus to the exact trigger that opened it.
- While an overlay is open, the page shell behind it is inert.
- The staff-records back action restores the exact Headcount trigger when possible.
- Reduced-motion preferences disable nonessential transitions.

## Error and Empty States

- If no staff records match, the staff view shows `Total Records: 0` plus the existing empty-state language and no employee cards.
- If an invalid or stale group key is requested, remain on the table and expose a polite status message instead of opening an empty view.
- Missing optional employee values display an em dash.
- All calculations guard against empty arrays and invalid dates.

## Files

Expected implementation scope:

- `modules/employee-career/js/manpower-statistics-data.js`
  - deterministic employee dataset and employee-level metric fields.
- `modules/employee-career/options/team/manpower-stats.html`
  - staff-records view, group-statistics dialog, employee-detail dialog, and live status region.
- `modules/employee-career/js/manpower-statistics.js`
  - filtering, aggregation, view transitions, modal rendering, focus management, and derived metrics.
- `modules/employee-career/css/manpower-statistics.css`
  - interactive table controls, white total-records card, employee cards, and both responsive popouts.
- `scratch/test_employee_career_manpower_statistics.cjs`
  - end-to-end behavior, consistency, accessibility, responsive, and regression coverage.

## Test Strategy

Implementation follows test-driven development.

Automated browser coverage must verify:

- the initial 34 records and 282 headcount remain unchanged;
- Description opens the statistics popout with all 17 fields in the specified order;
- group metrics are stable and correctly formatted;
- Headcount opens the correct staff-records view;
- Total Records equals clicked Headcount and rendered card count;
- employee ID is directly below the name and prefixed with `#`;
- selecting an employee opens the detail popout with all 14 fields in order;
- back navigation restores filters, table scroll, and focus;
- Company, Branch, Department, and Job Type summary modes all drill down correctly;
- effective-date and organization filters constrain both aggregate and employee detail data;
- Escape, backdrop close, focus trap, and focus restoration work;
- empty and stale-group states do not throw;
- no page errors or horizontal overflow occur at 360, 390, and 420 pixels in light and dark themes;
- existing chart, filter, and Manpower table tests continue to pass.

## Acceptance Criteria

The work is complete when:

- Description, Headcount, and employee drill-downs behave as specified;
- every displayed count agrees across aggregate, staff summary, and rendered records;
- the supplied reference information hierarchy is reproduced using the current PeopleHCM design system;
- all new and existing Manpower Statistics tests pass in light and dark themes at supported mobile widths;
- no unrelated Employee & Career behavior changes.
