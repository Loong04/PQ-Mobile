# Native web rebuild

The first migration retained a phone-shaped scrollable document inside an iframe. This failed the intended desktop workflow. The rebuild replaces that architecture with native module workspaces and top-level business documents.

## Accepted requirements

- Clicking a module reveals its real individual/team functional options and expandable sidebar navigation.
- Requests, records, approvals, reports and planning use the full desktop workspace. No business iframe or fixed-height phone container.
- Original business DOM controls, select values, script bytes, data and workflow state remain intact. Ordinary document navigation isolates the original page-level JavaScript globals.
- One browser document scroll; modal content and navigation may scroll independently when appropriate.
- Porcelain grey, slate blue primary and graphite dark surfaces. Central theme tokens and persisted custom colours; English/Chinese presentation preserves business reference values.
- Existing MySQL 8 export and immutable original-source snapshot remain part of the deliverable in Documents/PeopleHCM-Web.

## Implementation

1. Verify the previous iframe and nested scrolling failure (recorded in web-native-validation.md).
2. Extract typed module options from original menus and query-driven source views.
3. Share an enterprise navigation/header between the React overview and business documents.
4. Mount the original business root under the React business outlet without rebuilding its fields. Bundle a separate business entry for development and production.
5. Replace phone constraints with desktop forms, records and reports; bridge scroll and entry actions to the top document.
6. Verify source byte/field preservation, native routing, representative workflows, languages/themes, all original pages and desktop screenshots.
7. Update and build the requested Documents project, then verify its running preview.

Ownership: root owns application architecture, preferences, migration/bundling and delivery; inventory owns module navigation/workspaces; desktop_adapter owns central styling/bridge; data_export owns independent native browser/navigation verification. No backend is introduced.
