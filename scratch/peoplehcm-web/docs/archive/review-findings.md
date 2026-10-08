# Migration review

The current-source route inventory covers all 118 original HTML pages, including legacy themes and alternate designs. The migration manifest contains 271 application assets: 118 HTML pages, 78 referenced/business JavaScript files and 65 CSS files, plus images and other module assets. No current route or source form was intentionally omitted. The three additional root JavaScript files counted by the source inventory are unused development helpers.

`npm.cmd test` passed all 17 checks against the immutable `source-snapshot`, with no failures or skips. All original external business assets, inline scripts, input/select/textarea markup and select options remain unchanged. The twelve source-preservation checks also verify canonical routes, eleven alias destinations and local stylesheet/script dependencies. The source HTML modifications are confined to the approved presentation boundary, local fonts/icons, responsive viewport and initial theme marker.

The latest `docs/verification/browser-report.json` records nine passing representative workflows and no runtime errors. Browser checks complement source integrity; they do not exercise every branch in all 118 screens.

## Findings addressed

- **Implicit option values and selected-option labels:** translating an option without a `value` attribute changed the value consumed by original filters. Other source forms persist `selectedOptions[0].textContent`. The translator now protects option/reference choices and guest-request checkbox captions. Independent English/Chinese inspection confirmed the Staff Feedback status values remain `Pending`, `In Progress` and `Resolved` in both locales.
- **Leave alias initialization order:** the original page initializes its view in a window `DOMContentLoaded` listener. Applying the alias action earlier was later overwritten. A document-listener microtask also runs before that window listener; Chrome tracing confirmed this order. The bridge now schedules a following task and retries at load. The final browser workflow confirms the repaired alias opens the visible leave application view.
- **Repeatable migration:** a second migration originally treated generated aliases as original source files. The migration walker now requires a matching snapshot file before including a target in the original manifest.
- **Browser test frame selection and reload timing:** searching every frame by `work-plan.html` also matched the main shell's URL hash. Tests now restrict selection to `/workspace/`. Reload checks wait for actual navigation before reading the replacement DOM. These were verification timing/selection defects, rather than omitted form controls.
- **Shell keyboard accessibility:** the command dialog now traps Tab and restores prior focus. The closed mobile sidebar uses visibility/pointer-event rules and the trigger has expansion/control attributes. Responsive navigation passes the final browser checks.

## Final locale reference-data check

One additional issue was reproduced during the text-read audit: `leave.html` filters staff entitlement by reading each card's `innerText` and matching the original leave-type token. Translating `.entitlement-leave-value` changed `ANNUAL LEAVE` to Chinese while its select value remained English; the Annual Leave filter returned two records in English and zero in Chinese. The translator now protects that reference-data node. Independent headless Chrome regression checks passed after the fix:

| Check | English | Chinese |
| --- | ---: | ---: |
| Annual Leave entitlement filter | 2 records | 2 records |
| Unfiltered staff feedback | 60 records | 60 records |
| Pending staff feedback filter | 26 records | 26 records |

The original `Pending` and `In Progress` option values and captions remained unchanged in both locales. The repaired `leave.html?webAction=leave-apply` entry displayed a visible application view after initialization. No blocking findings remained in this independent review.

The same audit identified other source text consumed as business values: attachment filenames in staff nomination, project-assignee names, and clocking-map locations. The final dictionary protects these nodes as well as entitlement metric values. The change-request field-label read is presentation metadata; its business keys are `data-field-id` and entered values remain raw form values. HR-letter filtering uses `data-status`/`data-type`, rather than translated text. Salary/bonus data cells and definition-list record values are already protected. Obsolete highlight-filter functions reference containers absent from the current HTML and do not represent an active flow.

## Maintenance boundary

The typed React shell owns navigation, preferences, search and directories. Original screens own business fields, calculations and workflow handlers. Shared presentation and translation adapters provide the current migration boundary. Source option captions and other DOM text consumed by legacy business code stay in their original language; interface labels, actions and supported placeholder text can be expanded in the central dictionaries. Any future localization extension must check whether the original source reads that text as a business token.

The SQL artifact is a frontend-source data export; the frontend retains its original client-side datasets and persistence. Existing alert-only submits/exports and unfinished source entries remain documented in `feature-parity.md`; source parity does not imply a server implementation.
