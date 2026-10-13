# Staff Feedback Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a purple Review action to every Team Staff Feedback card and a consistent review form with locked feedback details plus editable reward, rating, and comments.

**Architecture:** Extend the existing Staff Feedback overlay system rather than introducing a new navigation route. Keep review changes in the page's current record objects, rerender the list after saving, and reuse the existing Pending/Responded presentation.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, Puppeteer browser assertions.

**Spec:** User-approved Staff Feedback review brief in the current session.

## Global Constraints

- Modify only the Team Staff Feedback page and its focused browser test.
- Keep Employee ID directly below the employee name and formatted with a leading `#`.
- Use the established purple Employee & Career visual language in light and dark themes.
- Review details are read-only; only Reward, Rating, and Comments are editable.
- Saving updates page-local data and changes the card state from Pending to Responded.

## Review Focus

- Clicking Review must not also open the existing details dialog.
- Keyboard activation on the nested Review button must not trigger the card dialog.
- Required validation must focus the first invalid editable control.
- Saved values must remain visible when reopening Review during the same page visit.
- The form must remain usable without horizontal overflow at 360px viewport width.

---

### Task 1: Staff Feedback review flow

**Files:**
- Modify: `scratch/test_employee_career_staff_feedback.cjs`
- Modify: `modules/employee-career/options/team/staff-feedback.html`
- Modify: `modules/employee-career/js/staff-feedback.js`
- Modify: `modules/employee-career/css/staff-feedback.css`

**Interfaces:**
- Consumes: existing Staff Feedback records, card renderer, overlay focus management, and status helpers.
- Produces: `.staff-feedback-review-button`, `showReview(record)`, review form controls, validation, and page-local saved review state.

- [x] **Step 1: Write the failing browser assertions**

Assert one purple single-line Review button per card, correct read-only values, exact Reward and Rating options, required-field validation, successful save, Pending-to-Responded transition, and value restoration on reopen.

- [x] **Step 2: Run the focused test to verify RED**

Run: `node scratch/test_employee_career_staff_feedback.cjs`

Expected: FAIL because `.staff-feedback-review-button` and `#staffFeedbackReviewOverlay` do not exist yet.

- [x] **Step 3: Implement the review UI and behavior**

Add the review overlay markup, card action rendering, `showReview(record)`, form validation/submission, event isolation, focus trapping including textareas, and responsive themed styles.

- [x] **Step 4: Run focused verification to verify GREEN**

Run: `node scratch/test_employee_career_staff_feedback.cjs`

Expected: both light and dark theme runs pass and screenshots are written without page errors or overflow.

- [x] **Step 5: Perform scoped static checks and visual review**

Run: `node --check modules/employee-career/js/staff-feedback.js`

Run: `git diff --check -- modules/employee-career/options/team/staff-feedback.html modules/employee-career/js/staff-feedback.js modules/employee-career/css/staff-feedback.css scratch/test_employee_career_staff_feedback.cjs`

Expected: both commands exit successfully; review screenshots show a consistent usable form at mobile width.
