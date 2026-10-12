# History Detail Action Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mirror every visible business action from each formal History card into its detail pop-out and render every History detail action as the established purple pill.

**Architecture:** Each affected module will own a small action resolver and a single action executor used by both its card and detail renderers. A shared detail-footer CSS contract supplies the right-aligned purple presentation; the global detail normalizer will not infer business actions from labels or statuses.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js, Puppeteer, `node:assert/strict`, localStorage, IndexedDB.

**Spec:** `docs/superpowers/specs/2026-10-12-history-detail-action-parity-design.md`

## Global Constraints

- Apply this rule only to formal History flows named in the spec; do not expand it to Pending Approval, Book Resource current records, Individual Attendance, Staff Attendance, Hours Summary, or Prior Pay Data.
- A business action means a button inside a record card. Card-open affordances, checkboxes, filters, tabs, attachment links, and the header Close control are excluded.
- Preserve each module's current labels and business semantics, including Claims actions that currently provide feedback without mutating stored records.
- Detail actions use a right-aligned row with an `8px` gap, `8px 16px` padding, `20px` radius, `#7c3aed` to `#6d28d9` gradient, white bold `12px` text, purple shadow, pressed state, and focus ring.
- All detail business actions, including Cancel, use the purple treatment; the white circular header Close control stays unchanged.
- Preserve every existing uncommitted workspace change. Before each commit, inspect the task files and stage only the new task hunks; never overwrite or silently include unrelated work.
- Follow the Employee ID presentation standard from `AGENTS.md`; this project must not move or restyle existing employee IDs.

## Review Focus

- A record removed while its pop-out is open must close the stale pop-out, refresh the list, and never execute against a different record. Covered in Tasks 2, 7, and 8.
- A status transition while details remain open must recompute the footer immediately so draft-only actions cannot remain visible. Covered in Tasks 2, 3, 7, and 8.
- Clicking a card action must stop propagation and must not open the detail pop-out. Covered in every module case in Tasks 2–8.
- Rejected, cancelled, and otherwise action-free cards must not leave an empty visible footer in details. Covered in Tasks 2, 3, 6, 7, and 8.
- Attendance navigation actions must carry the same date, shift, employee, and origin parameters whether invoked from the card or the detail pop-out. Covered in Task 5.

---

### Task 1: Shared History Detail Action Contract and Test Harness

**Files:**
- Create: `scratch/test_history_detail_action_parity.cjs`
- Modify: `css/detail-popout.css:253-300`
- Modify: `scratch/test_history_card_cancel_purple.cjs`

**Interfaces:**
- Produces CSS class `.history-detail-actions` for a direct detail-panel footer.
- Produces CSS class `.history-detail-action` for buttons and action links inside that footer.
- Produces test CLI `node scratch/test_history_detail_action_parity.cjs --only=<style|workplace|leave|attendance-history|attendance-feedback|claims|payroll|project|no-actions> [--screenshots]`.
- Produces test helpers `actionLabels(page, selector)` and `assertPurpleActions(page, selector)` for later tasks.

- [ ] **Step 1: Write the failing shared-style test**

Create the Puppeteer harness, load `modules/admin/options/history.html`, inject a two-button `.history-detail-actions` footer into the existing detail panel, and assert right alignment, `8px` gap, `8px 16px` padding, `20px` radius, the exact purple gradient, white `12px/700` text, purple shadow, and no layout overflow at 360px and 420px in light and dark themes. Extend the static purple audit to reject the rose/red palette in `.history-detail-action`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scratch/test_history_detail_action_parity.cjs --only=style`

Expected: FAIL because `.history-detail-actions` and `.history-detail-action` do not exist yet.

- [ ] **Step 3: Implement the shared footer styles**

Add `.history-detail-actions`, `.history-detail-actions[hidden]`, `.history-detail-action`, hover/active/focus-visible, and disabled rules after the existing approval-grid rules in `css/detail-popout.css`. Keep `.detail-popout-actions` unchanged because Pending Approval is outside this feature.

- [ ] **Step 4: Run the focused tests**

Run: `node scratch/test_history_detail_action_parity.cjs --only=style`

Run: `node scratch/test_history_card_cancel_purple.cjs`

Expected: both PASS.

- [ ] **Step 5: Commit the shared contract**

Stage only the new harness and shared-style hunks, then commit with: `test(ui): define history detail action contract`.

### Task 2: Workplace History Action Parity

**Files:**
- Modify: `modules/admin/options/history.html:72-73`
- Modify: `modules/admin/js/workplace-history-ui.js:278-414`
- Modify: `scratch/test_history_detail_action_parity.cjs`
- Modify: `scratch/test_workplace_history.cjs`

**Interfaces:**
- Produces `historyActions(row) -> Array<{ key, label, className }>`.
- Produces `appendHistoryActions(container, row, context)`, where `context` is `'card'` or `'detail'`.
- Produces `executeHistoryAction(row, actionKey, source)`, where `source` is `'card'` or `'detail'`.
- Consumes `.history-detail-actions` and `.history-detail-action` from Task 1.

- [ ] **Step 1: Write failing Workplace parity tests**

Add cases for Guest Visit Draft (`Apply`, `Cancel`), Letter Request Approved (`Cancel`), and Inventory Submitted (`Cancel`). Assert card/detail label order, purple styling, action clicks not opening details, detail Apply transitioning to Submitted and recomputing to `Cancel`, detail Cancel transitioning to Cancelled and hiding the footer, and a stale record closing safely with the existing failure notice.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node scratch/test_history_detail_action_parity.cjs --only=workplace`

Expected: FAIL because `historyDetailsModal` has no action footer.

- [ ] **Step 3: Implement the shared Workplace action path**

Add `#historyDetailActions` as a direct footer child of `.history-detail-panel`. Replace the duplicated status ternary in `render()` with `historyActions(row)`, render both card and detail actions through `appendHistoryActions`, and route both surfaces through `executeHistoryAction`. When a detail action retains the record, refresh the table and footer from the stored record without reopening the modal; when the record is stale, close details, rerender, and expose the existing error notice.

- [ ] **Step 4: Run Workplace regression tests**

Run: `node scratch/test_history_detail_action_parity.cjs --only=workplace`

Run: `node scratch/test_workplace_history.cjs`

Expected: PASS with no page errors and unchanged Guest, Letter, and Inventory detail fields.

- [ ] **Step 5: Commit the Workplace implementation**

Stage only the Workplace and focused-test hunks, then commit with: `feat(workplace): mirror history actions in details`.

### Task 3: Leave History Footer and Purple Cancel

**Files:**
- Modify: `leave.html:9594-9630,9875-10010,12791-12820`
- Modify: `scratch/test_leave_history_detail_actions.cjs`
- Modify: `scratch/test_history_detail_action_parity.cjs`
- Modify: `scratch/test_history_card_cancel_purple.cjs`

**Interfaces:**
- Changes `buildHistoryActionsHTML(item, context = 'card')`, where `context` is `'card'` or `'detail'`.
- Continues to use `cancelHistoryItem(ref, newStatus)` as the single executor.
- Consumes the shared footer/button classes from Task 1.

- [ ] **Step 1: Update tests to the approved design and verify failure**

Change the Leave detail expectation from a centered red/pink Cancel to a right-aligned purple footer. Retain the existing assertions that Draft is `Apply`, `Cancel`, Submitted/Approved is `Cancel`, Time Off and terminal statuses have no actions, confirmation dismissal does not mutate status, duplicate clicks cannot schedule the same transition twice, and delayed mutations cannot replace a different open record.

Run: `node scratch/test_leave_history_detail_actions.cjs`

Expected: FAIL on alignment and Cancel styling.

- [ ] **Step 2: Implement the Leave detail footer**

Replace the boolean `centered` styling branch with the explicit `context`. Use the same action definitions and `cancelHistoryItem` handlers for both surfaces, give detail buttons the shared classes, and move `#historyDetailsActions` outside `.history-details-body` so it is a fixed direct footer below the scrollable table.

- [ ] **Step 3: Run Leave tests**

Run: `node scratch/test_leave_history_detail_actions.cjs`

Run: `node scratch/test_history_detail_action_parity.cjs --only=leave`

Run: `node scratch/test_history_card_cancel_purple.cjs`

Expected: all PASS in both themes and all tested mobile widths.

- [ ] **Step 4: Commit the Leave implementation**

Stage only the new Leave action/footer hunks and related test hunks, then commit with: `fix(leave): unify history detail actions`.

### Task 4: Existing Attendance History Actions Use the Purple Contract

**Files:**
- Modify: `modules/attendance/options/history.html:666-668,758-760,841-843`
- Modify: `css/attendance-history.css:397-464`
- Modify: `scratch/test_attendance_history_detail_actions.cjs`
- Modify: `scratch/test_history_detail_action_parity.cjs`

**Interfaces:**
- Applies `.history-detail-actions` to existing Clocking, OT Plan, and Attendance Feedback History action footers.
- Applies `.history-detail-action` to their existing Cancel and Submit buttons without changing handlers or disabled-state logic.

- [ ] **Step 1: Write the failing purple-action expectations**

Update the existing test so Clocking Cancel, OT Cancel/Submit, and Feedback Cancel/Submit all require the shared purple gradient, white text, pill radius, right alignment, and unchanged labels/handlers. Keep the existing disabled Submit assertions for read-only Attendance Feedback.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scratch/test_attendance_history_detail_actions.cjs`

Expected: FAIL because Cancel is currently rose or neutral and action rows are centered.

- [ ] **Step 3: Apply the shared classes and remove conflicting overrides**

Add the shared footer/button classes in the HTML and narrow `css/attendance-history.css` to form-specific sizing and disabled behavior only. Remove the red/neutral Cancel and centered-row overrides without changing `closeClockDetailsDirect`, `closeOtDetailsDirect`, `closeFeedbackDetailsDirect`, or submit behavior.

- [ ] **Step 4: Run Attendance History regressions**

Run: `node scratch/test_attendance_history_detail_actions.cjs`

Run: `node scratch/test_attendance_history_consistency.cjs`

Run: `node scratch/test_history_detail_action_parity.cjs --only=attendance-history`

Expected: all PASS and read-only Submit remains disabled.

- [ ] **Step 5: Commit the Attendance History styling**

Stage only the action-footer and test expectation hunks, then commit with: `fix(attendance): make history detail actions purple`.

### Task 5: Attendance Feedback History Action Parity

**Files:**
- Modify: `modules/attendance/options/feedback-history.html:51-143,257-356`
- Modify: `scratch/test_pending_attendance_feedback_cards.cjs`
- Modify: `scratch/test_history_detail_action_parity.cjs`

**Interfaces:**
- Produces `activeAttendanceDetailCard: HTMLElement | null`.
- Produces `runAttendanceHistoryAction(kind, card)`, where `kind` is `'shift'` or `'feedback'`.
- Continues to use `openSharedAttendanceForm(kind, card)` for navigation and query construction.

- [ ] **Step 1: Write failing Attendance Feedback parity tests**

Assert both source cards and the detail footer expose `Change Shift`, `Feedback` in the same order, both detail buttons use the purple contract, clicking a card action does not open details, and each detail action navigates with the same `feedbackFrom`/`shiftFrom`, date, shift, employee name, and employee number parameters as its card counterpart.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node scratch/test_history_detail_action_parity.cjs --only=attendance-feedback`

Expected: FAIL because `attendanceDetailsModalOverlay` has no footer actions.

- [ ] **Step 3: Implement the shared Attendance Feedback executor**

Add a two-button `.history-detail-actions` footer to the details panel, store the current source card in `openAttendanceDetails`, route card and detail buttons through `runAttendanceHistoryAction`, and close the details overlay before calling the existing navigation function. Clear the stored card when details close.

- [ ] **Step 4: Run Attendance Feedback regressions**

Run: `node scratch/test_history_detail_action_parity.cjs --only=attendance-feedback`

Run: `node scratch/test_pending_attendance_feedback_cards.cjs`

Run: `node scratch/test_pending_feedback_form_navigation.cjs`

Expected: all PASS with identical navigation context from both entry points.

- [ ] **Step 5: Commit the Attendance Feedback implementation**

Stage only the Feedback History and focused-test hunks, then commit with: `feat(attendance): mirror feedback history actions`.

### Task 6: Claims History Action Parity

**Files:**
- Modify: `modules/claims/options/history.html:905-1089,1131-1645`
- Modify: `scratch/test_history_detail_action_parity.cjs`

**Interfaces:**
- Produces `getClaimHistoryActions(item) -> Array<{ key, label, className }>`.
- Produces `renderClaimHistoryActions(item, context = 'card') -> string`.
- Continues to use `handleHistorySubmit(event, itemId)` and `handleHistoryCancel(event, itemId)` as the executors.

- [ ] **Step 1: Write failing Claims parity tests**

For all eight claim categories, assert each represented Draft card yields `Submit`, `Cancel`, each Submitted/Approved actionable card yields `Cancel`, and action-free statuses yield no visible detail footer. Stub `showToast`, click the modal actions, and assert the same existing message and no unintended record mutation. Assert source action clicks do not open details.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scratch/test_history_detail_action_parity.cjs --only=claims`

Expected: FAIL because the generated claim detail markup ends after the body.

- [ ] **Step 3: Implement one Claims action resolver and renderer**

Replace the inline `canCancel`/`actionHtml` branch with `getClaimHistoryActions` and `renderClaimHistoryActions`. Append the same renderer's detail-context footer after the generated body in `openClaimDetailsModal`; reuse the existing handlers and stop propagation. Do not introduce status mutations or change any of the eight detail-table branches.

- [ ] **Step 4: Run Claims regressions**

Run: `node scratch/test_history_detail_action_parity.cjs --only=claims`

Run: `node scratch/test_claim_history_filter_stability.cjs`

Run: `node scratch/test_detail_popout_consistency.cjs --only=1,2,3,4,5,6,7,8 --interactive`

Expected: all PASS; all original fields and attachment rows remain unchanged.

- [ ] **Step 5: Commit the Claims implementation**

Stage only the Claims action-rendering and focused-test hunks, then commit with: `feat(claims): mirror history actions in details`.

### Task 7: Payroll History Action Parity and Draft Continuation

**Files:**
- Modify: `modules/payroll/options/history.html:81-85`
- Modify: `js/payroll/payroll-history.js:38-187`
- Modify: `scratch/test_payroll_history.cjs`
- Modify: `scratch/test_history_detail_action_parity.cjs`

**Interfaces:**
- Produces `getHistoryActions(record) -> Array<{ key, label, className }>` inside the Payroll History closure.
- Produces `executeHistoryAction(recordKind, recordId, action, source)`.
- Produces `renderDetailActions(record)` and modal state `{ kind, id } | null`.
- Marks the existing `Continue editing` link with `data-history-detail-aux` so it is styled purple but excluded from card-action parity comparisons.

- [ ] **Step 1: Write failing Payroll parity and state tests**

Assert Submitted records expose `Cancel` on both surfaces; a saved Draft exposes `Submit`, `Cancel` on both surfaces plus the auxiliary `Continue editing` link in details. Test modal Submit recomputes the open footer to `Cancel`, modal Cancel transitions Submitted to Cancelled, modal draft discard closes details and removes the card, stale-detail execution closes safely, and all footer controls are purple.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node scratch/test_history_detail_action_parity.cjs --only=payroll`

Expected: FAIL because Payroll details currently contain only the table and optional plain continuation link.

- [ ] **Step 3: Decouple Payroll action execution from card DOM**

Replace `cardActions(record)` with descriptor-based rendering and move mutation logic out of `selectCardAction` into `executeHistoryAction`. Add a direct `#historyDetailActions` footer, track the open record by category and ID, refresh retained records in place, close before discard, revoke attachment URLs exactly once, and preserve the current toast strings and IndexedDB draft-loading behavior.

- [ ] **Step 4: Run Payroll regressions**

Run: `node scratch/test_history_detail_action_parity.cjs --only=payroll`

Run: `node scratch/test_payroll_history.cjs`

Run: `node scratch/test_detail_popout_consistency.cjs --only=32,34 --interactive`

Expected: all PASS with real saved attachments and category filters unchanged.

- [ ] **Step 5: Commit the Payroll implementation**

Stage only the Payroll action/footer and focused-test hunks, then commit with: `feat(payroll): mirror history actions in details`.

### Task 8: Project Task History Action Parity

**Files:**
- Modify: `modules/project-task/options/history.html:188-202`
- Modify: `js/project-task/project-task-history.js:456-743`
- Modify: `scratch/test_project_task_history_data.cjs`
- Modify: `scratch/test_history_detail_action_parity.cjs`

**Interfaces:**
- Produces `getProjectHistoryActions(record) -> Array<{ key, label, variant }>`.
- Produces `executeProjectHistoryAction(record, kind, action)` where `kind` is `'work-plan'` or `'timesheet'`.
- Produces `renderProjectDetailActions(record, kind)` and modal state `{ kind, id } | null`.
- Consumes the shared footer/button classes from Task 1.

- [ ] **Step 1: Write failing Work Plan and Timesheet parity tests**

Assert Draft is `Submit`, `Cancel`, Submitted is `Cancel`, and terminal records have no footer for both record types. Test Submit and Cancel recompute card/detail status, draft discard removes the record and closes details, the local timesheet draft updates/removes the correct localStorage keys, and card action clicks never open details.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node scratch/test_history_detail_action_parity.cjs --only=project`

Expected: FAIL because `projectHistoryDetailOverlay` has no action footer.

- [ ] **Step 3: Extract the Project action executor and render the footer**

Move the current `createCardAction` closure body into `executeProjectHistoryAction`, make both card and detail buttons consume `getProjectHistoryActions`, add `#projectHistoryDetailActions` after the scrollable detail content, and track the open record by kind and ID. Refresh retained records without resetting modal focus; close before a discarded record is removed.

- [ ] **Step 4: Run Project Task regressions**

Run: `node scratch/test_history_detail_action_parity.cjs --only=project`

Run: `node scratch/test_project_task_history_data.cjs`

Run: `node scratch/test_project_task_work_plan_history.cjs`

Run: `node scratch/test_detail_popout_consistency.cjs --only=38,39 --interactive`

Expected: all PASS with detail fields, filters, storage behavior, and modal focus unchanged.

- [ ] **Step 5: Commit the Project Task implementation**

Stage only the Project Task action/footer and focused-test hunks, then commit with: `feat(project-task): mirror history actions in details`.

### Task 9: Cross-Module Verification and Visual Review

**Files:**
- Modify: `scratch/test_history_detail_action_parity.cjs`
- Generate: `scratch/history-detail-action-parity/*.png`

**Interfaces:**
- Consumes all module action resolvers/executors and the shared visual contract from Tasks 1–8.
- Produces the final regression evidence and screenshots; no new product behavior.

- [ ] **Step 1: Run the full parity matrix**

Run: `node scratch/test_history_detail_action_parity.cjs`

Expected: PASS for all included modules, statuses, both themes, and mobile widths.

Run: `node scratch/test_history_detail_action_parity.cjs --only=no-actions`

Expected: PASS confirming Employee & Career History and action-free Attendance/Leave records did not gain artificial footer actions.

- [ ] **Step 2: Run the shared detail-presentation regression**

Run: `node scratch/test_detail_popout_consistency.cjs --interactive`

Expected: PASS with unchanged detail data, table structure, attachments, Close behavior, and Pending Approval actions.

- [ ] **Step 3: Run every focused module regression**

Run: `node scratch/test_workplace_history.cjs`

Run: `node scratch/test_leave_history_detail_actions.cjs`

Run: `node scratch/test_attendance_history_detail_actions.cjs`

Run: `node scratch/test_pending_attendance_feedback_cards.cjs`

Run: `node scratch/test_claim_history_filter_stability.cjs`

Run: `node scratch/test_payroll_history.cjs`

Run: `node scratch/test_project_task_history_data.cjs`

Expected: all PASS with no page errors.

- [ ] **Step 4: Capture and inspect the required visual evidence**

Run: `node scratch/test_history_detail_action_parity.cjs --screenshots`

Inspect Workplace Letter Request, Leave, Attendance Feedback, Payroll Draft, Claims Draft, and Project Task Draft at 360px and 420px in light and dark themes. Confirm purple buttons, right alignment, no clipping, no empty footer, and unchanged header/table presentation.

- [ ] **Step 5: Check the final diff and commit verification updates**

Run: `git diff --check`

Expected: no whitespace errors. Stage only verification-script fixes or generated evidence intentionally retained by the repository, then commit with: `test(ui): verify history detail action parity`.
