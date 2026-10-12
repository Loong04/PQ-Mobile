# Manpower Statistics Drill-Down Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consistent Description statistics, Headcount staff-records, and employee-detail drill-downs to Employee & Career Manpower Statistics.

**Architecture:** Keep the existing aggregate table as the entry point, add a deterministic employee dataset whose counts reconcile with every aggregate row, and manage table/chart/staff as in-page views. Render statistics and employee details in reusable purple-header overlays so filters, scroll, focus, and navigation stay in one page.

**Tech Stack:** HTML, CSS custom properties, vanilla JavaScript, Node.js test runner, Puppeteer/Chrome.

**Spec:** `docs/superpowers/specs/2026-10-12-manpower-statistics-drilldown-design.md`

## Global Constraints

- Preserve the existing 34 Manpower records and 282 Total Headcount.
- Description and Headcount are separate keyboard-accessible controls; the table row itself is not clickable.
- Staff-record counts must equal the selected Headcount under the active Effective Date, Company, Branch, Department, and Summary By filters.
- Employee ID appears directly below the employee name, starts with `#`, and uses muted 11.5px bold monospace typography.
- Continue using the current PeopleHCM purple design system in light and dark themes.
- Do not add dependencies, server APIs, databases, pagination, editing, exports, or chart drill-down.
- Preserve current filters, chart behavior, table scroll, and supported 360/390/420px mobile widths.

## Review Focus

- Effective-date boundary records: an employee active exactly on `effectiveFrom` or `effectiveTo` must appear in both the aggregate and staff drill-down.
- Aggregate/staff mismatch after organization filters: Company, Branch, and Department filters must constrain both sources identically.
- Missing optional employee values or portrait: render an em dash or initials avatar, never `undefined`, `NaN`, or a broken image.
- Empty and stale selected groups: show a zero/empty state or polite message without opening an unusable view.
- Stale focus targets after filtering or navigation: close/back operations must restore focus only when the original trigger still exists.

---

## File Structure

- Modify `modules/employee-career/js/manpower-statistics-data.js`: own aggregate demo data and deterministic employee drill-down data.
- Modify `modules/employee-career/options/team/manpower-stats.html`: own the table, staff view, statistics dialog, employee dialog, and live status markup.
- Modify `modules/employee-career/js/manpower-statistics.js`: own filters, aggregation, view state, derived metrics, dialogs, focus, and navigation.
- Modify `modules/employee-career/css/manpower-statistics.css`: own interactive table controls, staff cards, summary card, and both dialog layouts.
- Create `scratch/test_manpower_statistics_data.cjs`: unit-level dataset determinism and reconciliation coverage.
- Modify `scratch/test_employee_career_manpower_statistics.cjs`: browser-level interaction, accessibility, responsive, and regression coverage.

### Task 1: Deterministic Employee Drill-Down Dataset

**Files:**
- Modify: `modules/employee-career/js/manpower-statistics-data.js`
- Create: `scratch/test_manpower_statistics_data.cjs`

**Interfaces:**
- Consumes: `window.MANPOWER_STATISTICS_DATA: AggregateRow[]`, where `AggregateRow` keeps `company`, `branch`, `department`, `jobType`, `headcount`, `effectiveFrom`, and optional `effectiveTo`.
- Produces: `window.MANPOWER_STATISTICS_STAFF: ManpowerEmployee[]` with every property listed in the approved spec.
- Produces: stable reference employee `empNo: "000031"`, `name: "Navin"`, `position: "ACCOUNT EXECUTIVE"` for employee-detail verification.

- [ ] **Step 1: Write the failing dataset test**

Create `scratch/test_manpower_statistics_data.cjs` using `node:test` and `vm`. Add tests named:

- `generates exactly one stable employee for every aggregate headcount`
  - assert aggregate headcount sum is `282`;
  - assert staff length is `282`;
  - assert employee numbers are unique;
  - for every aggregate row, assert matching staff count equals that row's `headcount`.
- `generates complete bounded employee records without runtime randomness`
  - load the file in two isolated VM contexts and deep-equal the staff arrays;
  - assert every required string is present;
  - assert numeric metric fields are finite and within the ranges fixed below;
  - assert `000031 / Navin` is present.
- `keeps effective date boundaries on generated employees`
  - assert generated employees copy the aggregate row's `effectiveFrom` and optional `effectiveTo`.

- [ ] **Step 2: Run the dataset test to verify RED**

Run: `node scratch/test_manpower_statistics_data.cjs`

Expected: FAIL because `window.MANPOWER_STATISTICS_STAFF` is undefined.

- [ ] **Step 3: Implement the deterministic generator**

In `manpower-statistics-data.js`, add:

- `makeEmployee(row: AggregateRow, aggregateIndex: number, employeeIndex: number): ManpowerEmployee`
- `window.MANPOWER_STATISTICS_STAFF = records.flatMap(...)`

Use index-based deterministic values, not `Math.random()`. Bound fields as follows:

- competency points: 1.00–10.00
- competency match: 0.00–100.00
- basic pay: 1800.00–10000.00
- increment: 0.00–8.00
- bonus factor: 0.00–3.00
- attendance: 70.00–100.00
- monthly OT: 0.00–20.00
- training cost: 0.00–2500.00
- performance: 0.00–100.00
- annual attrition: 0.00–10.00

Seed the first ACCOUNT EXECUTIVE employees with the reference names shown by the user, including `000031 / Navin`; generate the remaining names and IDs deterministically. Copy organization and effective-date fields directly from their aggregate row.

- [ ] **Step 4: Run the dataset test to verify GREEN**

Run: `node scratch/test_manpower_statistics_data.cjs`

Expected: all dataset tests PASS with 282 reconciled employees.

- [ ] **Step 5: Commit Task 1**

```bash
git add modules/employee-career/js/manpower-statistics-data.js scratch/test_manpower_statistics_data.cjs
git commit -m "feat: add manpower drill-down employee data"
```

### Task 2: Description Statistics Popout

**Files:**
- Modify: `modules/employee-career/options/team/manpower-stats.html`
- Modify: `modules/employee-career/js/manpower-statistics.js`
- Modify: `modules/employee-career/css/manpower-statistics.css`
- Modify: `scratch/test_employee_career_manpower_statistics.cjs`

**Interfaces:**
- Consumes: `window.MANPOWER_STATISTICS_STAFF` from Task 1.
- Produces: `getFilteredStaff(filters): ManpowerEmployee[]`.
- Produces: `getGroupStaff(metric, label): ManpowerEmployee[]`, using the already-filtered active staff.
- Produces: `summarizeGroup(label, staff): GroupStatistics`.
- Produces: `openGroupStatistics(label, trigger): void` and `closeDetailOverlay(restoreFocus = true): void`.

- [ ] **Step 1: Write failing browser assertions for Description controls**

Extend the browser test to assert:

- every rendered Description cell contains one button;
- the first button's accessible name is `View statistics for ACCOUNT EXECUTIVE`;
- clicking it opens `#manpowerStatisticsOverlay`;
- the dialog title is `Manpower Statistics`;
- the key-value labels are exactly the 17 fields from the spec, in order.

Add a controlled two-employee fixture through `evaluateOnNewDocument` with known ages, hire dates, pay, and performance metrics. Assert exact two-decimal Average, Median, Minimum, and Maximum values from that fixture.

- [ ] **Step 2: Run the browser test to verify RED**

Run: `node scratch/test_employee_career_manpower_statistics.cjs`

Expected: FAIL because Description cells are plain text and the statistics overlay does not exist.

- [ ] **Step 3: Add statistics-dialog markup**

In `manpower-stats.html`, add:

- `#manpowerStatisticsOverlay` with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="manpowerStatisticsDialogTitle"`;
- purple header, title, close button, scrollable body, and `#manpowerStatisticsDetails` table container;
- `#manpowerDrilldownStatus` as a polite live region.

- [ ] **Step 4: Implement filtering and metric helpers**

In `manpower-statistics.js`, implement:

- `isEffectiveOn(employee, effectiveDate): boolean` with inclusive start/end boundaries;
- `getFilteredStaff(filters): ManpowerEmployee[]`;
- `getGroupStaff(metric, label): ManpowerEmployee[]`;
- `yearsBetween(start, end): number`;
- `summarizeGroup(label, staff): GroupStatistics`;
- `formatNumber(value): string` returning two decimals and guarding empty/non-finite values;
- `formatMoney(value): string` returning locale-formatted two-decimal numbers without a currency prefix.

Store the filtered staff subset in state whenever `renderTable()` applies aggregate filters.

- [ ] **Step 5: Render Description buttons and dialog behavior**

Change `renderTable()` so the first cell contains `button.manpower-description-link`. Implement `openGroupStatistics(label, trigger)`, overlay close button, Escape, backdrop close, inert background, focus trap, and exact-trigger focus restoration.

- [ ] **Step 6: Add dialog and table-control styling**

In `manpower-statistics.css`, add visible link-like table controls with focus styles and a centered, mobile-safe, purple-header dialog. Keep the details body vertically scrollable and prevent horizontal overflow.

- [ ] **Step 7: Run the browser test to verify GREEN**

Run: `node scratch/test_employee_career_manpower_statistics.cjs`

Expected: PASS for statistics field order, controlled metrics, focus handling, themes, and existing table/chart assertions.

- [ ] **Step 8: Commit Task 2**

```bash
git add modules/employee-career/options/team/manpower-stats.html modules/employee-career/js/manpower-statistics.js modules/employee-career/css/manpower-statistics.css scratch/test_employee_career_manpower_statistics.cjs
git commit -m "feat: add manpower statistics details"
```

### Task 3: Headcount Staff Records View

**Files:**
- Modify: `modules/employee-career/options/team/manpower-stats.html`
- Modify: `modules/employee-career/js/manpower-statistics.js`
- Modify: `modules/employee-career/css/manpower-statistics.css`
- Modify: `scratch/test_employee_career_manpower_statistics.cjs`

**Interfaces:**
- Consumes: `getGroupStaff(metric, label): ManpowerEmployee[]` from Task 2.
- Produces: `showStaffRecords(label, trigger): void`.
- Produces: `renderStaffRecords(staff): void`.
- Extends state with `view: "table" | "chart" | "staff"`, `selectedGroupLabel`, `tableScroll`, and `staffTrigger`.

- [ ] **Step 1: Write failing staff-view assertions**

Extend the browser test to assert:

- every Headcount cell contains one button;
- ACCOUNT EXECUTIVE accessible name is `View 48 staff records for ACCOUNT EXECUTIVE`;
- clicking it shows `#manpowerStaffView`, hides table/chart views, and changes the header to `ACCOUNT EXECUTIVE Staff Records`;
- the white Total Records card displays `48`;
- exactly 48 employee cards render;
- every employee card has name followed immediately by a muted `#Employee ID`, then Position and Department;
- the main back button returns to the table, restores table scroll, and restores focus to the clicked Headcount button.

- [ ] **Step 2: Run the browser test to verify RED**

Run: `node scratch/test_employee_career_manpower_statistics.cjs`

Expected: FAIL because Headcount cells are plain text and `#manpowerStaffView` does not exist.

- [ ] **Step 3: Add staff-view markup**

In `manpower-stats.html`, add hidden `#manpowerStaffView` containing:

- `#manpowerStaffSummary` white Total Records card;
- `#manpowerStaffTotalRecords`;
- `#manpowerStaffList`;
- `#manpowerStaffEmpty`.

- [ ] **Step 4: Implement staff-view rendering and navigation**

Implement `showStaffRecords(label, trigger)` and `renderStaffRecords(staff)`. Each card is a button with:

- `.employee-name`;
- immediately following `.employee-id` with normalized leading `#`;
- Position and Department rows;
- chevron.

Update `showView(view)` and the existing back handler so chart returns to table, staff returns to table, and table returns to Employee & Career.

- [ ] **Step 5: Style the Total Records and employee cards**

Reuse existing card variables and spacing. Ensure the summary is white/light-card in light mode, theme-card in dark mode, and employee cards remain readable without adopting the legacy pink reference styling.

- [ ] **Step 6: Run the browser test to verify GREEN**

Run: `node scratch/test_employee_career_manpower_statistics.cjs`

Expected: PASS with 48 Account Executive records, correct ID placement, state preservation, and no overflow.

- [ ] **Step 7: Commit Task 3**

```bash
git add modules/employee-career/options/team/manpower-stats.html modules/employee-career/js/manpower-statistics.js modules/employee-career/css/manpower-statistics.css scratch/test_employee_career_manpower_statistics.cjs
git commit -m "feat: add manpower staff records drill-down"
```

### Task 4: Employee Detail Popout

**Files:**
- Modify: `modules/employee-career/options/team/manpower-stats.html`
- Modify: `modules/employee-career/js/manpower-statistics.js`
- Modify: `modules/employee-career/css/manpower-statistics.css`
- Modify: `scratch/test_employee_career_manpower_statistics.cjs`

**Interfaces:**
- Consumes: employee cards rendered by Task 3.
- Produces: `openEmployeeDetails(empNo, trigger): void`.
- Reuses: `closeDetailOverlay(restoreFocus): void` focus/inert/focus-trap behavior from Task 2.

- [ ] **Step 1: Write failing employee-detail assertions**

Extend the browser test to open employee `#000031 / Navin` and assert:

- `#manpowerEmployeeOverlay` opens above the staff view;
- all 14 labels from the spec appear in order;
- Employee # is `#000031`;
- Name is `Navin`;
- Position and Job are `ACCOUNT EXECUTIVE`;
- Service Years is a finite two-decimal value;
- a missing photo renders initials and no broken `img`;
- Escape closes the dialog and restores focus to Navin's card.

- [ ] **Step 2: Run the browser test to verify RED**

Run: `node scratch/test_employee_career_manpower_statistics.cjs`

Expected: FAIL because employee cards do not open a detail overlay.

- [ ] **Step 3: Add employee-dialog markup**

In `manpower-stats.html`, add `#manpowerEmployeeOverlay` with purple header, close button, optional portrait/initials region, and scrollable key-value detail table.

- [ ] **Step 4: Implement employee detail rendering**

Implement `openEmployeeDetails(empNo, trigger)`. Find the employee only within the active staff subset, normalize Employee #, calculate Service Years against `state.filters.effectiveDate`, render optional values as an em dash, and use initials when `photo` is absent.

- [ ] **Step 5: Style portrait and employee details**

Keep the portrait restrained, preserve table readability at 360px, and share dialog surface/header/table rules with the statistics overlay to avoid divergent designs.

- [ ] **Step 6: Run the browser test to verify GREEN**

Run: `node scratch/test_employee_career_manpower_statistics.cjs`

Expected: PASS for field order, reference employee values, initials fallback, Escape, and focus restoration.

- [ ] **Step 7: Commit Task 4**

```bash
git add modules/employee-career/options/team/manpower-stats.html modules/employee-career/js/manpower-statistics.js modules/employee-career/css/manpower-statistics.css scratch/test_employee_career_manpower_statistics.cjs
git commit -m "feat: add manpower employee details"
```

### Task 5: Cross-Filter, Empty-State, Accessibility, and Responsive Regression

**Files:**
- Modify: `modules/employee-career/js/manpower-statistics.js`
- Modify: `modules/employee-career/css/manpower-statistics.css`
- Modify: `scratch/test_employee_career_manpower_statistics.cjs`

**Interfaces:**
- Consumes: all Task 1–4 interfaces.
- Produces: completed drill-down behavior across all supported filters, modes, themes, and mobile widths.

- [ ] **Step 1: Write failing cross-mode and failure-mode assertions**

Extend the browser test with literal expectations for:

- Job Type, Company, Branch, and Department summary modes each opening matching staff subsets whose card count equals the clicked Headcount;
- Company + Branch + Department filters constraining table count and staff cards identically;
- employees active exactly on start/end effective-date boundaries remaining included;
- no-result filters keeping table empty without a drill-down trigger;
- invoking a stale group key through the public click path leaving the table visible and updating `#manpowerDrilldownStatus`;
- missing optional fields rendering em dashes and missing photo rendering initials;
- closing a dialog after its trigger was removed focusing the Manpower filter button instead of throwing;
- Tab focus remaining trapped inside each dialog.

- [ ] **Step 2: Run the browser test to verify RED**

Run: `node scratch/test_employee_career_manpower_statistics.cjs`

Expected: at least one new boundary, stale-focus, or empty-state assertion FAILS.

- [ ] **Step 3: Implement minimal guards and shared dialog cleanup**

Add only the guards required by Step 1:

- validate selected group against the active grouped table result;
- use the polite live region for stale groups;
- centralize safe focus restoration with the filter button fallback;
- normalize missing table values;
- ensure filter application closes any open overlay and returns to table view.

- [ ] **Step 4: Verify mobile layout and reduced motion**

Add or refine CSS so:

- table controls, Total Records, employee cards, and dialogs do not overflow at 360/390/420px;
- dialog bodies scroll vertically;
- reduced-motion media rules disable nonessential transitions.

- [ ] **Step 5: Run focused tests**

Run:

```bash
node scratch/test_manpower_statistics_data.cjs
node scratch/test_employee_career_manpower_statistics.cjs
node --check modules/employee-career/js/manpower-statistics-data.js
node --check modules/employee-career/js/manpower-statistics.js
```

Expected: dataset and browser tests PASS; syntax checks exit 0.

- [ ] **Step 6: Run project-available regression checks**

Run:

```bash
node scratch/test_employee_career_module.cjs
node scratch/test_employee_career_team_dashboard.cjs
git diff --check -- modules/employee-career/js/manpower-statistics-data.js modules/employee-career/options/team/manpower-stats.html modules/employee-career/js/manpower-statistics.js modules/employee-career/css/manpower-statistics.css scratch/test_manpower_statistics_data.cjs scratch/test_employee_career_manpower_statistics.cjs
```

Expected: existing Employee & Career regressions PASS and diff check exits 0. If an unrelated pre-existing failure appears, report its exact test name and output rather than hiding it.

- [ ] **Step 7: Perform the final requirements audit**

Compare the implementation against every Acceptance Criteria item in the spec. Confirm that no chart drill-down, dependency, server API, or unrelated Employee & Career change was added.

- [ ] **Step 8: Commit Task 5**

```bash
git add modules/employee-career/js/manpower-statistics-data.js modules/employee-career/options/team/manpower-stats.html modules/employee-career/js/manpower-statistics.js modules/employee-career/css/manpower-statistics.css scratch/test_manpower_statistics_data.cjs scratch/test_employee_career_manpower_statistics.cjs
git commit -m "test: verify manpower drill-down flows"
```
