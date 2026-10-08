# Project structure and dependency rules

This reorganization makes the completed native frontend maintainable by responsibility and feature. It does not rewrite preserved mobile business logic. The immutable snapshot, MySQL export and runtime business document addresses remain stable.

## Source ownership

- `src/app/`: application composition, routing, entrypoints, layout, native module workspaces and the business-document mount boundary.
- `src/features/`: actual feature implementations. Eight business modules each own their navigation definitions. Overview, application directory/search and preference screens own their page/UI files.
- `src/shared/`: reusable contracts, browser storage, theme configuration, language dictionaries, path validation and design tokens.
- `src/app/generated/`: page catalogue generated from the immutable source. Do not edit it manually.
- `public/workspace/`: preserved business HTML, CSS, JavaScript and assets. Relative routes are a compatibility contract; migration tooling regenerates them.
- `public/web-adapter/`: runtime presentation, theme, language and document scrolling boundary around preserved business documents.
- `source-snapshot/`: immutable mobile baseline used for migration, audit and SQL export.
- `database/`: actual MySQL export, data manifest and database documentation.
- `tooling/migration/`: inventory, migration and SQL-export commands.
- `tooling/verification/`: reusable browser probes and SQL verification tooling.
- `tests/unit/`, `tests/integration/`, `tests/e2e/`: pure logic, source/parity/architecture contracts, and real-browser business flows.
- `docs/architecture/`, `docs/generated/`, `docs/plans/`, `docs/reports/`, `docs/archive/`: maintained architecture, generated inventories, implementation records, verification evidence and superseded migration notes.

## Dependency direction

Application composition may import feature and shared code. Features may import shared code and their own files, but cannot import application entrypoints or another feature's implementation. Shared code cannot import app or feature code. Type-only contracts belong in shared; application registries assemble feature definitions.

Use descriptive file names and keep files with one responsibility. Split by actual behavior, never by arbitrary line counts or empty placeholder folders. Theme values and language strings remain centralized. Do not introduce backend/services folders until there is an implemented backend or service.

## Migration boundary

The new native shell and menus are React/TypeScript. Existing business documents still contain original page-level scripts and are isolated through normal document navigation. Their files are preserved for verified field/process parity; relocating them would break original relative links. This boundary is explicit so future business modules can be migrated independently.

## Verification

The reorganization must preserve the ordered 115-option catalogue, byte-identical original business assets/control markup, CSS cascade order, production and development bootstrap URLs, and all existing browser workflows. Automated architecture checks enforce imports and directory responsibilities. Generated output and installed dependencies remain excluded from source control.
