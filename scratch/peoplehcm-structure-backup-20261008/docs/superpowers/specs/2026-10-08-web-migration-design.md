# PeopleHCM enterprise web migration

## Authorized brief
The user asks for every existing mobile page, field, information item and business flow in a web frontend, with a non-purple neumorphic design, centrally changeable primary colour and English/Chinese support. Output belongs in C:/Users/loong/Documents/PeopleHCM-Web. No backend is requested. Technology and visual choices are delegated to the implementer.

## Architecture
React + TypeScript + Vite provides a responsive enterprise navigation shell, dashboard, searchable application directory, favourites and preferences. Every original HTML business document and its JavaScript dependencies is copied into public/workspace. A same-origin business viewport isolates existing global scripts while a common desktop adapter removes phone constraints and reflows real forms, calendars, details and cards. It preserves original functions, field IDs, calculations, validation, approval transitions and browser storage. This is an intentional migration boundary; existing documents are not rewritten as React components. Future domain rewrites can happen independently.

## Visual system
Light silver grey surfaces, deep teal primary #176b64, ink typography, paired light/dark soft shadows, recessed inputs, restrained teal highlights, 18px history cards. Large desktop sidebar, top navigation, full-width content, bounded dialogs. Themes are CSS custom properties with one central colour configuration. Provide light/dark modes and teal, navy, forest and copper presets plus a custom primary picker. Form and CTA contrast has priority over decorative shadows. Reduced motion is supported.

## Scope and boundaries
Preserve all source business documents and assets, including alternate theme/profile examples, but use canonical pages in normal navigation. Inventory lists every document and input, including dynamic markup. All source data is exported into MySQL 8 SQL with dataset provenance and a lossless source-data archive for values that cannot safely be statically evaluated. SQL is a seed/import artifact, not connected to the frontend. Existing browser-persisted workflows retain browser persistence. Existing source placeholders remain recorded as source limitations; no fake service integration is added.

## Languages
Shell strings use a typed English/Chinese catalogue. A shared translation catalogue handles static and generated legacy UI text while preserving employee names, IDs, entered values, reference codes and calculations. Preferences persist and apply to every business document; translating presentation must never change business values or select option values.

## Repository rules
Employee IDs appear directly below names and start with #. View Chart buttons include a FontAwesome pie icon and single-line label. Attendance approval detail headings follow OT Plan Approval, Attendance Advice Approval and Final OT Approval. Summary/detail cards use the 18px history style without duplicate left date badges.

## Verification
Verify route traversal protection, preference validation and colour contrast. Compare migration document/asset hashes and exact business script/form contents excluding injected presentation assets. Build and typecheck. Browser smoke every business document at desktop width and record pre-existing source errors separately. Exercise booking validation/save/confirm/history, approvals, filters, profile categories, theme and language persistence, responsive navigation and search. Inspect screenshots at desktop and tablet widths.
