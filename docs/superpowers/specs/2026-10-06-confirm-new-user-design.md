# Confirm New User — Design Specification

## Overview

Replace the current Employee & Career → Team → Confirm New User placeholder with a complete mobile review list based on the supplied legacy screen. The redesign keeps every source field visible while improving hierarchy, spacing, readability, and light/dark consistency.

## Goals

- Show `Total 13 Records` above the list.
- Render 13 pending-user cards using the source fields: Name, NRIC/Passport #, Gender, Nationality, Qualification, Mobile #, and Email.
- Preserve the first five visible reference records and add eight realistic sample records with the same schema.
- Make long names, identity numbers, and email addresses readable at 360px, 390px, and 430px phone widths.
- Use the existing Employee & Career header, theme system, phone shell, and bottom navigation.
- Provide modern Confirm and Reject buttons that match the app’s visual language.

## Non-Goals

- No search, filters, pagination, detail page, or expandable cards.
- No backend calls, local persistence, confirmation dialogs, record removal, counter updates, alerts, or toast messages.
- Confirm and Reject are visual `type="button"` controls only; pressing them produces only the normal pressed-state animation.

## Page Structure

1. Existing purple Employee & Career header with `Confirm New User` and `Team`.
2. White/translucent summary card showing `Total 13 Records`.
3. Vertically scrolling review-card list.
4. Existing bottom navigation.

## Review Card

- Use an `<article>` for each pending user.
- Top identity row:
  - Rounded-square avatar or neutral fallback avatar.
  - Name as the primary heading.
  - NRIC/Passport directly below the name as secondary identity text.
- Information grid:
  - Gender
  - Nationality
  - Qualification
  - Mobile #
  - Email spanning the full card width when needed.
- Action row pinned to the bottom of the card:
  - `Reject`: pale rose background, red text and border.
  - `Confirm`: purple filled button with white text.
- Cards use a restrained translucent surface, 18px outer radius, subtle themed border/shadow, and no chevrons.

## Data

The first five records reproduce the supplied reference data:

1. ERNEST TAN
2. TAN SIOW WEI
3. GAN THIAM POH
4. Edward S.S
5. Jake Tan

Eight additional realistic records complete the stated total of 13. Every record contains all seven source fields. Missing values display `—`; no additional fields are invented in the interface.

## Responsive and Theme Behavior

- One card per row at all supported phone widths.
- Identity values use tabular figures where appropriate.
- Long values wrap without horizontal scrolling or clipping.
- Light mode uses clean white cards and cool-gray text.
- Dark mode uses the existing deep navy surfaces and muted borders.
- Button colors remain recognizable and accessible in both themes.

## Accessibility

- Use semantic headings, articles, and buttons.
- Every avatar has a useful accessible label or is decorative when the adjacent name is sufficient.
- Confirm and Reject include record-specific `aria-label` text.
- Buttons provide keyboard focus, hover, and pressed states.
- Reduced-motion preferences disable nonessential transitions.

## Files

- Update `modules/employee-career/options/team/confirm-new-user.html` with the page structure.
- Add `modules/employee-career/css/confirm-new-user.css` for isolated styling.
- Add `modules/employee-career/js/confirm-new-user.js` for rendering the fixed 13-record dataset only.

## Verification

- Add a focused Puppeteer test covering both themes and 360px, 390px, and 430px widths.
- Assert 13 cards, complete field labels, readable wrapping, correct button colors, no overflow, and no record/count changes after button clicks.
- Confirm the Team back link and bottom navigation remain available.
