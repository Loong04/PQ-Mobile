# System History Total Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one neutral, white-in-light-mode `Total Records` card to every production full-page History list and keep its numeric value synchronized with the active rendered result set.

**Architecture:** Define one shared presentation contract in `css/app.css`, then reuse the same three classes across all qualifying History views. Each page's existing render or tab-switch function remains the source of truth for its count; no new data layer or filtering behavior is introduced.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS custom properties, Node.js `assert`, Puppeteer.

**Spec:** User-approved requirements in this conversation; repository constraints in `AGENTS.md`.

## Global Constraints

- The card label is exactly `Total Records`.
- The value contains digits only and is announced with `aria-live="polite"`.
- The card uses `var(--bg-card)` and inherited neutral text, with no purple/accent text or gradient.
- Light mode renders a white surface; dark mode remains theme-readable.
- Counts represent the active tab/category and the currently rendered filtered result set.
- Exclude pending-work pages, modal-only audit histories, embedded profile subsections, `scratch` mirrors, and `.orig` files.
- Preserve the Employee ID, View Chart, approval-header, and history-card standards in `AGENTS.md`.

## Review Focus

- Zero-result filters must show `0` without hiding the total card.
- Switching tabs/categories must never retain the previous list's count.
- The legacy status-deep-linked Attendance History must count only visible cards.
- Static Bonus and Salary counts must be derived from table rows, not duplicated constants.
- The card must fit at 360px without horizontal overflow.

---

### Task 1: System-wide contract test

**Files:**
- Create: `scratch/test_history_total_records.cjs`

**Interfaces:**
- Consumes: production History pages through their rendered DOM.
- Produces: an executable contract for markup, visual neutrality, placement, responsiveness, and active-result counts.

- [ ] Write the Puppeteer contract test for the ten qualifying History experiences.
- [ ] Run `node scratch/test_history_total_records.cjs` and confirm it fails because the shared total cards do not exist.

### Task 2: Shared component and static/inline History views

**Files:**
- Modify: `css/app.css`
- Modify: `bonus-history.html`
- Modify: `salary-history.html`
- Modify: `leave.html`
- Modify: `modules/attendance/options/history.html`
- Modify: `modules/attendance/options/clocking-history.html`

**Interfaces:**
- Consumes: `.history-total-records-card`, `.history-total-records-label`, and `.history-total-records-value` contract from Task 1.
- Produces: reusable neutral styling plus counts for static tables, Leave tabs/filters, and both Attendance History routes.

- [ ] Add the shared CSS component.
- [ ] Add or relocate one card per active History list.
- [ ] Update counts from table rows, filtered Leave data, and active/visible Attendance cards.
- [ ] Run the contract test and confirm these pages pass their cases.

### Task 3: Dynamic module History views

**Files:**
- Modify: `modules/claims/options/history.html`
- Modify: `modules/project-task/options/history.html`
- Modify: `js/project-task/project-task-history.js`
- Modify: `modules/employee-career/options/history.html`
- Modify: `modules/employee-career/js/employee-career-history.js`
- Modify: `modules/admin/options/history.html`
- Modify: `modules/admin/js/workplace-history-ui.js`
- Modify: `modules/payroll/options/history.html`
- Modify: `js/payroll/payroll-history.js`

**Interfaces:**
- Consumes: the shared card markup contract.
- Produces: digit-only filtered counts for every active category, including zero-result states.

- [ ] Convert inline heading counts into standalone shared cards.
- [ ] Preserve each module's existing filtering and data lifecycle while changing only count output.
- [ ] Run `node scratch/test_history_total_records.cjs` and confirm all cases pass.

### Task 4: Regression and visual verification

**Files:**
- Modify only if a regression test exposes a requirement gap.

**Interfaces:**
- Consumes: completed system-wide component.
- Produces: fresh verification evidence and a reviewable final diff.

- [ ] Run the relevant existing History suites for Attendance, Claims, Leave, Payroll, Career, Project, Workplace, Bonus, and Salary.
- [ ] Run the new contract at light/dark themes and 360/390/420px widths.
- [ ] Inspect screenshots for representative pages and run a fresh whole-change code review.

