# Staff Exit History Implementation Plan

**Goal:** Staff Exit History cards show employee name, ID, position, Notice Date, Last Paid Date, Reason and Approved/Submitted status, with a working filter.

**Scope:** Existing Team History page and shared styles. Keep employee IDs directly below names and preserve other categories' behavior.

**Decision:** Start Date and End Date filter Notice Date inclusively, since it is the request date displayed on the exit card. Keyword matches employee name, ID, position, reference or reason. Staff Exit and Staff Confirmation keep independent filter state.

**Data:** Convert the existing provisional exit records to explicit ISO date fields, preserving their employee names, IDs, dates and reasons. Use existing positions from the employee form data. The existing pending example is presented as Submitted.

## Tasks

- [x] Add a failing browser check for the requested cards and filter behavior.
- [x] Update Staff Exit preview data, rendering and statuses.
- [x] Add its keyword/date/status filter using the existing filter-sheet design.
- [x] Verify combined filters, inclusive dates, reset, invalid ranges, cancellation, independent tab state, empty counts and both themes/mobile sizes.
- [x] Run the existing Team History regression test and review the scoped change.
- [x] Make Staff Exit cards open a keyboard-accessible details popup with Reference #, Status, Emp #, Name, Position, Submit Date, Notice Date, Last Service Date, Replacement Deadline, Recommended Action, Is Blacklist, Exit Type, Reason, Remarks, HR Remarks and Attachment last.
- [x] Keep missing values empty of fabricated data, preserve source records, and distinguish Last Service Date from Last Paid Date.
- [x] Verify safe attachment links, close/focus behavior, scrolling and short phone screens; constrain the mobile phone frame to the space below the preview controls.

**Verification:** `test_staff_exit_history.cjs` passed light/dark at 360/420px; `test_employee_career_team_history.cjs` passed. JavaScript syntax and diff checks passed. Scoped read-only code review reported no findings.

**Details verification:** Both browser checks passed again after the popup change, with external font/icon requests blocked in the regression harness to remove network timing dependencies. The Staff Exit check covers all 16 rows, missing values, false blacklist status, source data preservation, safe attachment URLs, keyboard activation, focus restoration and reaching Attachment at 640px screen height. Fresh scoped code review reported no findings.
