# Repository Guidelines & Rules

## Employee ID Presentation Standard

- **Placement**: Whenever an Employee ID (`empNo` / `employee id`) is displayed on any employee card, list item, or user card across the app, it **MUST** be placed directly **BELOW** the employee's name.
- **Format**: It **MUST** be formatted with a leading `#` symbol (e.g. `#EBB01`, `#0000101`, `#004177`).
- **Styling**: It should be styled with muted, subtle typography (e.g. `font-size: 11.5px; font-weight: 700; color: var(--text-muted); opacity: 0.8; font-family: monospace, sans-serif; margin-bottom: 4px;`).

## "View Chart" Button Presentation Standard

- **Format**: Any "View Chart" button across summary, highlight, and costing cards **MUST NOT** be an icon-only square button. It **MUST** explicitly display both the chart icon and the text reading `View Chart` (e.g. `<i class="fa-solid fa-chart-pie"></i><span>View Chart</span>`).
- **Icon Consistency**: The icon **MUST** consistently use FontAwesome's pie chart icon (`fa-solid fa-chart-pie`).
- **Styling & Layout**: It **MUST** be styled as a single-line horizontal pill with `white-space: nowrap;` to prevent text wrapping or icon overflow. Do **NOT** assign fixed 36x36/38x38 square dimensions (e.g. `display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 13px; border-radius: 12px; background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; font-weight: 800; font-size: 12px; white-space: nowrap;`).

## Attendance Pending Approval Details Header Naming Standard

- **OT Plan Request**: When viewing details (`View Details`) of an OT Plan request in Pending Approvals, the modal header **MUST** be set to `OT Plan Approval`.
- **Attendance Feedback**: When viewing details (`View Details`) of an Attendance Feedback request in Pending Approvals, the modal header **MUST** be set to `Attendance Advice Approval`.
- **Final OT Request**: When viewing details (`View Details`) of a Final OT request in Pending Approvals, the modal header **MUST** be set to `Final OT Approval`.

## Summary & Detail Card Design Standard

- **Summary & Detail Card Layout**: Summary and detail cards across Attendance & Shift Planning (including Work Shift Summary, No Work Summary, OT Plan Summary, Leave Summary) **MUST** follow the **History Card** container style (`.history-card-item`, `border-radius: 18px`), but **MUST NOT** include the left date badge box (`.history-date-badge` with `SEP 23 2026`) since the date is already filtered at the top bar.
- **Card Structure Specification**:
  - **Container**: Translucent rounded card (`.history-card-item`, `border-radius: 18px`, translucent background with subtle border).
  - **Top Row**: Bold title text (`.history-time-row`, e.g. `0700:1500`, `8.30:17.30W`, `ANNUAL LEAVE`, `Rest / Off Day`) on the left, with the chevron right arrow (`<i class="fa-solid fa-chevron-right"></i>`) on the right.
  - **Detail Rows**: Key-value text rows aligned underneath (Headcount, Scheduled Hours, Work Hours, OT Type, Shift, etc.).






