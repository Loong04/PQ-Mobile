# Payroll, Project & Task, Me/Profile, and Shared Mobile Consistency Audit

Audit date: 2026-10-04 (MYT)  
Scope: current reachable mobile routes for Payroll, Project & Task, Home/App, Me/Profile, Calendar, Team/Subordinates, Change Request, Salary/Bonus, Favourites, and shared navigation. `C:\Users\loong\Documents\PeopleHCM-Web`, `no/**`, test fixtures, and unreferenced legacy pages were excluded from defect counts. The original findings are retained below, followed by remediation status and verification evidence for the implemented fixes.

## Result

| Severity | Count |
|---|---:|
| High | 8 |
| Medium | 5 |
| Low | 0 |
| **Total confirmed** | **13** |

**Remediation status:** 13 fixed and covered by the focused regression suite on 2026-10-04.

Evidence combined current source tracing with a focused local Chromium run at mobile routes. The browser run reproduced: Project approval remained `Pending` with 3 cards after Approve; Team retained 3 unchanged approval cards after Approve; Calendar rendered October 2027 with 30 days ending at day 30; and `me.html?theme=dark` / `calendar.html?theme=dark` reverted to dark after switching to light and reloading.

## Confirmed findings

### H1 — Signed-in employee identity changes between formal routes

- **Severity:** High
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `homelight.html:38`, `homedark.html:38`, `applight.html:38`, `appdark.html:38` (`.greeting-title`); `js/components.js:148-165` (`.drawer-user-box`, `.drawer-id-badge`); `me.html:33-66` (`.me-title-group`, `.me-pass-card`); `js/payroll/payroll-config.js:9-21` (`PAYROLL_CONFIG.employee`); `js/payroll/payroll-config.js:128` (`payslips['2025-12'].pdfFile`); `modules/payroll/options/payslip.html:224-271` (`PAYSLIP_DEFAULT_PERIOD`, `renderPayslipPdf`).
- **Route / reproduction:** Open Home/App and the shared profile drawer, then bottom-nav Me, then Payroll > Payslip. Home and Payroll identify the user as Sarah Jenkins / EBB01; Me, Salary, and Bonus identify the user as Farhan binti rahmat / EBB12. The default Payslip renders Sarah / `#EBB01` but names its document `Payslip_Dec_2025_Farhan_Binti_Rahmat.pdf`.
- **Expected:** One current-user record supplies name, employee ID, role, email, and payroll ownership across all routes and documents.
- **Actual:** Independent hard-coded identities represent at least Sarah Jenkins, Farhan binti rahmat, `EBB01`, `EBB12`, and `PQ-8042` as the signed-in user.
- **Root-cause hypothesis:** Home/shared navigation, Me, and Payroll each own separate mock user data; the first payslip is a leftover Farhan record while the renderer always injects the global Sarah employee.
- **Smallest fix:** Create one shared current-user fixture and reference it from Home, shared components, Me, Payroll, Salary, and Bonus; either remove the Farhan December payslip from Sarah's collection or give each payslip an owner and reject cross-owner rendering.

### H2 — Project Pending Approval actions do nothing

- **Severity:** High
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `modules/project-task/options/pending-approval.html:61-63,87-89,113-115,190-192` (`[data-project-approval-action]`); `js/project-task/project-task-app.js:295-390` (`initPendingApprovalSelection`, `initPendingApprovalSheets`).
- **Route / reproduction:** App > Project & Task > Team > Pending Approval; tap Approve, Resubmit, or Reject on a card or inside View Details.
- **Expected:** Update the request status, remove or reclassify it in the pending queue, refresh counts, and preserve comments.
- **Actual:** Browser reproduction left all 3 cards and the first card's `Pending` status unchanged. The controller binds checkboxes, menus, details, and workflow only; it never binds `[data-project-approval-action]`.
- **Root-cause hypothesis:** Presentation buttons were added after the sheet controller without an approval-state/store handler.
- **Smallest fix:** Add one delegated handler backed by a local ProjectPendingStore, persist the decision, rerender cards/counts, and reuse it for card and details-sheet buttons.

### H3 — Project History discards valid records before filtering and ignores the real timesheet draft

- **Severity:** High
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `js/project-task/project-task-history.js:305-318` (`getWorkPlans`, `selectStatusSamples`); `js/project-task/project-task-history.js:361-367` (`getTimesheets`); `js/project-task/project-task-forms.js:204-214,361-374` (`pq_project_timesheet_draft`, `pq_project_timesheets`).
- **Route / reproduction:** Save two Work Plans with the same status, or save a Timesheet draft; open Project & Task > History and filter for the older record/draft.
- **Expected:** History loads every unique saved record, then filters it; the draft saved by the form appears as Draft.
- **Actual:** `selectStatusSamples()` uses one `find()` for Submitted and one for Draft, permanently reducing the result to at most two records before filtering. The form saves a draft to `pq_project_timesheet_draft`, but History only reads `pq_project_timesheets`.
- **Root-cause hypothesis:** Screenshot sample selection was left in the production data path, and the form/history storage contracts were designed separately.
- **Smallest fix:** Return the complete deduplicated array, apply filters during render, and normalize `pq_project_timesheet_draft` into the same history model (or save drafts in `pq_project_timesheets` with `status: Draft`).

### H4 — Shared Favourites contains route keys that do not exist

- **Severity:** High
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `js/app.js:14-71` (`APP_ROUTES`); `js/app.js:1115-1138` (`SYSTEM_FAV_CATALOG`); `js/app.js:1245-1251` (`.fav-grid-item`).
- **Route / reproduction:** On Home/App, open the bottom-nav Favourite sheet. The default favourites include Medical & Outpatient Claim and Overtime Request; tap either. Also star Bonus or Subordinates and tap it.
- **Expected:** Every labelled shortcut resolves to the matching current route.
- **Actual:** The catalog sends `work_behaviour`, `change_request`, `bonus_history`, and `subordinates` into `navTo()`, but none is defined in `APP_ROUTES`; the handler only shows a generic clicked toast. Claims also points conceptually to Change Request rather than Claims.
- **Root-cause hypothesis:** The favourites catalog uses internal snake-case names while the router uses a different and incomplete key set.
- **Smallest fix:** Store canonical `APP_ROUTES` keys in the catalog (`claims_expenses`, etc.), add the missing real routes, and validate the catalog against `APP_ROUTES` at startup/test time.

### H5 — Current Team page has inert approvals and broken Home navigation

- **Severity:** High
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `js/app.js:21` (`APP_ROUTES.team`); `team.html:888-927` (`.approval-card .btn-approve`, `.btn-reject`); `team.html:736-737,830,1068` (Home/version links); `team.html:487-515` (green/pink approval styling).
- **Route / reproduction:** Home > a Team card, or any `navTo('team')`; tap Approve/Review, then tap bottom-nav Home.
- **Expected:** Approval state/count changes; Home returns to the current theme-aware Home; approval colors match the shared action system.
- **Actual:** Browser reproduction kept all 3 approval cards unchanged. `team.html` has no script/controller for the buttons. Home points to missing `home-v1.html` (and switcher links to missing `home-v2.html`). Approve is green rather than the shared purple approval action.
- **Root-cause hypothesis:** `team.html` is an old standalone implementation that remains the canonical router target.
- **Smallest fix:** Move Team onto shared components/router and bind its actions, or replace `APP_ROUTES.team` with a maintained Team route; replace hard-coded home links with `navTo('home')`.

### H6 — Calendar period selector changes labels while reusing 2026 August/September data

- **Severity:** High
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `calendar.html:187-198` (`#selectFilterYear`, `#selectFilterMonth`); `calendar.html:242-249` (`filterState`); `calendar.html:265-332` (`AUGUST_2026_DAYS`, `SEPTEMBER_2026_DAYS`); `calendar.html:351-408` (`renderCalendar`).
- **Route / reproduction:** Calendar > Filter > Year 2027 > October > Apply; inspect day count and open a date.
- **Expected:** October 2027 has 31 correctly aligned days and details dated October 2027; filtered-out events do not change identity into work shifts.
- **Actual:** Browser reproduction showed only 30 days ending at day 30. All non-August selections use `SEPTEMBER_2026_DAYS`; every date string is hard-coded to 2026-09. Nonmatching events are passed to details as a fabricated Working Shift.
- **Root-cause hypothesis:** The month/year controls were added around two fixed screenshot arrays rather than a calendar data model.
- **Smallest fix:** Generate the month grid from selected year/month, select events by ISO date, and render a neutral empty state when no event matches the active filter.

### H7 — Change Request edit/delete/toggle/save/submit does not maintain one draft or history

- **Severity:** High
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `change-request.html:535-565` (family edit/delete buttons); `change-request.html:702-798` (family editor fields); `change-request.html:1089-1095` (`editFamilyRecord`, `deleteFamilyRecord`); `change-request.html:1127-1143` (`triggerToggleChange`, `saveFamilyMember`); `change-request.html:1246-1261` (`confirmSubmitRequest`).
- **Route / reproduction:** Me > Change Request > Family; edit the daughter, toggle any boolean, delete a member, save, then submit and open Request History.
- **Expected:** Edit loads that member's values; every field type enters the same draft; delete/save mutate the draft; submission appends a trackable history request.
- **Actual:** Edit only changes the sheet title, leaving generic spouse defaults; delete, toggle, and save only show toasts. Submit clears `modifiedFields` after a success toast and does not add a history item.
- **Root-cause hypothesis:** Text inputs have a partial `modifiedFields` implementation, while itemized records, toggles, and history are static presentation mocks.
- **Smallest fix:** Back the page with one draft object keyed by stable record IDs, route all control types through it, and append a local history record before clearing the draft.

### H8 — Payroll and Project History action buttons acknowledge clicks without changing state

- **Severity:** High
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `js/payroll/payroll-history.js:38-52` (`[data-history-action]`, `selectCardAction`); `js/project-task/project-task-history.js:438-462` (`createCardAction`, `createCardActions`).
- **Route / reproduction:** Payroll > History or Project & Task > History; tap Submit/Discard on Draft or Cancel on Submitted.
- **Expected:** Status transitions, discarded records disappear, cancelled records remain traceable, and counts/filters refresh.
- **Actual:** Both controllers only call `showToast('* action selected')`; they do not modify or persist records.
- **Root-cause hypothesis:** Action UI was implemented without a common state-transition contract.
- **Smallest fix:** Implement explicit allowed transitions in each local store and rerender after successful persistence.

### M1 — Employee IDs violate the required placement and format on current user cards

- **Severity:** Medium
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `js/components.js:156-165` (`.drawer-user-name`, `.drawer-id-badge`); `me.html:33-34` (`.me-title-group`); `me.html:57-66` (`.me-pass-info`, `.me-pass-footer`); `bonus-history.html:48-49` and `salary-history.html:48-49` (`.bonus-user-name`, `.bonus-user-role`).
- **Route / reproduction:** Open the Home shared drawer, Me, Bonus History, and Salary History.
- **Expected:** `#<empNo>` directly below the name in muted compact monospace text.
- **Actual:** Drawer shows `ID: PQ-8042` below a department badge; Me puts `EBB12` above the name and again in a remote footer; Bonus/Salary append `EBB12` to the role line. None of those active cards use the required `#` presentation directly below the name.
- **Root-cause hypothesis:** Each legacy card embeds identity differently and bypasses a shared employee-header component.
- **Smallest fix:** Introduce one employee-name/ID block and use it in drawer, Me card/header, Bonus, and Salary.

### M2 — Theme switches on query-themed pages revert after reload

- **Severity:** Medium
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `js/app.js:137-172` (`setTheme`); `js/app.js:180-195` (`initTheme`).
- **Route / reproduction:** Open `me.html?theme=dark` or `calendar.html?theme=dark`, switch to Light, reload.
- **Expected:** Reload keeps Light (or the URL is updated to `?theme=light`).
- **Actual:** Browser reproduction showed Light immediately and `peoplehcm_theme=light`, but reload returned to Dark because `initTheme()` always gives the stale query parameter priority.
- **Root-cause hypothesis:** In-place `setTheme()` changes storage and DOM but does not replace/remove the query parameter.
- **Smallest fix:** Update `theme` with `history.replaceState()` in `setTheme()`, or make persisted explicit user choice override an old query after initial navigation.

### M3 — EA year selection and “Open & Print” are presentation-only

- **Severity:** Medium
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `modules/payroll/options/ea-form.html:43-50` (`#eaFormPreview`, `.ea-open-print-action`); `modules/payroll/options/ea-form.html:80-103` (`renderEA`, `openAndPrintEA`).
- **Route / reproduction:** Payroll > EA; choose another year, then tap Open & Print.
- **Expected:** Selected-year EA content/asset changes and the action opens a real print preview or calls `window.print()`.
- **Actual:** `renderEA()` only updates the summary label; the image remains the same fixed JPEG. `openAndPrintEA()` only displays a success toast. The existing interaction artifact records `printCalled:false`, `openCalled:false`.
- **Root-cause hypothesis:** A filter shell was placed around one static preview asset and the final print action was stubbed.
- **Smallest fix:** Map each year to a document/rendered model and open a printable document window (or print the selected rendered EA view) before reporting success.

### M4 — Salary and Bonus export/audit controls report success without output

- **Severity:** Medium
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `bonus-history.html:37,140-141`; `salary-history.html:37,165-166`.
- **Route / reproduction:** Me > Bonus History or Salary History; tap audit menu, Export PDF, or Export Excel.
- **Expected:** Audit opens a record; exports create/download the selected file.
- **Actual:** Audit is an `alert`; export only shows “Generating …” toast and creates no Blob, download, print, or navigation.
- **Root-cause hypothesis:** Button affordances were completed before export/audit behavior.
- **Smallest fix:** Generate a CSV for Excel and printable PDF view/download for PDF; open a real audit sheet using the displayed record data.

### M5 — Project History and Payroll Tax Relief bypass the shared filter contract

- **Severity:** Medium
- **Status:** Fixed (2026-10-04).
- **Files / selectors:** `modules/project-task/options/history.html:72-77,132-137` (`[data-standard-filter-ready]`, headings); `css/project-task.css:1891-1894` (44px / 14px controls); `modules/payroll/options/tax-relief.html:103` (submit label); `js/payroll/team-tax-relief.js:139-145` (`summaryText`).
- **Route / reproduction:** Project & Task > History > Filter; Payroll > Team > Tax Relief > Filter and apply a date-only change.
- **Expected:** Shared Filter title/structure, 48px/16px controls, “Apply Filter”, and a summary derived from actual applied dates.
- **Actual:** Project pre-marks sheets ready so shared normalization skips them, while they retain “Filter History” and 44px/14px controls. Tax Relief uses “Search”; when no keyword/item/status exists its summary inserts the fixed `01 Jan–03 Oct 2026` irrespective of chosen dates.
- **Root-cause hypothesis:** Pages opt out of shared normalization and reconstruct summaries from partial filter state.
- **Smallest fix:** Remove the false ready marker and use shared classes; store start/end dates in `appliedFilters` and format those actual values; rename submit to Apply Filter.

## Remediation verification

| Finding | Fixed behavior | Verification |
|---|---|---|
| H1 | Sarah Jenkins / `#EBB01`, Senior Product Designer, and matching document ownership now agree across Home, drawer, Me, Payroll, Salary, Bonus, and EA. | Focused static identity and browser route checks passed. |
| H2 | Project decisions persist locally, remove handled cards from Pending, update counts, and work from card/detail actions. | Browser action reduced the queue by one and wrote `pq_project_pending_decisions`. |
| H3 | Project History retains all unique same-status records and loads the actual saved timesheet draft without fabricating a draft when storage is empty. | Browser fixture displayed two Submitted plans plus a real `pq_project_timesheet_draft`; the legacy History suite confirmed two default timesheets when no draft exists. |
| H4 | Every active Favourite catalog target resolves through `APP_ROUTES`. | Catalog-to-router static assertion passed with no missing targets. |
| H5 | Team uses maintained Home/App routes, purple approval styling, and persisted decision/removal behavior. | Browser action reduced the queue by one and wrote `pq_team_approval_decisions`; route/style checks also passed. |
| H6 | Calendar generates the selected month/year and uses the selected date in details. | October 2027 rendered 31 days; day 31 opened as Sunday, Oct 31, 2027. |
| H7 | Family edit loads the selected record; toggles/deletes enter the draft; submit persists and prepends history. | Browser edit/toggle/submit flow passed and wrote `pq_change_request_history`. |
| H8 | Payroll and Project History Submit/Cancel/Discard actions now change or remove records and rerender. | Browser checks changed a Payroll Submitted card to Cancelled and discarded the persisted Project timesheet draft. |
| M1 | Current-user employee cards place muted `#EBB01` directly under Sarah Jenkins. | DOM-order assertions passed for drawer, Me, Salary, and Bonus. |
| M2 | Changing theme updates the URL query before reload. | `me.html?theme=dark` stayed light after switch and reload. |
| M3 | EA updates visible selected-year metadata and invokes the browser print dialog. | Selected-year dataset/label and mocked `window.print()` checks passed. |
| M4 | Salary/Bonus Excel creates a CSV Blob/download; PDF calls print; audit opens a real dialog. | Both pages passed browser checks for Blob type, filename, print call, and audit dialog. |
| M5 | Pending Approval and Project History use Filter, reset icon, 48px/16px controls; Tax Relief uses Apply Filter and actual dates. | Static and computed-style browser assertions passed; shared normalizer preserves nested checkbox inputs. |

### Commands and compatibility checks

- `node scratch/test_payroll_project_me_consistency.cjs` ? PASS after the final changes.
- `node scratch/test_payroll_filter_visibility.cjs` with installed Chrome ? PASS across dark/light and 390/1280px.
- `node scratch/verify_pending_approval_filters.cjs` with installed Chrome - PASS across Claims, Attendance, Leave, and the maintained Payroll Pending Approval route; Payroll verified Filter title, reset icon, 48px/16px controls, tax/deduction filtering, counts, and date filtering.
- The same verifier scanned the remediated Payroll, Project, and Me formal routes and found no rendered mojibake markers; Tax Relief displayed the correct middle-dot and en-dash separators.
- `scratch/test_project_task_pending_approval.cjs` with installed Chrome ? PASS after aligning its modal geometry and close selector with the shared `detail-popout` contract: centered, 18px radius, standardized visible close control.
- `scratch/test_project_task_history_data.cjs` with installed Chrome ? PASS after aligning the overlay stack assertion with the shared `detail-popout` z-index of `1200`. This run exposed and verified the fix for a real phantom-draft regression caused by treating the array fallback as a stored draft object.
- The focused run launched installed Chrome headlessly and wrote no screenshots or production data files.

## Uncertain / excluded candidates and false positives

- **View Chart standard passes in this scope:** `modules/project-task/options/timesheet-highlight.html:40` uses `fa-solid fa-chart-pie` plus visible `View Chart`; `css/timesheet-highlight.css:20` is a nowrap horizontal pill. No confirmed active Payroll/Project View Chart violation was found.
- **Employee IDs pass on current Payroll/Project approval/history cards:** the relevant renderers add `#`, place IDs after names, and use muted compact styling. Standalone table columns such as Timesheet Highlight Emp#/Name are not employee cards and were not treated as violations.
- **Timesheet Highlight has table/chart only:** an older audit expected an additional trend/month analysis drill-down, but no binding product requirement in the current request defines that exact flow. It is therefore not counted.
- **Static sample data itself is not a defect:** only contradictory ownership, totals, filters, or state across linked views were counted.
- CDN font/icon availability and backend integration were not inferred. Failures above are local controller/state failures reproducible without a backend.

## Obsolete, duplicate, and alias entry points

These are excluded from severity counts unless a current router still targets them.

| Entry point | Classification | Evidence / implication |
|---|---|---|
| `index.html` | Valid alias | Redirects to `homelight.html` / `homedark.html`. |
| `app.html` | Valid alias | Redirects to `applight.html` / `appdark.html`. |
| `melight.html`, `medark.html` | Valid aliases | Redirect to `me.html?theme=...`; they expose the theme persistence issue in M2. |
| `light.html` | Obsolete implementation candidate | Not the current Home route; contains a missing `homedark-v2.html` link. Excluded. |
| `team-v2.html` | Unreferenced alternate Team | Current `APP_ROUTES.team` targets `team.html`. Excluded. |
| `me-accordion.html` | Unreferenced alternate Me | Current `APP_ROUTES.me` targets `me.html`. Its ID issues were not double-counted. |
| root `payslip.html` | Duplicate old Payslip | Current Payroll and router use `modules/payroll/options/payslip.html`. Excluded. |
| `modules/me/index.html` | Unwired duplicate Me hub | No current navigation reference; all six `options/*.html` targets are missing. Excluded rather than reported as active broken links. |
| `favourite.html` | Duplicate full-page Favourite | Current shared bottom nav opens `FavouriteSheet`; the full-page catalog diverges. Excluded from confirmed routing evidence so H4 covers only the active sheet. |
| `no/**` | Archived | Explicitly excluded. |

## Verification notes

- Current local Chromium reproduction used the installed Chrome executable and wrote no screenshots or data files.
- Static missing-reference scan over the scoped current/alternate HTML found the live `team.html` references to missing `home-v1.html` / `home-v2.html`; missing links only inside excluded legacy entries were not counted.
- The one binding View Chart implementation in current Project scope passed icon, text, and nowrap-pill checks.
