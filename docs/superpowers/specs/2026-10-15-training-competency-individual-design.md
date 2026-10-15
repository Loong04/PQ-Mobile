# Individual Competency Page Design

## Objective

Implement the Individual `Competency` quick option inside Training & Competency. The page presents the current employee's competency records as consistent purple-header cards and opens an accessible details popout for assessment history.

## Scope

- Add one destination page: `modules/training-competency/options/competency.html`.
- Convert only the Individual `Competency` quick option from coming-soon button to a theme-aware link.
- Keep the other thirteen Training & Competency quick options as coming-soon buttons.
- Do not add editing, filtering, charting, or backend persistence.

## Page Structure

### Header

- Reuse the Training & Competency purple module header.
- Page title: `Competency`.
- Back navigation returns to `../index.html?scope=individual&theme=<active-theme>`.

### Employee Summary

One rounded summary card appears above the competency list with these labels:

- Name
- Position
- Department
- Total Record

The sample employee remains consistent with existing Individual Performance examples:

- Name: Farhan Binti Rahmat
- Position: Group HR Manager
- Department: Human Resource
- Total Record: 2

No Employee ID is displayed because it was not requested.

### Competency Cards

Render two full-width clickable cards:

1. Effective Communication
2. Tunnel Engineering

Each card uses the same purple gradient header treatment and contains:

- Current Level
- Need Level
- Gap
- Last Assessment Date
- Skill Expiry Date
- Remarks

The card exposes dialog semantics through `aria-haspopup`, `aria-controls`, and an explicit accessible label. Enter and Space activate the card.

## Details Popout

Use the shared `detail-popout.css` presentation and overlay behavior.

The popout contains:

1. A primary details table in this order:
   - Skill
   - Name
   - Position
   - Department
2. An `Assessment` heading.
3. Exactly two assessment record tables for the selected skill. Each table contains:
   - Assessment Date
   - Level
   - Remark
   - Assessor

Close behavior supports the close button, backdrop click, and Escape. Closing restores focus to the competency card that opened the popout.

## Visual Consistency

- Use existing theme tokens, Plus Jakarta Sans, shared phone chrome, and purple module palette.
- Use 18px rounded cards, translucent theme surfaces, subtle borders, and existing shadows.
- Use a full purple gradient header for each competency card, consistent with established purple section headers.
- Keep card details in a two-column key-value grid with Remarks spanning the full width.
- Keep the page free of horizontal overflow at 360px and 420px in dark and light themes.

## Data Model

Create `training-competency-data.js` with:

- `employee`: name, position, department.
- `competencies[]`: id, skill, currentLevel, needLevel, gap, lastAssessmentDate, skillExpiryDate, remarks, assessments.
- `assessments[]`: assessmentDate, level, remark, assessor.

Dates are stored as ISO strings and formatted for display as `DD MMM YYYY`.

## Validation

The Puppeteer regression test must verify:

- The module contains one working Competency link and thirteen coming-soon buttons.
- The page summary labels, employee values, total count, and two competency cards are correct.
- Card headers use the purple gradient treatment.
- Card detail labels match the approved six-field contract.
- Clicking and keyboard activation open the correct details.
- The popout has one primary details table and exactly two assessment tables.
- Each assessment table uses the approved four labels.
- Close, Escape, backdrop, focus restoration, back navigation, themes, and responsive overflow work.

