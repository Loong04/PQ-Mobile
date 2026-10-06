# Confirm New User Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Confirm New User placeholder with a modern, responsive 13-record review list whose Confirm and Reject controls are intentionally visual-only.

**Architecture:** Keep the page shell in the existing HTML, isolate all new visual rules in a page-specific stylesheet, and render a fixed record dataset through a focused vanilla-JavaScript module. A dedicated Puppeteer test owns the data, layout, theme, accessibility, and no-op interaction contract.

**Tech Stack:** Semantic HTML, vanilla CSS, vanilla JavaScript, existing web components, Font Awesome, Puppeteer, Node.js assertions.

**Spec:** `docs/superpowers/specs/2026-10-06-confirm-new-user-design.md`

## Global Constraints

- Preserve the existing Employee & Career header, phone shell, Team back link, theme handling, and bottom navigation.
- Render exactly 13 records with Name, NRIC/Passport #, Gender, Nationality, Qualification, Mobile #, and Email.
- Keep Confirm and Reject as `type="button"` controls with no data mutation, navigation, dialog, toast, or count change.
- Add no dependencies and do not modify shared Employee & Career styles for page-specific presentation.
- Do not commit unless the user explicitly requests a commit.

## Review Focus

- A long email or identity number must wrap inside its card without horizontal page overflow; Task 2 tests 360px, 390px, and 430px widths.
- Missing source values must render as `—` instead of blank content; Task 1 tests the Ernest Tan nationality fallback.
- Repeated Confirm and Reject clicks must leave all 13 records and the count unchanged; Task 2 tests both controls.
- Light and dark themes must retain readable text and recognizable button colors; Task 2 compares computed styles in both themes.
- Keyboard users must receive useful button names and visible focus treatment; Task 2 checks record-specific labels and focus outlines.

---

### Task 1: Page Structure and Record Rendering

**Files:**
- Modify: `modules/employee-career/options/team/confirm-new-user.html`
- Create: `modules/employee-career/js/confirm-new-user.js`
- Create: `scratch/test_confirm_new_user.cjs`

**Interfaces:**
- Produces: `window.confirmNewUserRecords` as the immutable 13-record source used by the renderer and test inspection.
- Produces: `renderConfirmNewUsers(records)` which replaces the contents of `#confirmNewUserList` and updates `#confirmNewUserTotal`.
- Produces: one `.confirm-new-user-card` article per record with `.confirm-new-user-confirm` and `.confirm-new-user-reject` buttons.

- [ ] **Step 1: Write the failing structure test**

Create `scratch/test_confirm_new_user.cjs` to load the page and assert:

- `#confirmNewUserTotal` reads `13`.
- Exactly 13 `.confirm-new-user-card` articles render.
- The first five names are `ERNEST TAN`, `TAN SIOW WEI`, `GAN THIAM POH`, `Edward S.S`, and `Jake Tan`.
- Every card exposes all seven labels and two `type="button"` controls.
- Ernest Tan’s missing nationality renders as `—`.
- The Team back link and `<phone-bottom-nav>` remain present.

- [ ] **Step 2: Run the structure test to verify it fails**

Run: `node scratch/test_confirm_new_user.cjs`

Expected: FAIL because the placeholder has no record total or review cards.

- [ ] **Step 3: Replace the placeholder with semantic list markup**

Update `confirm-new-user.html` to include:

- Existing page header and navigation.
- `<section class="confirm-new-user-summary">` containing `#confirmNewUserTotal`.
- `<section id="confirmNewUserList" class="confirm-new-user-list" aria-label="New users awaiting confirmation">`.
- Links to `../../css/confirm-new-user.css` and `../../js/confirm-new-user.js`.

- [ ] **Step 4: Implement the fixed dataset and renderer**

In `confirm-new-user.js`:

- Define 13 frozen records using keys `name`, `identity`, `gender`, `nationality`, `qualification`, `mobile`, and `email`.
- Preserve the first five supplied reference records exactly where the screenshot supplies a value.
- Add eight realistic records with the same schema.
- Implement `renderConfirmNewUsers(records)` with DOM APIs, `—` fallback values, decorative fallback avatars, and record-specific action labels.
- Call the renderer once on `DOMContentLoaded`.

- [ ] **Step 5: Run the structure test to verify it passes**

Run: `node scratch/test_confirm_new_user.cjs`

Expected: PASS for record count, field completeness, supplied names, fallback value, and shell navigation.

### Task 2: Responsive Visual System and No-Op Actions

**Files:**
- Create: `modules/employee-career/css/confirm-new-user.css`
- Modify: `scratch/test_confirm_new_user.cjs`

**Interfaces:**
- Consumes: `.confirm-new-user-card`, `.confirm-new-user-confirm`, `.confirm-new-user-reject`, `#confirmNewUserList`, and `#confirmNewUserTotal` from Task 1.
- Produces: isolated light/dark card, identity grid, avatar, and action-button styling.

- [ ] **Step 1: Extend the test with failing visual and interaction assertions**

For themes `light` and `dark` at widths 360, 390, and 430, assert:

- The page, list, and every card have no horizontal overflow.
- Name, identity number, mobile, and email values remain inside their card bounds.
- Cards use an 18px radius and have no chevron icon.
- Reject computes to pale rose/red styling; Confirm computes to purple/white styling.
- Every action button has a visible non-default focus outline when focused.
- Clicking the first Confirm and Reject buttons leaves the total at 13, preserves 13 cards, produces no overlay/toast, and does not navigate.
- `prefers-reduced-motion: reduce` removes action transition timing.

- [ ] **Step 2: Run the expanded test to verify it fails**

Run: `node scratch/test_confirm_new_user.cjs`

Expected: FAIL because page-specific styles and interaction-state guarantees are not implemented.

- [ ] **Step 3: Implement the isolated page stylesheet**

Create `confirm-new-user.css` with:

- A white/translucent total-record summary surface.
- One-column 18px review cards with restrained theme-aware borders and shadows.
- Rounded-square avatars, clear name/identity hierarchy, two-column metadata, and full-width email wrapping.
- Bottom-aligned action rows with pale rose Reject and purple Confirm pill buttons.
- Hover, active, focus-visible, disabled, and reduced-motion states.
- Responsive adjustments that preserve readability at 360px without shrinking body text below 11.5px.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node scratch/test_confirm_new_user.cjs`

Expected: PASS in both themes at all three widths, including no-op click behavior.

- [ ] **Step 5: Run Employee & Career regression checks**

Run: `node scratch/preview_employee_career_consistency.cjs`

Expected: PASS with the Team option still linking to Confirm New User and no shared module regressions.

- [ ] **Step 6: Run final static checks**

Run: `node --check modules/employee-career/js/confirm-new-user.js`

Run: `git diff --check`

Expected: JavaScript syntax passes and the diff has no whitespace errors.
