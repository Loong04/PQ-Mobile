# Native module navigation

`src/components/ModuleWorkspace.tsx` renders a native React module workspace. It opens each real business document through the supplied `open(path)` callback. It does not embed business pages in an iframe. `src/config/moduleNavigation.ts` is the typed source of option labels, bilingual descriptions, scopes, workflow groups and destinations.

All original 118 HTML routes remain in `src/generated/pages.json` and the application catalogue. The module workspaces expose 115 actionable entries, including multiple meaningful sections inside the single Leave and Profile source documents. These counts describe navigation entries, not employee or approval totals.

| Module          | Individual | Team | Source menu authority                                                                       |
| --------------- | ---------: | ---: | ------------------------------------------------------------------------------------------- |
| Attendance      |          8 |   16 | `modules/attendance/index.html`; `options/team.html`, including its complete 13-option menu |
| Leave           |          7 |    4 | `leave.html` Individual/Team quick options, section IDs and native URL initializer          |
| Claims          |         11 |    6 | `js/claims/claims-config.js` CLAIM_OPTIONS/MANAGER_OPTIONS and source dashboard calendars   |
| Payroll         |          6 |    2 | `js/payroll/payroll-config.js` individualOptions/teamOptions and source Pending Approval    |
| Employee Career |          5 |   14 | `modules/employee-career/js/employee-career-config.js`, plus existing onboarding pages      |
| Project & Task  |          4 |    4 | `modules/project-task/index.html` Individual/Team menus, work calendar and current projects |
| Workplace       |          8 |    2 | `modules/admin/index.html` Individual/Team menus and workplace calendar                     |
| My Profile      |         17 |    1 | `me.html` category jump bar and Executive Actions                                           |

The source root for the paths in this table is the immutable `source-snapshot` directory. The original project is not modified.

## Module structure

Each module opens immediately at `#/module/<moduleId>`. Individual and Team tabs filter the same typed configuration and persist the selection with `?scope=individual` or `?scope=team` in the current hash using `history.replaceState`; a future Shared entry will appear in either scope. The business-document Back action can return to the same scope. Within each scope, options are grouped into Requests, Planning & calendars, Approvals & review, Records & history, Reports & analysis, and Information. The original option names are retained, while the grouping helps desktop users find their workflow. Search matches both English and Chinese names and descriptions. The heading action opens an existing request, planning or approval option; it introduces no new business process.

The Attendance Team workspace exposes all 13 original quick options: Shift Plan, OT Plan, Daily OT, Daily Manpower, Work Hour Violation, Clocking Summary, Staff Attendance, Staff Hours Summary, Attendance Highlight, Overtime Highlight, Overtime Costing, Attendance Performance and Hours Costing. Its Pending Approval, Attendance Verification and Team Overview entries also retain the dashboard's original actions and drill-downs.

Claims retains all eight original application categories and both individual record/report entries. The Benefit and Medical subcategories remain inside their original forms. Payroll retains the exact six individual options and team Tax Relief, with the original Pending Approval entry. Employee Career retains all four individual and 13 team quick options. Project & Task retains Work Plan, Time Sheet, History, Work Assignment and Timesheet Highlight, together with approvals, calendar and current project details. Workplace retains every original individual option and both team actions. Profile categories link to their actual existing section IDs rather than introducing new field schemas.

Detail-only pages, alternate designs and theme variants remain reachable through the catalogue and original drill-downs. For example, daily OT details, shift roster/summary, new-user details, news details and policy documents continue to use their existing source navigation.

## Entry queries and native mounting

| Entry                        | Actual source mechanism                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leave                        | `leave.html?webView=details&view=apply` selects `viewApplyLeave`                                                                                     |
| Leave Credit                 | `leave.html?webView=details&webSection=viewCreditLeaveForm` invokes the original `showLeaveSection`                                                  |
| Time Off                     | `leave.html?webView=details&webSection=viewApplyOffTimeForm` invokes the original `showLeaveSection`                                                 |
| Credit Leave records         | `view=credit` selects `viewLeaveCredit`, preserving its entitlement and application actions                                                          |
| Leave history/calendar       | Native `view=history`, `view=my-calendar`, `view=team-calendar` queries                                                                              |
| Leave team reports/approvals | Native `mode=team&view=highlight`, `entitlement` or `approvals`; approval categories remain `leave`, `credit`, `offtime`                             |
| Attendance team approvals    | Native `team.html?view=approvals&tab=ot_plan`; source tabs also support `final_ot` and `feedback`                                                    |
| Attendance verification      | Native `team.html?view=verification` opens the original staff-list modal                                                                             |
| Claims calendars             | `index.html?webView=details&scope=individual` or `team`; bridge must synchronize `ClaimsEngine.switchClaimScope` after the source's load initializer |
| Project/Workplace calendars  | Existing source `scope=individual` or `team` initialization                                                                                          |
| Profile categories           | `me.html?webView=details&scroll=bento-*` targets the original profile section                                                                        |
| Profile View JD              | `me.html?webView=details&webAction=profile-jd` invokes original job-description modal                                                                |

`webView=details` keeps a source overview document available for its original calendars, indicators and drill-downs instead of redirecting it back to the native module landing. Entry actions run after original initialization. Profile category navigation must scroll the main document after mounting, because the old `scrollToBento` implementation targets the mobile inner scroll container. Theme/locale changes use same-document preference events in the native architecture.

## Component contract and styling

Props are `{ moduleId: string, locale: 'en' | 'zh', open: (path: string) => void, t: Translator }`. Configuration exports `moduleNavigation`, `getModuleOptions(moduleId, scope?)` and `moduleOverviewPaths`.

The design layer owns these CSS hooks:

- `module-workspace`, `module-workspace-heading`, `module-workspace-heading-copy`, `module-workspace-eyebrow`, `module-workspace-primary`.
- `module-workspace-toolbar`, `module-workspace-scopes`, `module-workspace-scope`, `module-workspace-search`, `module-workspace-search-field`, `module-workspace-search-clear`.
- `module-workspace-panel`, `module-workspace-scope-description`, `module-options-grid`, `module-workspace-group`, `module-workspace-group-heading`, `module-workspace-group-count`, `module-workspace-option-list`.
- `module-option`, `module-option-icon`, `module-option-copy`, `module-option-arrow`, `module-workspace-empty`.

Option controls provide `data-option-id` and `data-path`; scope tabs provide `data-scope`. Tabs implement Arrow keys, Home and End, roving tab order, selected state and panel associations. Search has an explicit accessible label. Each native option is an ordinary button with visible title and description. The component creates no employee data, fixed approval totals, backend persistence or replacement form controls.

## Verification and source limits

Node assertions verified 115 unique option IDs, nonempty bilingual metadata, all destination files in both source-snapshot and public/workspace, all eight overview paths, 35 original HTML-menu destination occurrences, all 38 configuration-defined Claims/Payroll/Employee Career quick-option names and applicable destinations, and every direct Leave/Profile section ID. A strict TypeScript build completed successfully after root integration. Browser navigation/entry-action validation is owned by the shared QA suite.

Independent source review found no original `window.parent`, `parent.document`, `window.top` or replacement of `document.body` that would require a framed host. The original DOM container is moved intact, retaining field identities and event listeners. The only generic `document.querySelector('form')` is project form code; the native shell creates no competing form. Integration review identified same-document preference events, Claims' load-time scope reset, profile document scrolling, direct Leave form activation and scope-only module-home links. Code review confirmed explicit native handlers for these cases; browser runtime verification belongs to the shared integration checks.

The original Onboard Activity, Staff Onboard and Staff Engagement pages contain explicit workflow-design placeholders. Their real pages remain available and their descriptions do not claim completed onboarding or engagement processes. No new data or invented business actions have been added to these source placeholders.
