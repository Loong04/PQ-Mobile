# Attendance Late In Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a purple Late In Attendance card whose Feedback view alone includes Late In Minutes and a Late In Reason dropdown while preserving every existing Attendance flow.

**Architecture:** Reuse the existing exception-card markup and filter contract (`data-exception="late-in"`). Extend the backward-compatible `openFeedbackModal()` entry point with optional exception details, and explicitly reset its conditional fields on every open so state cannot leak to other records.

**Tech Stack:** Static HTML/CSS/JavaScript, Puppeteer, Node.js assertions

**Spec:** User request in the active conversation (2026-10-11)

## Global Constraints

- Keep Change Shift, Verify, Clock Times, existing Feedback fields, and actions unchanged.
- Show the two new fields only for the Late In record.
- Place the Late In fields below Time Amend Reason and above Remarks; Late In Reason is an editable dropdown.
- Give the Late In exception its own purple card treatment while other exception colors remain unchanged.
- Reuse existing Attendance card and form styling in light and dark themes.
- Preserve unrelated working-tree changes; do not commit from the shared dirty worktree.

## Review Focus

- Opening Late In after another record must populate both exception values.
- Opening a normal, Unapproved OT, or linked Feedback after Late In must hide and clear both values.
- Late In filtering must show only the new record and Reset must restore all records.
- Verify All must include the new record without changing Update-button behavior.
- The extra card and fields must not create horizontal overflow at supported mobile widths.

---

### Task 1: Lock the Late In behavior with a focused regression test

**Files:**
- Create: `scratch/test_attendance_late_in_feedback.cjs`
- Test: `scratch/test_attendance_late_in_feedback.cjs`

**Interfaces:**
- Consumes: Existing Attendance DOM and modal entry points.
- Produces: Assertions for the `late-in` card, conditional fields, filtering, responsive layout, and state reset.

- [ ] Write a Puppeteer test that exercises the real card buttons in light and dark themes.
- [ ] Run `node scratch/test_attendance_late_in_feedback.cjs` and confirm it fails because the Late In card is absent.

### Task 2: Add the record and conditional Feedback data

**Files:**
- Modify: `modules/attendance/options/attendance.html`
- Test: `scratch/test_attendance_late_in_feedback.cjs`

**Interfaces:**
- Consumes: `openFeedbackModal(dateStr, shiftStr, exceptionStr, exceptionDetails)` where the fourth argument is optional.
- Produces: One purple `data-exception="late-in"` record and `#feedbackLateInFields` containing readonly `#fbLateInMinutes` plus selectable `#fbLateInReason` controls.

- [ ] Add the dated Late In card with the existing exception theme, Verify, Change Shift, and Feedback actions.
- [ ] Add the hidden Late In field group before the existing Feedback Details fields.
- [ ] Extend `openFeedbackModal()` to clear, populate, and toggle the group without changing existing callers.
- [ ] Run the focused test and confirm it passes.

### Task 3: Reconcile and run the Attendance regression suite

**Files:**
- Modify: `scratch/test_attendance_individual_redesign.cjs`
- Test: `scratch/test_attendance_individual_redesign.cjs`
- Test: `scratch/test_attendance_update_position.cjs`
- Test: `scratch/test_attendance_period_tabs.cjs`
- Test: `scratch/test_shift_change_time_placement.cjs`

**Interfaces:**
- Consumes: The three-record Attendance DOM.
- Produces: Updated baseline expectations while ordinary Feedback still exposes only its original visible fields.

- [ ] Update only card-count, status, Verify All, filter, and visible-label assertions affected by the new record.
- [ ] Run the focused and existing Attendance tests and confirm every command exits successfully.
- [ ] Inspect the final diff for unrelated changes and verify the new conditional controls use existing design tokens.
