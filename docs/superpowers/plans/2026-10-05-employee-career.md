# Employee & Career Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the standalone Employee & Career dashboard and its seventeen separate option pages, including UI-only Feedback and Whereabout forms.

**Architecture:** A config-driven dashboard renders both scopes and the Team View All sheet. Shared module CSS and JavaScript provide consistent navigation and form behavior, while every option remains a separate HTML route under its scope directory.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing PeopleHCM Web Components, FontAwesome, Puppeteer.

**Spec:** `docs/superpowers/specs/2026-10-05-employee-career-design.md`

## Global Constraints

- Do not modify unrelated dirty-worktree files.
- Every option must have a separate HTML file under Individual or Team.
- Team Quick Options shows five functional entries plus View All.
- Feedback and Whereabout are UI-only, have no required fields, and persist nothing.
- Preserve existing Employee ID, View Chart, approval naming, and summary-card repository standards where applicable.

## Review Focus

- Direct loading with an invalid scope falls back to Individual without a blank panel.
- Repeated View All open/close cycles do not leave focus or scroll locked.
- Option routes retain correct scope and work from local file URLs.
- Empty form submissions show success without native validation blocking.
- Small phone widths have no horizontal overflow or clipped actions.

---

### Task 1: Browser acceptance test

**Files:**
- Create: `scratch/test_employee_career_module.cjs`

**Interfaces:**
- Consumes: local HTML routes and public DOM behavior.
- Produces: one browser command that verifies the complete feature.

- [ ] Write assertions for routing, options, View All, files, form fields, interaction, themes, and widths.
- [ ] Run `node scratch/test_employee_career_module.cjs` and verify it fails because the module does not exist.

### Task 2: Dashboard and App routing

**Files:**
- Create: `modules/employee-career/index.html`
- Create: `modules/employee-career/css/employee-career.css`
- Create: `modules/employee-career/js/employee-career-config.js`
- Create: `modules/employee-career/js/employee-career-app.js`
- Modify: `js/app.js`
- Modify: `applight.html`
- Modify: `appdark.html`

**Interfaces:**
- Produces: `window.EMPLOYEE_CAREER_OPTIONS` and `window.EmployeeCareerApp` scope/dialog controls.

- [ ] Add config-driven Individual and Team option grids.
- [ ] Add Team five-plus-View-All rendering and accessible bottom sheet.
- [ ] Change both App page entries from Coming Soon to `navTo('employee_career')` and register the route.

### Task 3: Separate option files and forms

**Files:**
- Create: three files under `modules/employee-career/options/individual/`.
- Create: fourteen files under `modules/employee-career/options/team/`.
- Create: `modules/employee-career/js/employee-career-forms.js`.

**Interfaces:**
- Consumes: module CSS and shared components.
- Produces: standalone Feedback and Whereabout form behavior plus fifteen scope-correct Coming Soon routes.

- [ ] Create all seventeen independent HTML files.
- [ ] Implement the exact Feedback form fields, local attachment chips, Cancel, and UI-only Submit.
- [ ] Implement the exact Whereabout fields, Malaysian states, dependent project/task options, Cancel, and UI-only Submit.

### Task 4: Verification and review

**Files:**
- Test: `scratch/test_employee_career_module.cjs`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: evidence for the feature completion contract.

- [ ] Run the acceptance test and make it pass.
- [ ] Run App/module regression tests with the installed Chrome executable.
- [ ] Run `git diff --check` on all touched files.
- [ ] Review visible copy, keyboard behavior, theme rendering, and responsive screenshots.
