# Claims, Benefits, Travel and Expenses consistency audit

Audit date: 2026-10-04  
Scope: current mobile routes reachable from `modules/claims/index.html`, its Quick Options / Manager Options, and their current pending approval, history, summary and form routes.  
Excluded: `C:\Users\loong\Documents\PeopleHCM-Web`, all `no/**` content, and unreferenced legacy pages such as `modules/claims/options/team.html` and `submit-claim.html`.

## Result

**Confirmed findings: 14 â€” High 7, Medium 5, Low 2.**

Runtime checks used installed Chrome headlessly at a 390 Ã— 844 viewport. The current routes loaded without page-level horizontal overflow. The filter and drill-down checks below were exercised in the rendered UI; arithmetic was independently recomputed from the records shown on screen.

## Confirmed findings

### H1 â€” The same employee IDs identify different people across current routes

- **Severity:** High
- **Evidence:**
  - `js/claims/claims-config.js:103-105` assigns `#EBB01` to Aisha Tan in the Team travel data, while `js/claims/claims-config.js:127-129` assigns Sarah Chen to `#0000101`.
  - `js/claims/claims-config.js:241-244` assigns `#EBB01` to Sarah Chen and `#0000101` to Aisha Tan in staff entitlements.
  - `modules/claims/options/staff-entitlement.html:241-246` shows Sarah Chen / `#EBB01`; lines 322-327 show Aisha Omar / `#0000101`.
  - `modules/claims/options/benefit-highlight.html:331-349` and `modules/claims/options/expenses-highlight.html:334-352` identify `#EBB01` as Muhammad Ali Bin Man and `#004177` as Ahmad Rafy Bin Zulkiple, while `js/claims/claims-config.js:111-113,241-242` identify `#004177` as Marcus Tan.
- **Route / reproduction:** Claims & Expenses â†’ Team â†’ Staff travel calendar; then open Staff Benefit Entitlement, Benefit Highlight, and Expense Highlight from Team Quick Options and compare `#EBB01`, `#0000101`, and `#004177`.
- **Expected:** One employee ID maps to one employee name throughout cards, lists, details, approvals and histories.
- **Actual:** At least three IDs map to conflicting names.
- **Root-cause hypothesis:** Each screen owns a separate hardcoded employee dataset rather than using a shared employee fixture/source.
- **Smallest fix:** Define one employee map keyed by normalized `empNo`, reference it from every claims fixture, and add a uniqueness assertion during fixture initialization.

### H2 â€” Benefit and Expense Highlight totals do not equal their visible rows

- **Severity:** High
- **Evidence:**
  - Benefit Highlight displays `RM 7,370.00` at `modules/claims/options/benefit-highlight.html:304-305`, while its six visible employee rows at lines `331-404` total **RM 13,629.32** (`5,459.32 + 3,240 + 1,950 + 1,450 + 880 + 650`). The chart total is separately hardcoded to RM 7,370 at lines `720-730`.
  - Expense Highlight displays `RM 12,450.00` at `modules/claims/options/expenses-highlight.html:307-308`, while its six rows at lines `334-407` total **RM 12,630.00**. The chart uses different fifth/sixth values (`RM 980` and `RM 470`) at lines `711-724`, whereas the table uses `RM 920` and `RM 710`.
  - Runtime drill-down confirmed employee detail totals match the clicked employee row, so the disagreement is specifically between the aggregate/chart dataset and table dataset.
- **Route / reproduction:** Team â†’ Benefit Highlight or Expense Highlight. Sum the six row amounts and compare with the KPI and View Chart total.
- **Expected:** KPI = visible filtered row sum = chart sum = detail sum.
- **Actual:** Benefit differs by RM 6,259.32; Expense differs by RM 180.00.
- **Root-cause hypothesis:** Table, KPI, chart and detail data are maintained as independent literals.
- **Smallest fix:** Keep one record array per highlight page and derive table rows, detail items, KPI totals, chart groups, percentages and record counts from it.

### H3 â€” Staff Benefit Entitlement KPIs and row semantics contradict the five cards

- **Severity:** High
- **Evidence:**
  - KPIs are hardcoded as 5 records, RM 4,770 used, and RM 15,230 usable at `modules/claims/options/staff-entitlement.html:211-234`.
  - The five cards at lines `241-374` sum to **RM 1,017 claimed**, **RM 4,200 current balance**, and **RM 3,183 usable**, not the displayed KPIs.
  - Sarah's `RM 197` and `RM 120` are labelled â€œClaimedâ€ at lines `252-290`, but the canonical benefit fixtures mark those values as **pending** and claimed as zero at `js/claims/claims-config.js:144-146`.
- **Route / reproduction:** Team â†’ Staff Benefit Entitlement; sum each metric column and compare with the three KPI cards. Compare Sarah's first two cards with Benefit Claim.
- **Expected:** KPI totals derive from the cards, and Claimed/Pending/Entitled/Usable retain the same meaning on every route.
- **Actual:** None of the two monetary KPIs reconcile, and pending amounts are presented as claimed.
- **Root-cause hypothesis:** The page was built from a separate static sample and copied pending values into a differently labelled layout.
- **Smallest fix:** Render these cards from the same entitlement objects used by Benefit Claim and compute KPI totals from the rendered/filtered rows.

### H4 â€” Three manager filters acknowledge criteria but do not filter any data

- **Severity:** High
- **Evidence:**
  - Benefit Highlight `submitHighlightFilterModal()` only changes summary text at `modules/claims/options/benefit-highlight.html:1028-1054`.
  - Expense Highlight does the same at `modules/claims/options/expenses-highlight.html:1027-1051`.
  - Staff Benefit Entitlement `applyEntitlementFilter()` only changes the summary text at `modules/claims/options/staff-entitlement.html:471-489`.
  - Runtime: applying keyword `NO SUCH EMPLOYEE` left all 6 Benefit rows, all 6 Expense rows, and all 5 entitlement cards visible; KPIs were unchanged. Selecting Car Maintenance on entitlement also left all five categories visible.
- **Route / reproduction:** Open each page's filter, enter `NO SUCH EMPLOYEE`, apply; on entitlement also select Car Maintenance.
- **Expected:** Rows/cards, counts, monetary KPIs and charts update to the matching result set, normally zero for the unmatched keyword.
- **Actual:** Only the filter summary label changes, falsely implying the results are filtered.
- **Root-cause hypothesis:** Filter sheets were wired only for presentation/toast behavior.
- **Smallest fix:** Store records in arrays, filter once on Apply, then rerender list/table, KPI and chart from the filtered array.

### H5 â€” Claim Summary records cannot be reconciled with Claim History

- **Severity:** High
- **Evidence:**
  - Claim Summary defines seven May 2026 records at `modules/claims/options/summary.html:264-323`; runtime shows 7 records totalling RM 1,450.50.
  - Claim History's current full-year Januaryâ€“December dataset contains Benefit records only in August/September (`modules/claims/options/history.html:379-383`) and other claim records primarily in September (`:489-504`); there are no corresponding May records or document references for the Summary drill-down entries.
- **Route / reproduction:** Individual â†’ View All â†’ Claim Summary (default May 2026), open any detail; then Claim History with its default full-year 2026 filter and search the same category/date/amount.
- **Expected:** A summary detail record has an identical history record and stable status/amount.
- **Actual:** The summary's seven May records exist only in the summary page fixture.
- **Root-cause hypothesis:** Summary and History were implemented with unrelated mock arrays.
- **Smallest fix:** Build summary groups from the history/submission record source rather than maintaining `SUMMARY_CATEGORIES` separately.

### H6 â€” Team travel calendar badges and headline counts have no matching detail records

- **Severity:** High
- **Evidence:**
  - `js/claims/claims-config.js:92-100` claims 6 staff and 8 trips and gives travel badges on 7, 8, 10, 11, 14, 15, 16, 25, 26 and 28â€“30 September.
  - Only four `staffTrips` exist, all spanning 28â€“30 September (`js/claims/claims-config.js:101-133`).
  - Detail rendering filters only those four entries (`js/claims/claims-app.js:421-456`). Thus dates such as 7 September show a badge of 1 but render â€œNo staff travel scheduled for this date.â€
- **Route / reproduction:** Claims & Expenses â†’ Team â†’ Staff travel calendar â†’ tap 7 September.
- **Expected:** Every nonzero badge opens the same number of staff trip records, and headline counts derive from those records.
- **Actual:** Many badges have no drill-down data; 6 staff / 8 trips cannot be produced from four records.
- **Root-cause hypothesis:** Calendar badge/count fixtures were not generated from `staffTrips`.
- **Smallest fix:** Store all trips with employee/date ranges and derive badges, unique staff count, trip count and selected-day detail from that array.

### H7 â€” Optical & Dental is an entitlement everywhere except the Benefit Claim entry form

- **Severity:** High
- **Evidence:** `js/claims/claims-config.js:143-148` declares four benefit types including Optical & Dental; History includes it at `modules/claims/options/history.html:333-336,383`; Staff Benefit Entitlement shows it at `modules/claims/options/staff-entitlement.html:295-318`. Benefit Claim renders â€œ3 typesâ€ and only Car Maintenance, Personal Allowance and Mobile Phone at `modules/claims/options/benefit-claim.html:263-363`; its form/filter options and balance map also omit Optical & Dental at lines `386-388,547-549,578-583`.
- **Route / reproduction:** Individual â†’ Benefit Claim; compare the list and benefit type selects with Staff Benefit Entitlement or Benefit Claim History.
- **Expected:** Every active entitlement can be selected and submitted.
- **Actual:** Optical & Dental has balance/history data but cannot be started from Benefit Claim.
- **Root-cause hypothesis:** The page duplicates a three-item entitlement subset instead of reading `CLAIM_OPTIONS`.
- **Smallest fix:** Generate the list, filter options, form options and balance lookup from `CLAIM_OPTIONS.find(id === 'benefit').subCategories`.

### M1 â€” â€œExclude Pendingâ€ empties Staff Claim Summary because all records lack statuses

- **Severity:** Medium
- **Evidence:** All six records at `modules/claims/options/staff-summary.html:184-205` omit `status`/`docStatus`. `includeRecord()` excludes any missing status when Include Pending is off at lines `228-233`. Runtime changed 4 category cards / 6 records / RM 3,620.00 to zero cards / zero records / RM 0.00 and displayed the missing-status note.
- **Route / reproduction:** Team â†’ Staff Claim Summary â†’ Filter â†’ clear Include Pending â†’ Apply.
- **Expected:** Approved/rejected records remain; only pending/submitted/draft records are removed.
- **Actual:** Every record disappears because none has a status.
- **Root-cause hypothesis:** Filtering logic was added after the fixture without migrating the fixture schema.
- **Smallest fix:** Add valid statuses to every staff summary record or derive the page from the shared status-bearing record source.

### M2 â€” Work Status cards do not carry their selected status into History

- **Severity:** Medium
- **Evidence:** Submitted, Approved and Rejected cards all use the identical `href="options/history.html"` at `modules/claims/index.html:773-786`, with no query/hash/state. The counts 8/36/1 are also hardcoded there and are not derived from History.
- **Route / reproduction:** From Individual, tap each of the three Work Status cards.
- **Expected:** History opens filtered to the tapped status and its record count reconciles with the dashboard count.
- **Actual:** All three open the same default Benefit History list and filter.
- **Root-cause hypothesis:** Cards were styled as links before status routing/state was implemented.
- **Smallest fix:** Add a status parameter and have History initialize its filter from it; derive the dashboard counts from the same history/submission source.

### M3 â€” Employee IDs are separate table columns instead of directly below names

- **Severity:** Medium
- **Evidence:** Benefit Highlight uses separate `EMP#` and `NAME` columns at `modules/claims/options/benefit-highlight.html:321-336`; Expense Highlight does the same at `modules/claims/options/expenses-highlight.html:324-339`.
- **Route / reproduction:** Team â†’ Benefit Highlight / Expense Highlight.
- **Expected:** On each employee list row, the muted `#...` ID sits directly below the name.
- **Actual:** The ID is in a preceding table column.
- **Root-cause hypothesis:** Desktop table structure was retained for the mobile list.
- **Smallest fix:** Combine name and ID into one identity cell (name first, muted monospaced ID below) and remove the separate EMP# column.

### M4 â€” Benefit category colors are still rainbow outside the compliant entitlement cards

- **Severity:** Medium
- **Evidence:** The dashboard benefit datasets assign different blue, purple, teal, amber, pink and grey colors at `js/claims/claims-config.js:21-30,46-55`; Benefit Highlight assigns Car Maintenance purple, Mobile Phone blue and Optical & Dental green at `modules/claims/options/benefit-highlight.html:720-730`.
- **Route / reproduction:** Individual or Team â†’ Monthly breakdown â†’ Benefits â†’ View Chart; also Team â†’ Benefit Highlight â†’ View Chart.
- **Expected:** Benefit category labels/markers use the requested consistent purple treatment.
- **Actual:** The same benefit category system is shown as a rainbow.
- **Root-cause hypothesis:** Generic multiseries chart colors remain embedded in each fixture.
- **Smallest fix:** Use the module's single purple category token for benefit labels/markers; distinguish slices with shade/opacity/pattern only if the chart still needs separation.

### M5 â€” Dashboard chart buttons do not use the required visible label

- **Severity:** Medium
- **Evidence:** Both dashboard buttons use the correct `fa-solid fa-chart-pie` but render `View chart breakdown` at `modules/claims/index.html:833-838,980-985`.
- **Route / reproduction:** Individual â†’ Monthly breakdown, then Team â†’ Monthly staff spending.
- **Expected:** A horizontal nowrap pill with pie icon and the visible text `View Chart`.
- **Actual:** The visible label is `View chart breakdown` (plus a second arrow icon).
- **Root-cause hypothesis:** Older call-to-action copy remained after the global View Chart standard was defined.
- **Smallest fix:** Replace the span text with `View Chart`; retain the current pill CSS and pie icon.

### L1 â€” Benefit Highlight route title is plural while its entry label is singular

- **Severity:** Low
- **Evidence:** Manager Options names the feature `Benefit Highlight` at `js/claims/claims-config.js:233-237`; the destination document title and H1 say `Benefit Highlights` at `modules/claims/options/benefit-highlight.html:6,252,817`.
- **Route / reproduction:** Team â†’ Benefit Highlight.
- **Expected:** `Benefit Highlight`, matching the corrected entry wording.
- **Actual:** `Benefit Highlights`.
- **Root-cause hypothesis:** Page title copy predates the corrected navigation label.
- **Smallest fix:** Change the document title, H1 and return-state title to the singular wording.

### L2 â€” Current Filter bars render a stray Tamil glyph

- **Severity:** Low
- **Evidence:** A literal glyph is used before the filter summary in Benefit Highlight (`modules/claims/options/benefit-highlight.html:271-273`), Expense Highlight (`:274-276`), Staff Benefit Entitlement (`modules/claims/options/staff-entitlement.html:200-202`) and Pending Approval (`modules/claims/options/pending-approval.html:194-196`). Runtime renders it as `à®ƒ`.
- **Route / reproduction:** Open any listed route and inspect Current Filter.
- **Expected:** A deliberate FontAwesome filter/calendar icon or no icon.
- **Actual:** `à®ƒ` appears as visible text.
- **Root-cause hypothesis:** A corrupted/placeholder icon literal was committed.
- **Smallest fix:** Replace the text node with an `<i class="fa-solid fa-filter" aria-hidden="true"></i>` (or the shared filter icon primitive).

## Confirmed passes and false positives

- **Staff Benefit Entitlement category labels pass the purple requirement.** `.entitlement-benefit-value` uses one shared purple token/background/border at `modules/claims/options/staff-entitlement.html:107-124,163-165`, and every card uses that class at lines `248-249,275-276,302-303,329-330,356-357`.
- **The exact visible wording `Benefit Highlights Table` is not present.** The phrase exists only in a non-rendered HTML comment at `modules/claims/options/benefit-highlight.html:260-263`. The confirmed user-facing issue is the plural page title in L1.
- **Benefit Highlight and Expense Highlight View Chart buttons pass.** Both use `fa-solid fa-chart-pie`, visible `View Chart`, an inline horizontal layout and `white-space: nowrap` at `modules/claims/options/benefit-highlight.html:285-295` and `expenses-highlight.html:288-298`.
- **Employee ID presentation passes on current Staff Benefit Entitlement cards, pending approval cards, summary detail cards and highlight detail modal headers.** IDs have a leading `#`, are directly below the name and use compact muted typography. M3 is limited to the two highlight table/list views.
- **No page-level horizontal overflow was found** at 390 Ã— 844 on the audited formal routes. Internal highlight tables intentionally scroll within their container.

## Data architecture resolution

The high-severity findings shared one cause: separate hardcoded datasets. The implementation now centralizes employee identity, highlight records, entitlement records, summary/history records, status records and travel trips in the Claims configuration, with page KPIs, filters and drill-downs derived from those sources.

## Fixed / verification

Implementation completed on 2026-10-04. All 14 confirmed findings are fixed on the audited current mobile routes.

- **H1:** Added the shared `CLAIM_EMPLOYEES` directory and normalized Claims fixtures to the same unique employee ID-to-name mapping. The current user is Sarah Jenkins / `#EBB01`; IDs render directly below names in the manager highlight lists.
- **H2 / H4:** Benefit and Expense Highlight tables, details, KPIs, counts, charts and applied filters now derive from `CLAIM_HIGHLIGHT_DATA`. Verified totals are RM 13,629.32 across 19 Benefit details and RM 12,630.00 across 14 Expense details; an unmatched keyword produces zero rows, zero count and RM 0.00.
- **H3:** Staff Benefit Entitlement cards and filtered KPIs now derive from shared entitlement records with separate Claimed, Pending, Entitled and Usable metrics. Verified claimed total: RM 700.00; usable total: RM 3,183.00.
- **H5:** Claim Summary renders `CLAIM_SUMMARY_RECORDS`, and Claim History merges the same stable record IDs from `CLAIM_HISTORY_RECORDS`.
- **H6:** Team travel badges, unique-staff count, trip count and selected-day details derive from eight shared trip records. Verified headline totals: 6 staff / 8 trips; 7 September badge and detail both equal one.
- **H7:** Benefit Claim now exposes Optical & Dental in the entitlement list, form select, filter select and balance lookup, for four active benefit types.
- **M1:** Every Staff Claim Summary record now carries an approval status. Excluding pending retains four approved records totalling RM 2,670.00.
- **M2:** Work Status counts derive from `CLAIM_STATUS_RECORDS`; links pass `status=`, and History renders the corresponding shared status records. Submitted includes pending/in-review records consistently.
- **M3:** Benefit and Expense Highlight list identities render employee name first and muted monospaced `#empNo` directly below it.
- **M4:** Benefit dashboard and Benefit Highlight chart markers use the single purple token `#7c3aed`; Staff Benefit Entitlement labels remain purple.
- **M5:** Both dashboard chart pills show the pie icon plus the exact visible label `View Chart` in a nowrap horizontal pill.
- **L1 / L2:** The route title is consistently singular `Benefit Highlight`; Current Filter bars use a real FontAwesome filter icon.
- **Pending Approval filter standard:** The Claims filter sheet uses title `Filter`, a reset icon plus `Reset`, sentence-case labels, 48px fields and 16px field radii.

Verification evidence:

- `node scratch/test_claims_consistency.cjs` â€” **16/16 passed** after the final fixture cleanup. This covers all findings above plus rendered shared Summary/History IDs and all three status deep links.
- `node scratch/check_pending_approval_filters.cjs` â€” passed date parsing, keyword matching, inclusive ranges and outstanding-day presets.
- `node scratch/test_claim_summary_details_contract.js` â€” passed; no page errors, shared Sarah Jenkins / `#EBB01` identity, connected detail cards and matching modal controls.
- `node scratch/test_claim_chart_breakdown_sheet.js` â€” passed for Individual/Team and Benefits/Claims; no page errors.
- `node scratch/preview_benefit_detail_fields.cjs` â€” passed at 390px and 320px in dark/light themes; zero overflowing fields, zero clipped records and zero page errors.
- `node scratch/verify_pending_approval_filters.cjs` â€” Claims, Attendance and Leave phases passed. The broader script later timed out on the pre-existing Payroll `.team-relief-card` selector, outside this audit scope; the Claims phase completed successfully.
- Static runtime-data check confirmed 13 unique employees, highlight totals 13,629.32 / 12,630, entitlement totals 700 / 3,183, 6 travel staff, 8 trips, 7 shared summary records and 7 shared status records.
- Static text scan of current Claims routes found no remaining conflicting legacy employee names, `Benefit Highlights`, `View chart breakdown`, or stray Tamil filter glyph. The intentionally excluded unreferenced legacy `modules/claims/options/team.html` was not changed.


### Final legacy-regression cleanup

Independent acceptance identified encoding damage and two stale scratch contracts. The Claims production routes were scanned and repaired at the source rather than weakening product assertions:

- Repaired UTF-8 text that had been decoded as Windows-1252, including curly apostrophes, en/em dashes, bullets, arrows, symbols and emoji. `Naughty Nuri’s Pavilion` and the Travel Request em dash now render as intended.
- Preserved the established Claim History presentation rule that pending work appears under Submitted / In Review.
- Updated the Expense Highlight regression to use canonical Marcus Tan / `#004177`, shared record fields and the data-driven breakdown output.
- Updated the Highlight detail-card regression to inspect period, type and amount fields independently of DOM whitespace, and to assert Sarah Jenkins / `#EBB01` and Marcus Tan / `#004177`.

Final verification:

- `node scratch/test_detail_popout_consistency.cjs` — **92/92 entries passed**.
- `node scratch/test_expenses_highlight_consistency.js` — `passed: true`.
- `node scratch/test_highlight_detail_card_consistency.js` — `passed: true` with canonical identities and semantic field checks.
- `node scratch/test_claims_consistency.cjs` — **16/16 passed**.
- Static Claims source scan — **0** remaining suspicious mojibake lead sequences (`â`, `Ã`, `ð`, `Â`, `ï`) in `modules/claims` and `js/claims` HTML/JavaScript.
