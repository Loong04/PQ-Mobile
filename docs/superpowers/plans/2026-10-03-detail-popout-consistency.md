# Detail pop-out consistency implementation plan

**Goal:** Apply the approved Leave Detail presentation to all 46 audited detail entries without changing their fixed information or business actions.

**Approved design:** The user's 2026-10-03 instructions and Leave Detail screenshot: centered pop-out, shared purple header, width, rounded surface/opacity, field table and scroll treatment. Attachments last. Approval actions stay in a footer; three-action flows retain three actions. Existing data and handlers must not be rewritten.

**Architecture:** A dedicated shared stylesheet and a small presentation adapter identify the audited modal containers and annotate their existing DOM. Attachment rows are reordered only within their original tab/section table or field container; no attachment tables or shared bottom sections are created. Existing open/close and decision handlers remain authoritative. Page integration is explicit; non-detail sheets are outside scope.

**Files:** `css/detail-popout.css`, `js/detail-popout.js`, shared loader `js/components.js`, `scratch/test_detail_popout_consistency.cjs`; baseline and screenshot artifacts under `scratch/detail-popout-verification/`.

## Constraints

- Preserve every existing field value, input value, attachment destination, record identifier and action handler.
- Keep Upload Files and Attachments at the end of their own original tab/table, preserving ownership, table count and original DOM nodes. Never combine attachments from separate sections at the bottom of the modal.
- Do not approve/reject/resubmit any real records during visual verification.
- Only audited details get the new presentation; filters, workflow sheets and forms retain their current behavior.
- Preserve hidden/visible state, accessible labels, focus restoration and modal dismissal behavior.
- Use 380px maximum panel width with equal insets on narrow phones; body scrolls while header/footer stay visible.
- Share light/dark surface tokens across modules and use the same header gradient in both themes.
- Do not invent an unsupported decision action to make a button count match a visual rule. The user explicitly confirmed Payroll deduction keeps its original Approve/Reject pair, with presentation changes only.

## Work

- [x] Capture data, actions and styles for 46 entries before implementation, in both themes.
- [x] Add behavioral regression checks for data preservation, centered geometry, uniform theme styles, scroll containment and attachment placement; observe the presentation checks fail before implementation.
- [x] Implement shared scoped CSS and presentation adapter; keep original nodes/handlers.
- [x] Load shared assets through components.js; annotate only the audited detail containers.
- [x] Verify all 46 entries in both themes, and 320px/360px phones; verify close/reopen, keyboard dismissal, live category changes and unrelated sheets.
- [x] Review changes, run relevant existing module checks, and publish a fresh screenshot comparison gallery.

## Initial design verification evidence

- Before-change baseline: 92/92 captures; initial shared-presentation checks failed as expected.
- Complete dark/light checks plus unadapted visible-field comparison, close/reopen and Cancel preservation: 92/92 passed.
- Final 320px/360px dark/light checks: 184/184 passed, including surfaces, input styles, footer spacing, geometry and unchanged data.
- Keyboard and repeated-open checks for Payroll/Project details: 18/18 passed.
- Final targeted attachment rerender/no-attachment checks: 8/8 passed.
- Existing Work Plan History and Payroll History regression scripts passed; Payroll verifies saved attachment file contents and modal focus.
- Independent read-only review found an attachment accumulation defect on repeated opens. Fixed by tracking original source-field nodes and clearing stale moved attachment groups. Reviewer verified repeated opens and Leave → Credit → Team transitions; no remaining findings.
- Screenshot gallery: `scratch/detail-popout-verification/gallery.html`, with 46 entries, dark/light themes, before comparisons and scroll-bottom captures where needed. Builder verifies every referenced screenshot exists.
- No approval decisions were submitted during visual checks. Original approval/resubmit/reject handlers and their record data remain unchanged.

## Review focus

1. Dynamic body replacement must normalize newly rendered content and preserve original values.
2. Reordering attachment rows must keep their original table/section parent, editable controls, handlers and links; table count must not increase.
3. Inline styles and theme overrides must not defeat shared width/opacity rules.
4. Hidden overlays must remain hidden and open overlays must remain interactive.
5. Existing three-action and restricted deduction flows must preserve their decision handlers.

## 2026-10-03 attachment ownership correction

The user clarified that "last row" means the last rows of each existing tab/table. The former global attachment-tail implementation mixed main-record and Claim Details attachments together and created extra tables, making legitimate per-section file entries look duplicated. It was removed. The adapter now moves only existing sibling rows to the end of their existing container, with Upload Files before Attachments. Hidden sections, file/control nodes and existing table ownership are preserved naturally, without cached attachment groups.

Regression checks compare table count and each attachment's original table/section ownership with the unadapted page, in addition to all existing data and interaction checks. The corrected checks first reproduced failures in the former design before implementation.

Correction verification:

- Full dark/light comparison and repeated-open checks: 92/92 passed. Original table counts, attachment ownership, fixed data, controls and links match the unadapted pages.
- Representative 320px/360px checks across 17 table, multi-table, approval and field-row entries: 68/68 passed.
- Independent read-only reviewer approved the correction after checking Medical/Entertainment history and approvals, both Leave approval categories and representative Attendance details.
- Refreshed all gallery screenshots, including Entertainment's bottom capture showing the main table and Claim Details table each retaining their own attachment rows.

## 2026-10-03 approval comments consistency

All 16 Pending Approval detail types now show Approver Action Comments as a shared rounded card at the end of visible detail content, above the existing action footer. The design follows the user's Claims screenshot: 16px card radius, 12px/14px padding, bold label and full-width 34px comment control with a 10px radius. Existing textareas keep their type, value and limits. Existing control IDs and event handlers are preserved.

Claims, Project and the current native Leave comments cards are reused. Table-based controls are moved into cards while an invisible source row preserves their original section visibility. Stale cards are removed when record renderers replace rows. Leave/Credit cards follow their respective original section visibility and only the active card is shown. Tax Relief receives the requested comments field using the existing Payroll comments reader; deduction still retains its original two approval actions.

Verification:

- Final 16 approval types in dark/light, including original control identity, typed-value and listener preservation: 32/32 passed.
- All 16 types at 320px/360px: 64/64 passed. The final native Leave integration was additionally checked at both widths: 8/8 passed.
- Latest complete dark/light detail gallery refresh: 92/92 passed, preserving attachment ownership and table counts.
- The shared workspace's Leave page was revised independently during verification. Its current full data is compared directly with the current unadapted page; the original historical baseline remains intact.
- Independent reviewer verified repeated Leave → Credit → Leave and Tax → Deduction transitions, one visible comments card, correct original controls and accessible labels. No remaining findings after native Leave integration.
- No approval decisions were executed during verification.
