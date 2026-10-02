# Timesheet Highlight Implementation Plan

> **For agentic workers:** Use executing-plans to implement and verify the steps in this workspace.

**Goal:** Complete Project & Task Team Timesheet Highlight using the existing Leave, Benefit and Expense Highlight presentation and full chart flow.

**Architecture:** A dedicated page uses scoped CSS, a deterministic preview dataset and one JavaScript controller. All table totals, employee details, breakdowns, trend bars and monthly analysis derive from the same filtered activity records.

**Tech Stack:** Existing vanilla HTML/CSS/JavaScript, theme.css, FontAwesome and native SVG; Puppeteer for verification.

**Spec:** User request in this conversation: table columns Emp#, Name, Hours; Data Filter fields Search Keyword, Start Date, End Date, Project, Task; implement all screens after View Chart and retain the existing highlight design.

## Global Constraints

- Preserve other modules and current work in progress.
- View Chart uses fa-solid fa-chart-pie plus the visible text View Chart in a pill.
- Employee cards show a muted #ID directly below the name; the requested table retains its three explicit columns.
- Use existing fonts, purple headers, rounded cards, light/dark tokens, filter sheet and detail popup patterns.
- Provide table, chart, monthly trend and month analysis views with back navigation.
- PDF printing and Excel-compatible CSV export use the actual filtered table.

## Review Focus

- Inclusive date boundaries, invalid date ranges and canceled filter changes.
- Missing results and zero hours must not produce invalid chart segments or percentages.
- Project/task selection and keyword filters must agree across every view.
- Returning through analysis, trend and chart must retain filters and the selected breakdown.
- At 360px, long names and group labels must not cause page overflow; modals must remain scrollable and keyboard accessible.

## Task 1: Table, shared data and filters

Files: replace modules/project-task/options/timesheet-highlight.html; create css/timesheet-highlight.css, js/project-task/timesheet-highlight-data.js, js/project-task/timesheet-highlight.js and scratch/test_timesheet_highlight.cjs.

- [x] Write failing assertions for the three table headings, grouped employee totals, five filter labels, inclusive dates and combined project/task/keyword filters.
- [x] Run the test and confirm the placeholder fails.
- [x] Implement the page shell, dataset, aggregate model, filter sheet and employee details popup.
- [x] Implement exports and verify empty results plus filtered totals.

## Task 2: Complete chart flow

- [x] Add assertions for View Chart -> View Trend -> clicked month -> analysis, breakdown options, legend expansion and back navigation.
- [x] Implement SVG donuts and Hours / % Total legends by Project, Task, Branch, Department, Section, Grade and Supervisor.
- [x] Render monthly totals from filtered activity dates, and analysis only from the chosen month.
- [x] Keep chart grouping totals and monthly sums equal to table hours.

## Task 3: Verification and review

- [x] Run node scratch/test_timesheet_highlight.cjs for both themes and 360/390/450px widths.
- [x] Inspect reference and new screenshots for table, filter, details, chart, trend and analysis.
- [x] Check PDF print output, CSV download content, syntax and whitespace.
- [x] Run existing Project & Task dashboard/module checks if navigation changes affect them.
- [x] Review the final diff and mark these steps complete. No commit or automatic staging is part of this task.

Validation completed on 2026-10-02: Timesheet Highlight acceptance, Project & Task module navigation and dashboard browser checks all passed. The preview uses 160 deterministic activities across eight employees; all views use the same filtered records. Additional checks cover a 360x600 filter sheet, keyboard focus, filtered CSV totals, empty results, date validation and actual printable PDF artifacts in both themes.
