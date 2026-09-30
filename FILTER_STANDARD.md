# Filter standard

The Claim History filter is the canonical filter design for the whole app. Claims, Leave, Attendance, Payroll, Me, and every future module must use this pattern without changing the page-specific filter fields or filtering behaviour.

## Structure

1. A bottom sheet with a dimmed backdrop and a small drag handle.
2. Header contains only the title `Filter`, the `Reset` action, and a round close (`X`) button. Do not keep a page subtitle or helper text in this area.
3. Reset and close are aligned right, always in that order.
4. Purple field labels with one clear input or select below each label.
5. Inputs and selects use the shared input surface, 16px radius, 48px minimum height, and the same focus ring.
6. One full-width `Apply Filter` button at the bottom of the sheet.

## Content rules

- Keep only fields that the screen actually needs.
- Labels use sentence case (for example, `Search keyword`, `Start period`, and `Amount range (RM)`), never all-uppercase labels.
- Use the field name from the source form or history data.
- Date fields must use a date picker; time fields must use a time picker; selectable data must use a dropdown.
- Use `Benefit Type` where the screen filters benefit categories. Do not invent a different type label unless the source data genuinely has a different type.
- The Reset action restores the page’s existing default values.

## Implementation

- Use the existing Claim History classes (`claim-filter-sheet`, `claim-filter-panel`, and related field classes) when building a new claims filter.
- Legacy modal filters are normalized by `initStandardFilterSheets()` in `js/app.js`. Legacy inline accordion filters are moved into the same bottom sheet by `initInlineFilterSheet()`.
- Do not create an inline accordion, a page-specific filter card, or a new filter visual style in an individual page. A page may use a compact summary bar only as the trigger; the filter itself must open in the shared bottom sheet.
- Attendance pages use this same shared layer. Every Attendance filter must show the handle, `Filter`, `Reset`, close (`X`), its page-specific fields, and the full-width `Apply Filter` button.
