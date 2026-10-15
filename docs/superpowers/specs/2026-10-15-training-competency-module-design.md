# Training & Competency Module Design

## Objective

Add a mobile-first `Training & Competency` module hub that matches the established PeopleHCM module dashboard pattern. This phase delivers only the hub and app navigation integration; it does not create any of the fourteen destination feature pages.

## Approved Direction

Use the Performance-style dashboard structure:

- Purple module header with a theme-aware back link.
- Accessible `Individual` and `Team` segmented tabs.
- `My Document Status` in Individual scope.
- Three-column `Quick Options` grids in both scopes.
- Dark and light theme support through the existing `theme` query parameter.
- Unimplemented options stay as buttons and show a coming-soon toast instead of navigating to placeholder pages.

## Information Architecture

### Individual

The Individual panel contains:

1. `My Document Status`
   - Submitted / In Review
   - Resubmit / Needs Action
   - Approved / Confirmed
   - Rejected / Declined
   - Counts display an em dash because no training data source exists in this phase.
2. `Quick Options`
   - Competency
   - Course Catalog
   - Training Need
   - L&D Plan
   - Training Plan
   - Training Calendar
   - Training Clocking
   - Training Feedback

### Team

The Team panel contains one `Quick Options` section:

- Staff Competency
- Competency Summary
- Skill Expiry
- Staff TNA
- Staff L&D Plan
- Training Highlight

`Training Calendar` uses the corrected spelling instead of the supplied `Training Calender` typo.

## Interaction Design

- The initial scope comes from `?scope=individual|team`; invalid or missing values fall back to Individual.
- Selecting a scope updates selected styles, ARIA state, panel visibility, focusability, and the URL through `history.replaceState`.
- Left/Right Arrow, Home, and End keys switch tabs and move focus.
- Back navigation resolves to `appdark.html` or `applight.html` from the active document theme.
- Each quick option opens no page in this phase. It shows `<Option Name> is coming soon` in the shared toast.
- Each document-status card shows `Training history is coming soon`.
- Theme changes update the back link without reloading.

## Visual Design

- Reuse the Performance dashboard proportions and existing design tokens.
- Use the standard purple gradient (`#4c1d95`, `#6d28d9`, `#7c3aed`) for the module header and selected tab.
- Keep quick options as compact three-column cards with a 38px purple icon tile and readable multi-line labels.
- Keep the dashboard within the existing 384px content width and prevent horizontal overflow at 360px and 420px widths.
- Preserve focus-visible outlines and disable transitions under `prefers-reduced-motion`.
- No employee cards, employee IDs, `View Chart` buttons, approval headers, or Attendance summary cards are introduced, so the corresponding repository presentation rules are not triggered.

## File Design

- `modules/training-competency/index.html`: semantic hub markup, tab panels, status cards, and all fourteen option buttons.
- `modules/training-competency/css/training-competency.css`: module-specific header, tabs, status cards, option grid, responsive, focus, and reduced-motion styles.
- `modules/training-competency/js/training-competency-app.js`: scope state, keyboard behavior, theme-aware back navigation, and toast actions.
- `appdark.html` and `applight.html`: replace the current coming-soon app row behavior with module navigation.
- `js/app.js`: map `learning_dev` to the new hub while preserving the active app theme.
- `scratch/test_training_competency_module.cjs`: browser-level contract for content, interactions, routing, themes, accessibility, and responsive overflow.

## Validation

The automated browser test must prove:

- Exactly eight Individual and six Team options render with the approved labels.
- No option uses an `href` or depends on a destination page.
- Individual is the safe default; Team deep links and scope switching work.
- Keyboard tab navigation and ARIA state remain synchronized.
- Status and option buttons display the expected toast copy.
- Back links and the home app rows preserve dark/light themes.
- Both scopes have no horizontal overflow at 360px and 420px.
- The page produces no JavaScript errors.

