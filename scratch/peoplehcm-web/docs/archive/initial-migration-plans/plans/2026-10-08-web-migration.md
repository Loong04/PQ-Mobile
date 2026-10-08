# PeopleHCM Web Implementation Plan

> For agentic workers: execute independent inventory, data and presentation tasks in parallel, then integrate and review.

**Goal:** Deliver all source business screens and workflows through an enterprise web frontend.

**Architecture:** Typed React shell around same-origin source business documents, with a centralized desktop adapter, theme and language bridge. Lossless source copy and independently reproducible SQL export.

**Tech Stack:** React, TypeScript, Vite, CSS custom properties, Node scripts, MySQL 8 seed SQL, Puppeteer for verification.

**Spec:** ../specs/2026-10-08-web-migration-design.md

## Global Constraints
- Preserve all original fields, scripts, data and process transitions.
- Do not edit existing mobile files or overwrite user changes.
- No backend. Browser persistence remains local.
- Non-purple neumorphism; central primary-colour and English/Chinese preferences.
- Preserve Employee ID, View Chart, attendance approval title and history-card standards.

## Review Focus
- Navigation within business pages must synchronize browser history without a reload loop.
- Translations must not change input/select values or employee data.
- Desktop grids must not make hidden tabs, forms or dialogs visible.
- Theme changes must cover literal source colours and maintain input/button contrast.
- SQL extraction must distinguish evaluated datasets from archived unevaluated source.

## Tasks
- [ ] 1. Inventory every source document, link, static/dynamic field and source limitation. Own scripts/inventory.mjs, src/generated/pages.json, docs/page-inventory.json and docs/feature-parity.md.
- [ ] 2. Export datasets, records, fields and source archive to database/ with a reproducible Node exporter and verification report.
- [ ] 3. Create public/web-adapter desktop CSS, translation dictionary and preference/navigation bridge.
- [ ] 4. Implement typed route/preferences helpers after failing behavioral tests; create React shell, dashboard, modules, settings and business viewport.
- [ ] 5. Copy all source pages/assets and inject presentation layer. Localize CDN icon/font dependencies where practical.
- [ ] 6. Typecheck/build, all-page browser smoke, workflow parity tests, visual review, fix findings, document evidence.
- [ ] 7. Copy the concrete verified standalone project to the user-authorized Documents directory and verify it there.
