# Web migration verification

Verified on 2026-10-08 against the delivered immutable `source-snapshot`.

| Check | Result |
| --- | --- |
| TypeScript strict check and Vite production build | Passed |
| Route, preferences, contrast and exact source-preservation tests | 17 passed, 0 failed, 0 skipped |
| Every original business screen at 1280 × 900 | 118 checked, 0 mismatches |
| Runtime control signatures compared with original screens | 118 / 118 preserved |
| Source and adapted page initialization errors | 0 |
| Body horizontal overflow and accidentally revealed hidden panels | 0 |
| Shell / representative business workflow checks | 9 passed |
| Source asset bytes preserved in SQL | 276 files, 9,179,114 bytes |
| Decoded SQL JSON rows compared with the export | 41,540 valid and matching |
| SQL / script parsing errors | 0 |

Workflow checks cover keyboard page search; original Work Plan fields; in-progress text preservation across English/Chinese and light/dark changes; invalid booking refusal, plan save, confirmation and persistence after refresh; favourite persistence; custom copper theme and Chinese preference persistence; repaired leave links; tablet/phone navigation and horizontal overflow at 1024, 768 and 390 pixels.

Independent language regressions verify that Annual Leave entitlement filtering returns 2 records in both languages, and Staff Feedback returns 60 total / 26 Pending in both languages. Reference-data option values, option captions, guest-request choice captions, employee/assignee names, attachment names and source entitlement data remain unchanged.

Theme regressions check primary button foreground contrast for seven custom colours, including white, black, yellow and greys. Header text and focus accents derive readable alternatives while the configured primary background remains intact.

The complete 118-screen differential report is `adapter-browser-report.json`. Representative shell workflow results and screenshots are in `verification/`; additional full-width business screenshots are in `screenshots/`. Review findings and resolutions are in `review-findings.md`. SQL review evidence is in `sql-review.md`.

The final project was also built from `C:/Users/loong/Documents/PeopleHCM-Web`, and all nine workflow checks passed against that directory's running server at `http://127.0.0.1:5173`. A final scoped Project form style removes the obsolete 90px bottom navigation margin; a focused check preserved all 21 Work Plan fields and zero overflow while increasing its usable main area from 730px to 820px.

These checks establish source preservation, screen initialization, presentation and the tested workflows. They do not represent a new backend, production authentication, an executed MySQL import or exhaustive manual execution of every possible action. Source-only/demo actions remain listed in `feature-parity.md`; actual MySQL import has not been executed because no MySQL service is installed.
