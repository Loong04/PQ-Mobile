# Training Expired Competencies Dashboard Implementation Plan

> **For agentic workers:** Execute inline with test-driven-development and verification-before-completion.

**Goal:** Add the reference's expired competency summary below Team Quick Options, with an employee drilldown and level filters.

**Architecture:** Add a dedicated demonstration data source approved by the user (9 expired records, 7 employees, 3 competencies). A pure model calculates date validity, overdue days, totals, groups, level counts and oldest-first ordering. A dashboard controller renders a summary and a detail view within the existing index page, using local links and query parameters for refresh/back/theme persistence.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Node tests, Puppeteer/Chrome.

**Spec:** User screenshots and explicit approval of First Aid/Forklift Operation/Electrical Safety demonstration data, 2026-10-16.

## Global Constraints

- Add the summary below Team Quick Options; preserve Individual content and all existing options.
- Show 9 expired records, 7 distinct employees, 3 competencies with counts 4/3/2.
- First Aid and Forklift Operation each affect 2 levels; Electrical Safety affects 1 level.
- On employee cards, place muted #employee IDs directly below names.
- Compute expiry strictly before the current local day; exclude today, invalid dates and future dates.
- Keep light/dark theme, keyboard operation, back navigation and mobile widths.

## Review Focus

- Summary/group/filter counts agree and changing a level never changes the unfiltered chip counts.
- Missing/invalid competency or level parameters show a usable state and back destination.
- An expiry on the current date is not overdue; day calculations are unaffected by DST.
- Theme changes retain the selected competency/level and update links.
- Individual/Team scope switching and calendar behavior remain intact.

### Task 1: Data and model

**Files:** Create js/training-expired-data.js, js/training-expired-model.js in modules/training-competency; test scratch/test_training_expired_model.cjs.

- [x] Watch model tests fail, implement summarize(definitions, records, today), run tests to green.
- [x] Add the user-approved demo source with 9 records and 7 employees.

### Task 2: Dashboard and detail views

**Files:** Modify index.html and js/training-competency-app.js; create css/training-expired.css and js/training-expired.js; test scratch/test_training_expired_dashboard.cjs.

- [x] Watch browser tests fail for missing summary.
- [x] Render summary, competency links, level chips, oldest-first employee cards and return links.
- [x] Verify URL refresh, browser back, dark/light themes, mobile layout, empty and invalid selections.

### Task 3: Verify and review

- [x] Run affected dashboard/calendar and existing competency regression scripts.
- [x] Inspect 360/420px screenshots in both themes, review code and fix confirmed issues.
- [x] Report completion with verification and demonstration-data scope.

## Verification

`node --test scratch/test_training_competency_module.cjs scratch/test_training_calendar.cjs scratch/test_skill_expiry.cjs scratch/test_training_expired_model.cjs scratch/test_training_expired_dashboard.cjs` — 7 passed, 0 failed after the final code changes.

Inspected summary and employee details at 360/420px in light/dark with live fonts/icons. Corrected dark-mode selected-level contrast. A live-assets browser test exposed an initial pageshow rerender replacing links during first interaction; the handler now refreshes only BFCache-restored pages, and the same test passes.

The standalone 9-record demonstration data is user-approved and does not change existing Skill Expiry, Staff Competency or assessment datasets. No commits or publishing requested.

Fresh code review completed with no remaining important findings; reviewer independently confirmed the focused model/dashboard tests pass after the pageshow fix.

## Return layout follow-up

User reported the header disappearing and navigation moving into the middle of the phone after returning. Reproduced a 432px scroll on the overflow-hidden outer phone caused by the return fragment/scrollIntoView. Return links now open the full Team dashboard without a fragment; legacy fragment links are normalized on document load and hash changes. Added `scratch/test_training_expired_return.cjs` checking outer scroll, header position and navigation alignment for mobile/desktop, both themes, refresh, history and legacy links. Final affected dashboard/calendar/model/return run: 7 passed, 0 failed.

## Approved popup refinement

User requested an in-place popup and Payroll Prior Pay Data/YTD card styling, without card arrows. Reuse the existing claim-summary-cards.css and detail-popout.css; summary and employee cards have purple headers and bordered contents. Keep the dashboard visible behind a modal, preserve its scroll, and retain level filtering inside the popup. Close with X, Escape or backdrop, restore focus, and keep background controls inert while open. Existing expiredSkill/expiredLevel links open the popup on initial load. No navigation or URL changes for regular popup interactions.

- [x] Watch the new popup browser test fail because opening navigates away.
- [x] Implement overlay, focus/inert lifecycle, button filters and shared cards.
- [x] Adapt prior detail/return tests to popup close behavior; inspect mobile dark/light screenshots.
- [x] Run affected regression scripts and complete review.

Popup verification: 8 tests passed across expired popup/dashboard/return/model, module dashboard and calendar scripts. Fresh reviewer independently confirmed the popup test passes and reported no important findings.
