# Mobile-to-web feature parity inventory

This inventory was generated directly from the original PeopleHCM project. Run `node scripts/inventory.mjs <mobile-source-root>` to regenerate it. Detailed field labels, attributes, select options, handlers, local links and script dependencies are in `docs/page-inventory.json`. The shell route registry is `src/generated/pages.json`.

## Coverage

- The native web navigation exposes 115 original functional options across eight modules, with individual/team grouping. Business pages run in top-level documents with the shared React enterprise navigation; original controls are moved intact into the desktop outlet. See `module-options-v2.md` and `web-native-validation.md` for the menu and native-layout checks.

- 118 source HTML pages remain addressable, comprising 109 canonical pages, 7 theme variants and 2 alternate designs.
- 1000 form-control occurrences are present in source HTML (including JavaScript templates embedded in those files).
- 933 linked-script control occurrences are associated with their pages. Shared scripts can contribute the same control to more than one route.
- 81 JavaScript source files were inventoried. Every original business screen, its handlers, datasets and attachments are preserved in the workspace copy.
- No backend is implemented. Original local-storage, client-side validation, calculations, approvals, history and demo responses run with the same original scripts. A preserved alert-only source action is not a server transaction.

| Module | Source pages |
| --- | ---: |
| Attendance & Shift Planning | 27 |
| Leave Management | 2 |
| Claims & Expenses | 18 |
| Payroll | 9 |
| Employee & Career | 21 |
| Projects & Tasks | 7 |
| Workplace | 12 |
| Employee Profile | 9 |
| Overview | 8 |
| My Team | 3 |
| My Calendar | 1 |
| Workspace | 1 |

## Business flows preserved in source

| Area | Included processes |
| --- | --- |
| Attendance & Shift Planning | Individual attendance; clock in/out; clocking history/summary; team attendance; shift planning and roster; shift/work/no-work summaries; OT planning, final OT and daily OT approvals; attendance advice; hours and overtime highlight/costing; manpower and work-hour violation reports; employee drill-downs. |
| Leave | Leave application, cancellation, time-off, medical details, attachments, entitlement and history; individual/team views; staff/calendar/summary drill-downs; multi-level pending approvals and approver comments. The main leave screen contains multiple views in one source document. |
| Claims & Expenses | Medical, entertainment, travel mileage, travel request, expenses, benefits, advance and OT claims; receipts, line items and attachment controls; draft/submit actions; team approvals; history, entitlement and summary; benefit and expense analysis. |
| Payroll | Payslip, salary/bonus history and EA form; deduction requests; prior pay data; tax relief requests, team relief, pending approvals and history. |
| Employee & Career | Personal whereabouts, feedback, onboarding and events; staff lists, confirmations/new users, nominations, staffing requests/onboarding/exits; feedback/events/whereabouts; manpower, attrition, retention and engagement analysis; request history. |
| Projects & Tasks | Work plan, assignment, timesheet, highlights, pending approvals and history; project/task/category selectors; durations, attachments and local persistence. |
| Workplace | Resource booking, guest visit, inventory and letter requests; policy/SOP/document screens; news/feedback; assets, approvals, history and calendar integration. |
| Shared | Overview, application launcher, favourites, employee dossier/profile, organisation/subordinates, team dashboards, calendar and work behaviour analytics. |

## Shared presentation and web architecture

The enterprise shell loads the copied source screens through one workspace route and applies the shared desktop/neumorphic adapter. It preserves original field IDs, event handlers, relative URLs, shared modules and data structures. Branding is configured with semantic CSS tokens and one theme setting; shell locale labels live in translation dictionaries. Source business data such as employee names, reference numbers and codes remains unchanged. Chinese route titles are included for every source page in the route registry.

Employee IDs must remain directly beneath employee names with a leading `#`. View Chart controls must use a pie-chart icon and visible `View Chart` text. Attendance approval titles are `OT Plan Approval`, `Attendance Advice Approval` and `Final OT Approval`. Attendance summary/detail cards follow the rounded history-card treatment without a redundant date badge.

## Source limitations retained and documented

These are existing mobile-source behaviours, not guarantees of backend functionality. The inventory records alert-only submission/export actions and explicit API/coming-soon notes so frontend parity is not confused with a completed server integration.

| Source | Existing behaviour or note |
| --- | --- |
| `appdark.html:180` | <div class="explore-row" role="button" tabindex="0" onclick="showToast('Training & Competency is coming soon')" onkeydown="if (event.key === 'Enter' // event.key === ' ') { event.preventDefault(); this.click(); }"> |
| `appdark.html:190` | <div class="explore-row" role="button" tabindex="0" onclick="showToast('Performance is coming soon')" onkeydown="if (event.key === 'Enter' // event.key === ' ') { event.preventDefault(); this.click(); }"> |
| `applight.html:180` | <div class="explore-row" role="button" tabindex="0" onclick="showToast('Training & Competency is coming soon')" onkeydown="if (event.key === 'Enter' // event.key === ' ') { event.preventDefault(); this.click(); }"> |
| `applight.html:190` | <div class="explore-row" role="button" tabindex="0" onclick="showToast('Performance is coming soon')" onkeydown="if (event.key === 'Enter' // event.key === ' ') { event.preventDefault(); this.click(); }"> |
| `js/payroll/payroll-app.js:187` | window.showToast(action === 'payroll-history' ? 'Payroll history is coming soon.' : '${label} UI entry is ready for the next screen'); |
| `js/project-task/project-task-forms.js:1` | /* Individual forms use local persistence until the Project & Task API is connected. */ |
| `leave.html:11499` | alert('Action '${actionType}' submitted for ${applicant}'); |
| `modules/admin/js/guest-visit.js:10` | // Demo employees match the existing employee forms until an Admin API is available. |
| `modules/attendance/options/overtime.html:485` | alert('Overtime request submitted successfully!'); |
| `modules/claims/options/advance-claim.html:1267` | else alert('Advance Request draft saved!'); |
| `modules/claims/options/advance-claim.html:1272` | else alert('Advance Request submitted successfully!'); |
| `modules/claims/options/benefit-claim.html:717` | alert('Benefit claim request for [${name}] submitted successfully!'); |
| `modules/claims/options/benefit-highlight.html:995` | alert('Generating ${type} report export...'); |
| `modules/claims/options/entertainment-claim.html:1889` | else alert('Entertainment Claim draft saved!'); |
| `modules/claims/options/entertainment-claim.html:1894` | else alert('Entertainment Claim submitted successfully!'); |
| `modules/claims/options/expenses-highlight.html:995` | alert('Generating ${type} report export...'); |
| `modules/claims/options/medical-claim.html:1615` | alert('Medical Claim draft saved!'); |
| `modules/claims/options/medical-claim.html:1623` | alert('Medical Claim submitted successfully!'); |
| `modules/claims/options/ot-claim.html:1294` | alert('OT Claim draft saved successfully!'); |
| `modules/claims/options/ot-claim.html:1302` | alert('OT Claim submitted successfully!'); |
| `modules/claims/options/submit-claim.html:177` | <button class="btn-submit" onclick="alert('Claim submitted successfully!')">Submit Request</button> |
| `modules/claims/options/travel-claim.html:2111` | else alert('Travel Mileage draft saved!'); |
| `modules/claims/options/travel-claim.html:2116` | else alert('Travel Mileage submitted successfully!'); |
| `modules/employee-career/js/staff-feedback.js:2` | // Preview data until the Staff Feedback service is connected. |

The machine-readable report also records 11 references that do not resolve to inventoried source files. Some are JavaScript-generated paths; these require runtime review rather than automatic deletion or invented screens.

## Complete route list

| Original route | Title | Module | Kind | Control occurrences |
| --- | --- | --- | --- | ---: |
| `app.html` | App | home | dashboard | 0 |
| `appdark.html` | App (Dark Mode) | home | theme-variant | 8 |
| `applight.html` | App (Light Mode) | home | theme-variant | 8 |
| `attendance.html` | Attendance | attendance | dashboard | 8 |
| `bonus-history.html` | Bonus History | profile | history | 8 |
| `calendar.html` | My Calendar | calendar | dashboard | 10 |
| `change-request.html` | Change Request | profile | form | 66 |
| `favourite.html` | My Favourites | home | dashboard | 8 |
| `homedark.html` | Insights Dashboard (Dark Mode) | home | theme-variant | 8 |
| `homelight.html` | Insights Dashboard (Light Mode) | home | theme-variant | 8 |
| `index.html` | Overview | home | dashboard | 0 |
| `leave.html` | Leave Apply | leave | form | 121 |
| `light.html` | Mobile Dashboard (Light Mode) | home | theme-variant | 0 |
| `me-accordion.html` | Employee Profile | profile | design-variant | 9 |
| `me.html` | Employee Profile | profile | profile | 9 |
| `medark.html` | Redirecting to Me Profile (Dark)... | profile | theme-variant | 0 |
| `melight.html` | Redirecting to Me Profile (Light)... | profile | theme-variant | 0 |
| `modules/admin/index.html` | Workplace | admin | module | 8 |
| `modules/admin/options/asset-highlight.html` | Asset Highlight | admin | report | 16 |
| `modules/admin/options/book-resource.html` | Book Resource | admin | form | 16 |
| `modules/admin/options/guest-visit.html` | Guest Visit | admin | form | 27 |
| `modules/admin/options/history.html` | Workplace History | admin | history | 12 |
| `modules/admin/options/inventory-request.html` | Inventory Request | admin | form | 15 |
| `modules/admin/options/letter-request.html` | Letter Request | admin | form | 15 |
| `modules/admin/options/news-detail.html` | News Details | admin | detail | 9 |
| `modules/admin/options/news.html` | News | admin | dashboard | 8 |
| `modules/admin/options/pending-approval.html` | Pending Approval | admin | approval | 17 |
| `modules/admin/options/policy-document.html` | Policy Document | admin | detail | 8 |
| `modules/admin/options/policy-sop.html` | Policy / SOP | admin | dashboard | 17 |
| `modules/attendance/index.html` | Attendance & Shift Planning | attendance | module | 8 |
| `modules/attendance/options/attendance-highlight.html` | Attendance Highlights | attendance | report | 18 |
| `modules/attendance/options/attendance-performance.html` | Attendance Performance | attendance | report | 12 |
| `modules/attendance/options/attendance.html` | Attendance | attendance | dashboard | 17 |
| `modules/attendance/options/clocking-history.html` | History | attendance | history | 11 |
| `modules/attendance/options/clocking-summary.html` | Clocking Summary | attendance | report | 19 |
| `modules/attendance/options/clocking.html` | Clock In/Out | attendance | form | 8 |
| `modules/attendance/options/daily-manpower.html` | Daily Manpower Summary | attendance | dashboard | 12 |
| `modules/attendance/options/daily-ot-details.html` | Daily OT Approval | attendance | approval | 10 |
| `modules/attendance/options/daily-ot.html` | Daily OT | attendance | dashboard | 15 |
| `modules/attendance/options/feedback-history.html` | Pending Attendance Feedback | attendance | approval | 17 |
| `modules/attendance/options/history.html` | History | attendance | history | 33 |
| `modules/attendance/options/hours-costing.html` | Hours Costing | attendance | report | 13 |
| `modules/attendance/options/hours-summary.html` | Hours Summary | attendance | report | 11 |
| `modules/attendance/options/individual.html` | Attendance Individual | attendance | dashboard | 8 |
| `modules/attendance/options/ot-plan.html` | OT Planning | attendance | form | 23 |
| `modules/attendance/options/overtime-costing.html` | Overtime Costing | attendance | report | 14 |
| `modules/attendance/options/overtime-highlight.html` | Overtime Highlights | attendance | report | 16 |
| `modules/attendance/options/overtime.html` | Overtime | attendance | form | 18 |
| `modules/attendance/options/shift-plan.html` | Shift Plan | attendance | form | 35 |
| `modules/attendance/options/shift-roster.html` | Shift Roster | attendance | dashboard | 8 |
| `modules/attendance/options/shift-summary.html` | Shift Summary | attendance | report | 14 |
| `modules/attendance/options/staff-attendance.html` | Staff Attendance | attendance | dashboard | 17 |
| `modules/attendance/options/staff-hours-summary.html` | Staff Hours Summary | attendance | report | 14 |
| `modules/attendance/options/team.html` | Team Attendance | attendance | dashboard | 27 |
| `modules/attendance/options/work-hour-violation.html` | Work Hour Violations | attendance | report | 11 |
| `modules/claims/index.html` | Claims & Expenses | claims | module | 14 |
| `modules/claims/options/advance-claim.html` | Advance Request | claims | form | 27 |
| `modules/claims/options/benefit-claim.html` | Benefit Claim | claims | form | 23 |
| `modules/claims/options/benefit-highlight.html` | Benefit Highlight | claims | report | 16 |
| `modules/claims/options/entertainment-claim.html` | Entertainment Claim | claims | form | 45 |
| `modules/claims/options/expenses-claim.html` | Expense Claim | claims | form | 30 |
| `modules/claims/options/expenses-highlight.html` | Expenses Highlights | claims | report | 15 |
| `modules/claims/options/history.html` | Claim History | claims | history | 13 |
| `modules/claims/options/medical-claim.html` | Medical Claim | claims | form | 32 |
| `modules/claims/options/ot-claim.html` | OT Claim | claims | form | 27 |
| `modules/claims/options/pending-approval.html` | Pending Approval | claims | approval | 17 |
| `modules/claims/options/staff-entitlement.html` | Staff Benefit Entitlement | claims | dashboard | 12 |
| `modules/claims/options/staff-summary.html` | Staff Claim Summary | claims | report | 15 |
| `modules/claims/options/submit-claim.html` | Submit Claim Option | claims | form | 12 |
| `modules/claims/options/summary.html` | Claim Summary | claims | report | 11 |
| `modules/claims/options/team.html` | Team Claims Management | claims | dashboard | 10 |
| `modules/claims/options/travel-claim.html` | Travel Mileage | claims | form | 63 |
| `modules/claims/options/travel-request.html` | Travel Request | claims | form | 54 |
| `modules/employee-career/index.html` | Employee & Career | employee-career | module | 8 |
| `modules/employee-career/options/history.html` | Employee & Career History | employee-career | history | 15 |
| `modules/employee-career/options/individual/feedback.html` | Feedback | employee-career | form | 19 |
| `modules/employee-career/options/individual/my-event.html` | My Event | employee-career | dashboard | 11 |
| `modules/employee-career/options/individual/onboard-activity.html` | Onboard Activity | employee-career | dashboard | 8 |
| `modules/employee-career/options/individual/whereabout.html` | Whereabout | employee-career | form | 17 |
| `modules/employee-career/options/team/confirm-new-user-details.html` | New User Details | employee-career | form | 48 |
| `modules/employee-career/options/team/confirm-new-user.html` | Confirm New User | employee-career | form | 8 |
| `modules/employee-career/options/team/confirm-staff.html` | Confirm Staff | employee-career | form | 22 |
| `modules/employee-career/options/team/key-staff-nomination.html` | Key Staff Nomination | employee-career | form | 18 |
| `modules/employee-career/options/team/manpower-stats.html` | Manpower Statistics | employee-career | report | 15 |
| `modules/employee-career/options/team/staff-attrition.html` | Staff Attrition | employee-career | report | 18 |
| `modules/employee-career/options/team/staff-engagement.html` | Staff Engagement | employee-career | report | 8 |
| `modules/employee-career/options/team/staff-events.html` | Staff Events | employee-career | dashboard | 12 |
| `modules/employee-career/options/team/staff-exit.html` | Staff Exit | employee-career | dashboard | 21 |
| `modules/employee-career/options/team/staff-feedback.html` | Staff Feedback | employee-career | form | 15 |
| `modules/employee-career/options/team/staff-list.html` | Staff List | employee-career | dashboard | 16 |
| `modules/employee-career/options/team/staff-onboard.html` | Staff Onboard | employee-career | dashboard | 8 |
| `modules/employee-career/options/team/staff-request.html` | Staff Request | employee-career | form | 25 |
| `modules/employee-career/options/team/staff-retention.html` | Staff Retention | employee-career | report | 16 |
| `modules/employee-career/options/team/staff-whereabout.html` | Staff Whereabout | employee-career | form | 13 |
| `modules/leave/index.html` | Leave Management | leave | module | 8 |
| `modules/me/index.html` | Employee Profile | profile | module | 8 |
| `modules/payroll/index.html` | Payroll | payroll | module | 10 |
| `modules/payroll/options/deduction-request.html` | Deduction Request | payroll | form | 17 |
| `modules/payroll/options/ea-form.html` | EA Form | payroll | dashboard | 10 |
| `modules/payroll/options/history.html` | Payroll History | payroll | history | 13 |
| `modules/payroll/options/payslip.html` | Payslip | payroll | dashboard | 13 |
| `modules/payroll/options/pending-approval.html` | Payroll Pending Approval | payroll | approval | 17 |
| `modules/payroll/options/prior-pay-data.html` | Prior Pay Data | payroll | dashboard | 30 |
| `modules/payroll/options/tax-relief-request.html` | Tax Relief | payroll | form | 16 |
| `modules/payroll/options/tax-relief.html` | Team Tax Relief | payroll | dashboard | 14 |
| `modules/project-task/index.html` | Projects & Tasks | project-task | module | 8 |
| `modules/project-task/options/history.html` | Project & Task History | project-task | history | 18 |
| `modules/project-task/options/pending-approval.html` | Project & Task Pending Approval | project-task | approval | 13 |
| `modules/project-task/options/time-sheet.html` | Time Sheet | project-task | form | 19 |
| `modules/project-task/options/timesheet-highlight.html` | Timesheet Highlight | project-task | report | 14 |
| `modules/project-task/options/work-assignment.html` | Work Assignment | project-task | form | 25 |
| `modules/project-task/options/work-plan.html` | Work Plan | project-task | form | 22 |
| `payslip.html` | Payslip & Salary | profile | dashboard | 8 |
| `salary-history.html` | Salary History | profile | history | 8 |
| `subordinates.html` | Organization Chart | team | dashboard | 8 |
| `team-v2.html` | My Team Dashboard (Design 2 - Bento & Matrix) | team | design-variant | 0 |
| `team.html` | My Team Dashboard | team | dashboard | 0 |
| `work-behaviour.html` | Work Behaviour & KPI Analytics | other | report | 9 |

## Manual parity checklist

For each form route, exercise all section tabs and expandable rows, required-field errors, date/time/number constraints, select options, add/remove line items, attachments, draft/submit behaviour and return navigation. For approvals, exercise View Details, attachments, comments, approval/rejection and result/history refresh. For summaries/reports, exercise all date filters, employee drill-downs, charts, export actions and empty states. Compare data, calculated totals and status labels to the original source screen. Frontend-only demo responses must be described accurately.

Static source extraction identifies existing controls but does not prove runtime behaviour. Browser verification and parity checks complement this inventory.
