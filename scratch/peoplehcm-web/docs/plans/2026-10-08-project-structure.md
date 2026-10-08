# Professional project organization implementation plan

> **For agentic workers:** Required workflow: subagent-driven-development with independent review and verification. Keep original business URLs and immutable data intact.

**Goal:** Make the existing web frontend maintainable through feature ownership, shared infrastructure and explicit migration boundaries.

**Architecture:** Application files compose feature pages and registries. Features depend on reusable shared contracts/utilities; shared code never depends on features or application composition. Preserved business documents remain under their stable public URLs.

**Tech Stack:** Existing React 19, TypeScript 5.9 and Vite 7; no new dependency required.

**Spec:** `docs/architecture/project-structure.md`

## Tasks

- [ ] Record current catalogue/style/control baselines and write architecture tests that fail against the flat layout.
- [ ] Extract all eight module navigation definitions into their own feature folders; assemble them in the application registry without changing ordered option data.
- [ ] Move entrypoints/layout/pages to application and feature directories; split contracts, browser storage, preferences, contrast and path utilities into shared responsibilities. Update every import and bootstrap URL.
- [ ] Split native CSS by actual responsibility with an ordered stylesheet entry; preserve declaration order and generated visual output.
- [ ] Organize migration/verification tools, unit/integration/e2e tests and current/archive documentation. Update root resolution, scripts and documented commands.
- [ ] Verify dependency boundaries, strict compilation, source/catalogue/style parity and native browser workflows; update and verify the Documents deliverable.

## Review focus

- Public business URLs and original script/control bytes remain unchanged.
- Moving a tool/test must not resolve its project root incorrectly.
- Development public HTML bootstrap must import the new business entry; production keeps its stable bundled entry.
- Native feature code must not create circular imports through the application registry.
- CSS imports retain exact cascade order; module scopes, favourites, languages, themes and original form Back actions remain intact.
