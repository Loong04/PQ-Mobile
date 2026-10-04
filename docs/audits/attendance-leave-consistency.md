# Attendance and Leave consistency audit

Audit date: 2026-10-04  
Scope: `attendance.html`, `leave.html`, `modules/attendance/**`, `modules/leave/**`, and directly used shared CSS/JS. `C:\Users\loong\Documents\PeopleHCM-Web` was not read or edited. No Git command was used.

## Executive result

Six confirmed issues were found on current mobile routes: **1 high, 5 medium, 0 low**. All six are now fixed and verified; the severity table records the original audit findings. The required Attendance approval titles and the four required summary-card families pass. Existing browser checks for Leave history, Leave approval details, dashboard geometry, and Leave Highlights also pass.

Current formal routes are defined in `js/app.js`: Leave routes to root `leave.html` (`APP_ROUTES.leave` and `leave_holidays`, lines 20 and 51), while Attendance routes to `modules/attendance/index.html` (`attendance` and `time_attendance`, lines 39 and 50).

## Evidence and method

- Inspected the current route map, all Attendance option pages, root Leave implementation, shared `js/app.js`, `js/components.js`, `js/pending-approval-filter.js`, and relevant shared CSS.
- Ran existing Puppeteer checks with installed Chrome at a 390px mobile viewport:
  - `scratch/test_leave_pending_approval_details.cjs` — pass.
  - `scratch/test_leave_history_filters.cjs` — pass.
  - `scratch/test_leave_history_card_fields.cjs` — pass.
  - `scratch/test_individual_dashboard_consistency.cjs` — pass.
  - `scratch/test_team_pending_action_consistency.cjs` — pass.
  - `scratch/test_leave_highlight_consistency.js` — pass, with no page errors.
- Ran a focused read-only Puppeteer reproduction for all three Attendance approval categories, Hours Summary list view, and all required summary views in both `shift-plan.html` and `ot-plan.html`.
- The first browser attempts failed because Puppeteer's bundled Chrome was absent; rerunning against installed Chrome succeeded. No browser assets or screenshots were created.

## Confirmed issues

### 1. High — Attendance approval details show values that contradict the selected card

**Files / lines / selectors**

- `modules/attendance/options/team.html:15-65` — `openAttendanceThreeDotsMenu` initializes `reason`, `dates`, and `duration` to defaults and does not resolve the selected record from `staffDatabase.pending_approval`.
- `modules/attendance/options/team.html:29-51` — the function scrapes broad style selectors; the first `background: var(--bg-input)` block is used as the remark.
- `modules/attendance/options/team.html:96-195` — `triggerAttendanceViewDetails` populates the detail overlay from that incomplete/scraped object.
- Source records containing the correct values are at `modules/attendance/options/team.html:3770-3786`.
- Affected overlay selectors: `#attFieldSubmitDate`, `#attFieldOtDate`, `#attFieldOtReason`, `#attFieldRemarks`.

**Reproduction / route**

1. Apps → Attendance → Team → Pending Approval.
2. Open the three-dot menu on the first card in each category and choose View Details.
3. Compare the card with its detail overlay.

**Expected**

The detail overlay should show the selected record's dates, reason, hours, shift, and remarks.

**Actual evidence**

- Final OT / Alex Tan: card reason `Monthly Operations Closing`; detail reason `Operations`. Card remark `Actual overtime hours worked for month-end system batch operations.`; detail remark becomes `Actual Hours 2.50 hrs Approved Hours 2.50 hrs`.
- OT Plan / Michelle Chen: card date `Fri, 27/02/2026`; detail date `Wed, 25/02/2026`. Card reason `PLC Calibration`; detail reason `Operations`. Detail remark becomes the OT time/plan-hours block.
- Attendance Feedback / Afifah Nasir: card date `Tue, 24/02/2026`; detail date `Wed, 25/02/2026`. Card reason `Missing Clock Out`; detail reason `Operations`. Detail remark becomes `Amended Shift 08:00 AM – 05:30 PM`.
- The required headers do pass at runtime: `Final OT Approval`, `OT Plan Approval`, and `Attendance Advice Approval`.

**Root-cause hypothesis**

The card renderer passes only `item.id` to `openAttendanceThreeDotsMenu`. The handler then reconstructs the selected record by scraping rendered styles and fallback constants rather than looking up the original item.

**Smallest fix**

Pass a stable record key/category or the record index, look up the exact item in `staffDatabase.pending_approval`, and assign `currentAttendanceSelectedData` from that object. Remove the style-based queries and default field reconstruction except as a true missing-data fallback.

### 2. Medium — Attendance Pending Approval counts use three incompatible totals

**Files / lines / selectors**

- Dashboard: `modules/attendance/options/team.html:1416` shows `26 Tasks`; line 1438 shows Pending Approval `18`.
- Actual pending dataset: `modules/attendance/options/team.html:3768-3787` contains 13 records: 5 Final OT, 4 OT Plan, 4 Attendance Feedback.
- Modal count maps disagree with each other: line 4122 uses `14`; line 4388 uses `18`.
- The dedicated category count is correctly calculated from the filtered array at lines 3889-3903.
- Selectors: `.team-action-required-badge`, `.team-pending-approval-count`, `#pendingApprovalCountBadge`, `#staffListModalSub`.

**Reproduction / route**

Apps → Attendance → Team. Read Action Required and Pending Approval counts, then open Pending Approval and visit all three tabs.

**Expected**

Counts should derive from the same live records. With the current fixture, Pending Approval totals 13; combined with 8 Attendance Verification items, Action Required totals 21.

**Actual**

The dashboard reports 18 pending and 26 total tasks; the tabs expose 5 + 4 + 4 = 13 records. A secondary staff-list path reports either 14 or 18 depending on which update function ran.

**Root-cause hypothesis**

Display totals were duplicated as literals and separate `countMap` entries while category lists became data-driven.

**Smallest fix**

Compute pending totals from `staffDatabase.pending_approval`, compute Action Required from its live child queues, and remove both `pending_approval` literals from the count maps.

### 3. Medium — Leave dashboard count does not describe the queue it opens

**Files / lines / selectors**

- `leave.html:2181-2199` shows `6 Tasks` / Pending Approval `6` and opens `viewTeamApprovals` without carrying a date/category filter.
- `leave.html:8599-8650` supplies the six from independent month summary fixtures.
- `leave.html:5211-5243` opens the queue with `All Requests • All Dates` and defaults to the Leave tab.
- Current cards are 4 Leave (`leave.html:5256`, 5374, 5478, 5568), 2 Leave Credit (5661, 5754), and 3 Time Off (5850, 5943, 6036).
- Selectors: `#leaveTeamActionRequiredCount`, `#teamPendingCount`, `#teamApprovalsFilterSummaryText`, `#pendingCountBadgePill`.

**Reproduction / route**

Apps → Leave → Team. Click the Pending Approval tile showing 6.

**Expected**

The destination should show the same six records, or the entry count should clearly describe a narrower month/category and carry that filter into the queue.

**Actual**

The destination opens `All Requests • All Dates`, defaults to Leave, and shows 4. Across its three tabs it contains 9 records.

**Root-cause hypothesis**

The dashboard uses month-level synthetic statistics while the queue uses a separate static all-date dataset and receives no filter state from the entry point.

**Smallest fix**

Choose one shared approval dataset. Derive the dashboard count from the queue under the active team-month filter and pass that month/filter into `showLeaveSection('viewTeamApprovals')`.

### 4. Medium — Hours Summary exposes a forbidden icon-only square “View Chart” control

**Files / lines / selectors**

- `modules/attendance/options/hours-summary.html:1132-1135` — `#btn-chart-toggle` is a fixed 40×40 button with only `fa-chart-simple`.
- `modules/attendance/options/hours-summary.html:1849-1862` — `setView('list')` makes it visible.
- This page is a live Quick Options route from `modules/attendance/index.html:294-299`.

**Reproduction / route**

Apps → Attendance → Hours Summary → select any metric card to open its record list.

**Expected**

A single-line pill containing `<i class="fa-solid fa-chart-pie"></i><span>View Chart</span>` with `white-space: nowrap`.

**Actual**

Runtime computed evidence in list view: visible `display:flex`, 40×40, empty text, icon `fa-solid fa-chart-simple`, and `white-space: normal`.

**Root-cause hypothesis**

The newer compliant `.view-chart-btn` CSS exists in the page, but this older header toggle still uses an inline square-button implementation.

**Smallest fix**

Replace the inline dimensions/icon-only markup with the existing `.view-chart-btn` pattern, the required pie icon, and visible `View Chart` text.

### 5. Medium — Leave employee cards do not render IDs in the required `#…` identity line

**Files / lines / selectors**

- Pending approval cards: `leave.html:5267-5270`, 5385-5388, 5485-5488, 5575-5578, 5668-5671, 5761-5764, 5857-5860, 5950-5953, 6043-6046.
- Team calendar cards: `leave.html:10008-10016`.
- Staff entitlement detail profile: `leave.html:10278-10287`.
- Approval workflow person cards also use the same pattern, for example `leave.html:6985-7015`.
- Affected containers include `.approval-request-card`, `#calDateStaffList`, `#staffEntitlementModalContent`, and the approval-workflow cards inside `#approvalDetailsModalOverlay`.

**Reproduction / route**

- Apps → Leave → Team → Pending Approval, then inspect any Leave/Leave Credit/Time Off card.
- Apps → Leave → Team Calendar → select a populated day.
- Apps → Leave → Staff Entitlement → open a staff member.

**Expected**

The line directly below the name should begin with the normalized ID (`#004177`, `#EBB12`) and use compact muted 11.5px/700 monospace styling. Job title/position should be separate metadata.

**Actual**

Examples include `QA Manager • Emp #004177`, `Emp #EBB12 • Human Resource`, and `Emp #004177 • ADMIN MANAGER`. The identifier is embedded after a label/role, and most affected lines use 10–11px, weight 600, and no monospace font.

**Root-cause hypothesis**

Several older inline card templates encode employee identity and role in one metadata string rather than using a shared employee-name / employee-ID component.

**Smallest fix**

Split each template into a name line, a normalized `#${empNo.replace(/^#+/, '')}` ID line using one shared class, then a separate role/department line.

### 6. Medium — Attendance Team employee lists omit the leading `#` and required ID typography

**Files / lines / selectors**

- Source IDs are stored without `#` at `modules/attendance/options/team.html:3630-3761` (for example `EMP-1002`).
- Generic staff-card renderer at `modules/attendance/options/team.html:4279-4292`, especially line 4287, outputs `${item.id} • ${item.dept}` with 11.5px/600 and no monospace font.
- Selector: `#staffListContent .staff-card-item` (rendered by `renderStaffList`).

**Reproduction / route**

Apps → Attendance → Team → open Scheduled, Present, No Show, OT, or Attention staff lists.

**Expected**

Directly below the name: `#EMP-1002` in muted compact 11.5px/700 monospace text, with department/branch on a separate line.

**Actual**

Cards show `EMP-1002 • Operations` (and similar values), without a leading `#`, at weight 600, combined with department/branch.

**Root-cause hypothesis**

The generic renderer predates the employee-ID standard; only the separately rendered pending-approval cards normalize IDs.

**Smallest fix**

Normalize the ID in `renderStaffList`, apply the existing employee-ID typography used by the pending-approval renderer, and move department/branch into its own metadata element.

## Fixed / verification

Fixed on 2026-10-04:

- Attendance approval details now resolve the selected object from `staffDatabase.pending_approval`, so Final OT, OT Plan, and Attendance Advice details retain their record-specific dates, reasons, hours, shifts, and remarks.
- Attendance dashboard, staff-list, and category totals now derive from the live pending and verification arrays. The current fixture produces 13 Pending Approvals and 21 Action Required tasks.
- Leave dashboard approval totals now derive from all unhandled cards in the queue. The current fixture produces 9 tasks, and Approve, Reject, Resubmit, and batch handling keep the dashboard total synchronized.
- Hours Summary now uses the required labeled `View Chart` pill with `fa-solid fa-chart-pie`; Daily OT also explicitly keeps its labeled chart control on one line.
- Leave pending approval, team calendar, entitlement, and approval-workflow employee cards now render a normalized muted monospace `#ID` line directly below the name, with role/department on its own line.
- Attendance staff lists now normalize IDs with `#`, use 11.5px/700 muted monospace styling, and separate department/branch metadata.
- The five additional broken actions found during implementation now have visible, data-backed behavior: Leave card Backup and Resubmit; Daily Manpower chart; Hours Costing chart; Shift Summary shift-type reset; and Attendance workflow backup selection.

Verification evidence:

- `scratch/test_attendance_leave_report_fixes.cjs` passes 8 focused browser checks covering record fidelity, counts, all cited employee-card families, Hours Summary, and Daily OT.
- `scratch/test_attendance_leave_action_fixes.cjs` passes 6 focused browser checks covering every repaired action/modal.
- Existing regressions pass 6/6: `test_leave_pending_approval_details.cjs`, `test_leave_history_filters.cjs`, `test_leave_history_card_fields.cjs`, `test_individual_dashboard_consistency.cjs`, `test_team_pending_action_consistency.cjs`, and `test_leave_highlight_consistency.js`. The shared dashboard regression now derives Attendance and Leave task totals from their current fixtures to prevent literal-count drift.
- Browser verification used installed Chrome through Puppeteer at a 390px mobile viewport. No Git command was used.
## Confirmed compliant behavior / false positives

- **Attendance approval headers pass.** Runtime reproduction returned exactly `OT Plan Approval`, `Attendance Advice Approval`, and `Final OT Approval` from `modules/attendance/options/team.html:184-194`.
- **Required summary cards pass in both active implementations.** In `modules/attendance/options/shift-plan.html` and `modules/attendance/options/ot-plan.html`, Work Shift Summary, No Work Summary, OT Plan Summary, and Leave Summary produced 6/1/2/3 cards respectively. Every card computed to an 18px radius, had title-left/chevron-right structure, and contained no `.history-date-badge`.
- The presence of `.history-date-badge` CSS in `shift-plan.html:519-559` is not a violation by itself; none appears in the four required summary views.
- `modules/attendance/options/shift-summary.html` contains unused `.view-chart-btn` CSS but no View Chart control. The stale `scratch/verify_shift_summary.js` expectation therefore reports false; absence of an optional button is not a presentation-standard violation.
- Leave approval detail employee presentation passes at `leave.html:6622-6628` and 6706, and the existing browser contract confirms `#EBB21` directly below the name.
- Leave Highlights View Chart passes: visible `View Chart`, `fa-solid fa-chart-pie`, and computed `white-space: nowrap`.
- Leave/Leave Credit/Time Off history filter fields, filter reset, history card fields, and pending approval detail fields passed existing browser checks with no page errors.
- Individual dashboard geometry and Team Action Required card geometry passed existing browser checks. The focused checks covered a 390px mobile viewport in both light and dark where provided by those tests. A complete 320px sweep was not run, so 320px-only clipping remains unconfirmed rather than a finding.

## Duplicate and stale entry pages

- `attendance.html` is a legacy duplicate dashboard. No current `APP_ROUTES` entry targets it; the live route is `modules/attendance/index.html`. It was inspected for scope completeness but excluded from confirmed live-route findings.
- `modules/leave/index.html` is a stale, unreferenced shell. Current routing uses root `leave.html`, and its links at lines 98-110 target a nonexistent `modules/leave/options/` directory. Because no current route points to this page, it is documented as stale rather than counted as a current-route defect. The smallest cleanup is to remove it or redirect it to `../../leave.html` and avoid presenting dead option links.
- The four Attendance summary views are duplicated in both `shift-plan.html` and `ot-plan.html` (for example `shift-plan.html:1080-1431` and `ot-plan.html:878-1362`). Both currently pass, but future changes must be applied twice. Consolidating the shared markup/data would reduce drift risk; this is a maintainability note, not a confirmed user-facing defect.

## Severity count

| Severity | Count |
|---|---:|
| High | 1 |
| Medium | 5 |
| Low | 0 |
| Confirmed total | 6 |
