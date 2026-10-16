# Staff Competency Hub Implementation Plan

> **For agentic workers:** Use executing-plans to implement these tasks inline.

**Goal:** Keep one Staff Competency option with Staff, Assessment, Search and Gap Summary views.

**Architecture:** Preserve the current Staff report. Add a focused hub controller and pure report helpers using the existing competency definitions, assignments and saved assessment history. Reuse employee details and assessment pages with explicit return context.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Node test runner, Puppeteer/Chrome.

**Spec:** User-approved four-view design in this conversation, 2026-10-16.

## Global Constraints

- No brainstorming. Implement the approved structure directly in the shared workspace and preserve unrelated edits.
- Employee IDs appear below names on cards, prefixed with # and muted.
- View Chart includes fa-solid fa-chart-pie and visible text in a horizontal pill.
- Negative gap is current level minus required level < 0; positive gap > 0; exclude zero from both.
- Do not invent missing age or service dates. Preserve existing assessment fields and submission behavior.
- Keep light/dark themes, mobile layout, keyboard navigation, and independent filter state.

## Review Focus

- Returning from employee details or an assessment restores the originating tab and its filters.
- Skill group selections assess the selected assignments rather than silently using the first group.
- Missing dates/levels are not treated as zero or silently matched by numeric ranges.
- Gap counts deduplicate employees per competency and agree with the drill-down list.
- Empty results, invalid ranges, corrupted assessment storage, and browser back remain usable.

### Task 1: Report calculations

**Files:** Create `modules/training-competency/js/staff-competency-reports.js`; test `scratch/test_staff_competency_reports.cjs`.

**Interfaces:** `window.StaffCompetencyReports` exposes `assessmentRows(employees, records, definitions, filters, today)`, `searchRows(employees, records, definitions, filters, today)`, and `gapGroups(rows, definitions, sign)`.

- [x] Write and run failing tests for employee aggregation, last assessment age, missing demographics, inclusive numeric ranges, zero/invalid gaps and distinct counts.
- [x] Implement helpers, reading demographics only when provided by source data.
- [x] Run `node --test scratch/test_staff_competency_reports.cjs` and confirm all pass.

### Task 2: Four-view mobile hub and return routing

**Files:** Modify Staff Competency HTML/JS/CSS, competency-summary.js and staff-competency-assess.js; create staff-competency-hub.js and browser tests.

**Interfaces:** Hub query parameters use `tab`, per-view prefixes and `gapSign`/`gapSkill`. Child pages receive `hubReturn` containing only query parameters; destinations stay fixed local files.

- [x] Write a failing browser test for tabs, independent filters, gap drilldown, assessment submission and return paths.
- [x] Add the two-by-two tab navigation and report views, reusable filter sheet, numeric gap status and charts.
- [x] Preserve Staff report/export behavior and route hub assessments through the existing page.
- [x] Run browser tests in 360/420px light/dark modes and inspect screenshots.

### Task 3: Verification and review

- [x] Run report unit tests and affected Staff, Assessment, Competency Summary and module browser regression scripts.
- [x] Review changes for routing, accessibility, missing data and layout; fix confirmed issues and re-run relevant checks.
- [x] Report what shipped and limitations (existing demo data and browser storage persistence).

## Execution Notes

Proceed inline under the user's approval; no further design approval needed. No commits, merges or publishing requested. Existing Staff table remains intact; new employee cards follow the name/ID standard.

Completed 2026-10-16. Fresh review found three navigation issues, all reproduced with failing tests and fixed: stale Staff filters after browser Back, inactive Gap selection intercepting Search Back, and a Staff filter remaining open on history navigation. Reviewer confirmed no remaining important findings.

Final verification: `node --test scratch/test_staff_competency_reports.cjs scratch/test_staff_competency_hub.cjs scratch/test_staff_competency_navigation.cjs scratch/test_staff_competency.cjs scratch/test_staff_competency_assess.cjs scratch/test_competency_summary.cjs scratch/test_training_competency_module.cjs` — 10 passed, 0 failed. Mobile screenshots inspected at 360/420px in both themes, including live font/icon resources and filter sheets.
