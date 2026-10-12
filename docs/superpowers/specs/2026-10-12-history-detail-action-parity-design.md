# History Detail Action Parity Design

**Date:** 2026-10-12  
**Status:** Approved conversational design, pending written-spec review

## Goal

Every formal History screen must keep the record card and its detail pop-out consistent. When a history card displays business action buttons, opening that card's detail pop-out must show the same actions in the same order, with the same visibility rules and behavior. Detail action buttons use the established purple History button treatment.

The result is successful when a user can take every visible card action from either the card or its detail pop-out without the two surfaces drifting apart.

## Scope

### Included History flows

- Workplace History: Guest Visit, Letter Request, and Inventory Request.
- Claims History: Benefit, Medical, OT, Mileage, Travel Request, Entertainment, Advance, and Expense.
- Leave History: My Leave and Leave Credit. Time Off remains action-free because its cards have no actions.
- Attendance Feedback History: `Change Shift` and `Feedback` actions.
- Payroll History: Tax Relief and Deduction Request.
- Project Task History: Work Plan and Timesheet.
- Employee & Career History and the main Attendance History are included in the audit, but receive no new footer actions because their source cards do not have business action buttons.

### Excluded flows

- Pending Approval screens, which already use their own approval action model.
- Non-History record lists such as Book Resource current records, Individual Attendance, Staff Attendance, Hours Summary, and Prior Pay Data.
- Page filters, tabs, card-open affordances, checkboxes, attachment links, and the detail header Close button. These are not record-card business action buttons.
- Changes to the underlying business meaning of existing actions. For example, Claims actions currently show feedback without mutating stored data; this project preserves that behavior rather than inventing a new workflow.

## User Experience

### Action parity

For each included record, the card and detail pop-out derive their actions from the same module-level action definition.

- Draft records may expose `Apply` or `Submit` plus `Cancel`, according to the module's existing labels.
- Submitted or approved records expose `Cancel` only when their cards already do.
- Attendance Feedback History details expose `Change Shift` and `Feedback` when the source card does.
- Records whose cards have no actions do not gain artificial detail actions.
- Existing detail-only controls required to use the detail content, such as attachment links or Payroll's draft continuation link, remain available. If rendered as a footer button, they use the same purple treatment.

The detail footer preserves the card's button order. It is hidden entirely when there are no actions.

### Visual treatment

Detail business actions use the existing History card purple pill style:

- right-aligned horizontal group;
- `8px` gap;
- `8px 16px` button padding;
- `20px` pill radius;
- purple `#7c3aed` to `#6d28d9` gradient;
- white, bold `12px` text;
- existing purple shadow, pressed state, and focus ring.

All action meanings, including `Cancel`, use this purple treatment as requested. The white circular Close control in the purple modal header is unchanged. The detail table and existing light/dark surfaces are unchanged.

## Architecture

Each affected module owns its business rules. A module provides two reusable pieces:

1. An action resolver that returns the actions visible for the current record and status.
2. An action executor that performs the module's existing behavior for a record and action key.

Both the history card renderer and detail pop-out renderer consume the same resolver. Both card and pop-out clicks call the same executor. This prevents duplicated status checks and prevents a detail action from becoming behaviorally different from the card action.

Shared CSS supplies the detail-footer layout and reuses the established `.history-submit-btn` / `.history-cancel-btn` visual language. `js/detail-popout.js` continues to normalize the common detail shell, but it does not guess actions from status text because action semantics differ by module.

### Module adaptations

- **Workplace:** extract the current status-to-action mapping and status mutation from delegated card handling, then render it in `historyDetailsModal`.
- **Claims:** use one action resolver for all eight claim categories and call the existing Submit/Cancel handlers from both surfaces.
- **Leave:** keep the existing shared action builder and handler; remove the detail-only red Cancel override so it matches the purple card button.
- **Attendance Feedback History:** render the existing `Change Shift` and `Feedback` actions beneath the details table. Invoking one closes the detail overlay before opening the corresponding existing form.
- **Payroll:** separate action execution from `closest('.history-card-item')` lookup so the modal can execute actions by record identity. Preserve local-draft cleanup and status transitions.
- **Project Task:** extract the inline closure's action execution so Work Plan and Timesheet card and modal buttons share it, including local draft removal.

## Interaction and State Flow

1. The user opens a record's detail pop-out.
2. The module resolves the record's current action list and renders the detail footer.
3. The user selects an action.
4. The module invokes the same executor used by the source card.
5. For actions that retain the record, the list and open detail state are refreshed from the updated record.
6. For actions that discard or remove the record, the detail pop-out closes before the list is refreshed.
7. For actions that open another workflow, such as `Change Shift` or `Feedback`, the detail pop-out closes and the existing workflow opens with the same record context.
8. Existing success/error feedback remains authoritative; no duplicate toast is added by the modal layer.

Actions are resolved again after every state change, so a submitted record cannot continue to display draft-only actions in an already-open pop-out.

## Error Handling and Accessibility

- If a record no longer exists when an action is invoked, close the stale detail pop-out, refresh the list, and show the module's existing error/toast mechanism where available.
- Prevent duplicate execution while an action is in progress.
- Use `type="button"` for non-submit actions.
- Preserve keyboard activation, visible focus states, modal focus containment, Escape/backdrop close behavior, and focus return to a surviving source card or the history list.
- Do not make the header Close button purple or include it in action-parity comparisons.

## Verification

Automated coverage will verify:

- action label and order parity between each source card and its detail pop-out for every represented status;
- absence of a detail footer when the source card has no business actions;
- the same status transition, navigation, removal, storage update, and toast behavior from card and modal entry points;
- purple computed styling for all detail footer action buttons in light and dark themes;
- destructive/discard actions safely close stale details;
- existing detail table fields, attachment links, Close behavior, and Pending Approval actions remain unchanged.

Targeted browser screenshots at mobile widths will cover at least Workplace Letter Request, Leave, Attendance Feedback History, Payroll Draft, Claims Draft, and Project Task Draft in both themes.

## Acceptance Criteria

- Every included history card button has an equivalent button in its detail pop-out.
- Card and detail buttons share one action definition and one execution path per module.
- Labels, order, availability, and outcomes match the source card.
- All detail business action buttons use the established purple History pill style.
- Details with no source-card business actions remain action-free.
- Existing record data, modal presentation, and unrelated modules do not regress.
