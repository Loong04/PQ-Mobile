# Migration ledger

Plan: docs/superpowers/plans/2026-10-08-web-migration.md

Ruling: User explicitly delegates technology and design decisions and requests immediate implementation. Continue within this authorization without adding redundant design approval rounds.
Ruling: New standalone project uses a separate staging directory; existing mobile checkout and all uncommitted changes stay intact. Final deliverable is copied to the authorized Documents directory.
Ruling: Preserve existing global business scripts inside same-origin document boundaries rather than rewrite 113 pages and risk silent process loss. This boundary is documented for maintainers.
Ruling: User confirmed MySQL 8 seed dialect.

Inventory, SQL export and desktop adapter delegated in parallel. Root owns shell, source migration, integration and verification.

Task 1 complete: 118 original active/alternate documents inventoried; 1,000 HTML and 933 referenced-script control occurrences captured with 1,374 static options.
Task 2 complete: MySQL8 export from immutable snapshot; 276 exact source assets including four archival dashboards; 41,540 JSON rows verified; no database connection created.
Task 3 complete: desktop adapter, reversible translation, reference-data boundaries, readable dynamic theme tokens and post-initialization entry actions.
Task 4 complete: strict TypeScript shell, native overview, application directory, global search, favourites, preferences and business viewport.
Task 5 complete: all 271 active source assets copied; 118 original business HTML documents preserved; 11 original absent-link destinations repaired.
Task 6 complete: 17 parity/core tests, 9 shell/workflow checks, full118-screen differential zero mismatches, independent locale filter checks and SQL fidelity verification pass. Review findings resolved.
Task 7 complete: standalone project copied to C:/Users/loong/Documents/PeopleHCM-Web; production build and all9 shell/workflow checks passed from this directory. Local dev server is running at http://127.0.0.1:5173.

Ruling: Protect raw option captions and reference-data DOM fields from locale translation because original processes read displayed text as business values. Translate only presentation labels/actions around them.
Ruling: Defer translation and entry actions until the complete original DOMContentLoaded event dispatch, including window listeners, so original filter initialization sees its English source labels.
