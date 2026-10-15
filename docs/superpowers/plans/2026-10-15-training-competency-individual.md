# Individual Competency Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Individual Competency list and assessment detail popout, then connect it from the Training & Competency hub.

**Architecture:** A static data file supplies employee, competency, and assessment records. A focused page script renders summary data, purple-header cards, and shared detail-popout tables while managing theme-aware navigation and accessible overlay state.

**Tech Stack:** HTML5, CSS custom properties, vanilla JavaScript, Font Awesome 6.4, Node.js assertions, Puppeteer

**Spec:** `docs/superpowers/specs/2026-10-15-training-competency-individual-design.md`

## Global Constraints

- Implement only the Individual Competency destination page.
- Keep the other thirteen quick options as coming-soon buttons.
- Render exactly two competency cards and two assessment tables per selected skill.
- Preserve dark/light theme and Individual scope navigation.
- Do not add dependencies or make git commits.

## Review Focus

- Competency link theme propagation and back navigation.
- Exact employee summary and total record consistency.
- Purple card headers and six-field card bodies at 360px.
- Correct selected skill and two-record assessment history in the popout.
- Keyboard activation, Escape/backdrop close, inert state, and focus restoration.

---

### Task 1: Failing Contracts

**Files:**
- Modify: `scratch/test_training_competency_module.cjs`
- Create: `scratch/test_training_competency_individual.cjs`

- [ ] Update the module contract for one implemented option page.
- [ ] Add the Individual Competency page and popout browser contract.
- [ ] Run both tests and confirm they fail because the page and link do not exist.

### Task 2: Page and Data

**Files:**
- Create: `modules/training-competency/options/competency.html`
- Create: `modules/training-competency/css/competency.css`
- Create: `modules/training-competency/js/training-competency-data.js`
- Create: `modules/training-competency/js/competency.js`

- [ ] Add semantic page, summary, list, and detail-popout markup.
- [ ] Add two competency records with two assessments each.
- [ ] Render the summary, purple-header cards, and detail tables.
- [ ] Implement theme navigation and accessible overlay behavior.
- [ ] Add responsive dark/light styling.

### Task 3: Hub Integration

**Files:**
- Modify: `modules/training-competency/index.html`
- Modify: `modules/training-competency/js/training-competency-app.js`

- [ ] Convert Competency to an anchor with a theme-aware URL.
- [ ] Restrict coming-soon listeners to remaining option buttons.

### Task 4: Verification

**Files:**
- Test: `scratch/test_training_competency_module.cjs`
- Test: `scratch/test_training_competency_individual.cjs`

- [ ] Run both focused browser tests.
- [ ] Run JavaScript syntax and `git diff --check` validation.
- [ ] Confirm only the approved Competency destination page exists.
