# Training & Competency Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and connect the Training & Competency module hub with Individual and Team quick options, without creating destination feature pages.

**Architecture:** Follow the existing Performance hub pattern with isolated HTML, CSS, and JavaScript files. The app launcher delegates to the existing `navTo('learning_dev')` route, while the module manages scope and theme in query parameters and keeps all fourteen options as coming-soon buttons.

**Tech Stack:** HTML5, CSS custom properties, vanilla JavaScript, Font Awesome 6.4, Node.js assertions, Puppeteer

**Spec:** `docs/superpowers/specs/2026-10-15-training-competency-module-design.md`

## Global Constraints

- Deliver only the module hub; do not create fourteen destination pages.
- Render exactly eight Individual and six Team quick options with the spec's copy.
- Use `Training Calendar`, not `Training Calender`.
- Preserve `theme=dark|light` and `scope=individual|team` query state.
- Follow existing PeopleHCM design tokens and mobile proportions.
- Do not add dependencies or make git commits.

## Review Focus

- Missing or invalid scope must safely show Individual without contradictory ARIA state.
- Direct Team links must render Team immediately and preserve the chosen theme.
- Keyboard scope changes must update focus, panels, and URL together.
- Every quick option must remain non-navigating and show option-specific toast copy.
- 360px layouts must keep three option columns without horizontal overflow.

---

### Task 1: Browser Contract

**Files:**
- Create: `scratch/test_training_competency_module.cjs`
- Test: `scratch/test_training_competency_module.cjs`

**Interfaces:**
- Consumes: app HTML files, `navTo`, and the planned module DOM contract.
- Produces: one executable Puppeteer regression test for the full hub.

- [ ] **Step 1: Write the failing module test**

Assert the module file loads, contains the approved 8/6 labels, has no option links, defaults invalid scope to Individual, supports mouse and keyboard scope switching, emits status/option toasts, preserves both themes, keeps the app launcher route working, and avoids overflow at 360px and 420px.

- [ ] **Step 2: Run test to verify RED**

Run: `node scratch/test_training_competency_module.cjs`

Expected: FAIL because `modules/training-competency/index.html` does not exist.

### Task 2: Module Hub

**Files:**
- Create: `modules/training-competency/index.html`
- Create: `modules/training-competency/css/training-competency.css`
- Create: `modules/training-competency/js/training-competency-app.js`
- Test: `scratch/test_training_competency_module.cjs`

**Interfaces:**
- Consumes: shared `theme.css`, `app.css`, `components.js`, `app.js`, `showToast`, and URL query parameters.
- Produces: tab IDs `trainingCompetencyTabIndividual` / `trainingCompetencyTabTeam`, panel IDs `trainingCompetencyIndividualPanel` / `trainingCompetencyTeamPanel`, `data-option-id` buttons, and `setScope(scope, updateUrl)` behavior.

- [ ] **Step 1: Add semantic page markup**

Create the module header, accessible tablist, Individual status grid, 8-option Individual grid, 6-option Team grid, toast region, shared app chrome, and no destination anchors.

- [ ] **Step 2: Add module styling**

Implement the approved purple header, selected tab, status card colors, three-column option cards, focus-visible state, and reduced-motion override with existing CSS variables.

- [ ] **Step 3: Add module behavior**

Implement scope parsing, URL updates, ARIA/tabindex/panel synchronization, tab keyboard controls, theme-aware back link, option-specific coming-soon toasts, and the training-history toast.

- [ ] **Step 4: Run test toward GREEN**

Run: `node scratch/test_training_competency_module.cjs`

Expected: launcher integration assertions remain failing while module-level assertions pass.

### Task 3: App Integration

**Files:**
- Modify: `appdark.html`
- Modify: `applight.html`
- Modify: `js/app.js`
- Test: `scratch/test_training_competency_module.cjs`

**Interfaces:**
- Consumes: existing `navTo(name)` dispatch and app row interaction pattern.
- Produces: `learning_dev` navigation to `modules/training-competency/index.html?scope=individual&theme=<active-theme>`.

- [ ] **Step 1: Connect both app rows**

Replace the Training & Competency coming-soon handlers in both launchers with `navTo('learning_dev')` while retaining keyboard activation.

- [ ] **Step 2: Implement the route**

Change the `learning_dev` route from its placeholder hash to a theme-aware module URL.

- [ ] **Step 3: Run test to verify GREEN**

Run: `node scratch/test_training_competency_module.cjs`

Expected: PASS with all module, routing, theme, accessibility, and responsive assertions.

### Task 4: Final Consistency Check

**Files:**
- Verify: `modules/training-competency/index.html`
- Verify: `modules/training-competency/css/training-competency.css`
- Verify: `modules/training-competency/js/training-competency-app.js`
- Verify: `appdark.html`
- Verify: `applight.html`
- Verify: `js/app.js`

**Interfaces:**
- Consumes: completed implementation and test output.
- Produces: verified final diff with no accidental feature pages or unrelated changes.

- [ ] **Step 1: Inspect the focused diff**

Run: `git diff --check` and `git diff -- modules/training-competency appdark.html applight.html js/app.js scratch/test_training_competency_module.cjs`

Expected: no whitespace errors and only the planned files/behaviors.

- [ ] **Step 2: Re-run the regression test**

Run: `node scratch/test_training_competency_module.cjs`

Expected: PASS with no browser errors.
