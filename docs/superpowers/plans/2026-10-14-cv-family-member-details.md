# CV Family Member Details Implementation Plan

**Goal:** Family members in CV History and Pending Approval open a read-only detail popout.

**Design:** Reuse the shared family renderer and the existing detail table presentation. A native modal dialog sits above the existing CV dialog and closes independently. Member data stays unchanged; absent values display an em dash. Attachment appears last.

**Files:**
- Shared renderer: `modules/employee-career/js/employee-career-cv-history-details.js`
- New popout: `modules/employee-career/js/employee-career-cv-family-details.js`
- Styling: `modules/employee-career/css/cv-family-table.css`
- Integrations: both History and Pending Approval HTML and JavaScript controllers.
- Verification: `scratch/test_cv_family_member_details.cjs` and existing CV tests.

## Requirements

- Click either the name or its row; names are keyboard accessible buttons.
- Show Name, Relation, Birth Date, Status, Rank, New NRIC, Birth Cert, Tax Status, Member Employee#, Beneficiary, Allocation%, Attachment, in that order.
- Keep zero and false values, escape text, and retain member-specific attachment names.
- Existing and deleted members open the corresponding record.
- Escape, Close and backdrop dismiss only the member popout, restore focus and preserve the parent CV view.
- Use both themes and fit small phone screens with independently scrollable details.

## Execution

- [x] Run a failing browser test for the requested flow.
- [x] Implement member details and shared row actions.
- [x] Integrate both entry points and style the popout.
- [x] Verify populated/missing values, last attachment row, member switching, dismissal, focus, phone layout and unchanged source data.
- [x] Run existing CV History and Pending Approval regressions.

## Verification

- `test_cv_family_member_details.cjs`: History and Pending Approval, both themes; correct member data, zero/false values, attachments last, empty values, row/keyboard activation, Escape/Close/backdrop, parent preservation and restored focus.
- `test_employee_career_pending_approval.cjs`: both themes at 360/420px.
- `test_employee_career_cv_history_reference.cjs`: History fields, filters, tabs, keyboard access and mobile layout.
- `test_cv_history_layout_and_qualifications.cjs`: grouped layout, changed-value styling and qualifications.
- JavaScript syntax and diff whitespace checks passed.
- Fresh-context code review reported no findings; reviewer browser rerun was sandbox-blocked, with the browser verification above run successfully by the implementer.
