# Stylesheet structure review

This staging refactor separates stylesheet responsibilities without redesigning the product. The app entrypoint imports `src/shared/styles/tokens.css` first, then `src/app/styles/application.css`. The application stylesheet is the composition root: it imports app, layout, module and feature styles in the original cascade order. Shared token definitions do not import app or feature code.

## Responsibility map

| File | Responsibility | Original top-level nodes |
| --- | --- | ---: |
| `src/app/styles/primitives.css` | App reset, typography, form control defaults, surfaces, buttons and accessibility utilities | 26 |
| `src/app/layout/styles/shell.css` | Enterprise shell, branding, company context, navigation, profile, topbar and content layout | 44 |
| `src/app/layout/styles/page-heading.css` | Shared workspace page heading presentation | 5 |
| `src/features/overview/styles/overview.css` | Overview quick actions, metrics, attention list, applications, updates and calendar | 77 |
| `src/app/layout/styles/footer.css` | Workspace footer | 2 |
| `src/features/application-directory/styles/directory.css` | Application directory, filtering, search, module cards and page catalogue | 33 |
| `src/features/preferences/styles/preferences.css` | Theme mode, primary color, language and preference panels | 33 |
| `src/app/styles/business-document.css` | Business document Chrome, breadcrumbs, original-page selector and favourites | 14 |
| `src/app/styles/command-palette.css` | Workspace command search overlay and result presentation | 12 |
| `src/app/styles/motion.css` | App animations and keyframes | 4 |
| `src/app/styles/responsive.css` | Existing breakpoint rules and reduced-motion behavior in their original order | 9 |
| `src/app/styles/native-presentation.css` | Native document Chrome and late app-wide typography/surface presentation | 54 |
| `src/app/modules/styles/options-base.css` | Module option and scope component foundations | 16 |
| `src/app/styles/native-responsive.css` | Native document breakpoint refinements | 3 |
| `src/app/styles/source-compatibility.css` | Original source CSS compatibility for sidebar rows and document roots | 5 |
| `src/app/modules/styles/workspace.css` | Module workspace heading, actions, scopes, search, groups, option rows and responsive layout | 40 |

The base styles, shared responsive rules, native presentation, module foundations, native responsive rules, source compatibility, and final module workspace styles remain separate ordered phases. Combining a later override with an earlier component file would change its cascade position, so this refactor retains those phases explicitly. Every boundary is a complete CSS rule or at-rule at an actual responsibility transition.

## Cascade proof

- Original app stylesheet: 377 top-level nodes and 1597 declarations.
- Parsed imported styles: 377 top-level nodes in the same order.
- Concatenating the imported file bytes reconstructs the complete original app stylesheet byte-for-byte, including selector text, declarations, priorities, comments, keyframes, media queries and whitespace.
- The ordered canonical AST includes every nested rule and declaration and also matches exactly.
- Token stylesheet: 2 top-level nodes, copied byte-for-byte.
- All 16 relative import paths resolve, with no shared-to-app or shared-to-feature imports.
- Original `src/styles/app.css` and `src/styles/tokens.css` were removed only after all reconstruction, syntax, import resolution and token parity assertions passed. Tokens now live at `src/shared/styles/tokens.css`.

| Proof | SHA-256 |
| --- | --- |
| Original and reconstructed app CSS bytes | `60782b38a1305535712810f74a7248835ef11dff1a9120f72f59e3c869f77dc4` |
| Ordered selector/declaration/at-rule AST | `84379dc1f308e9a78eba58feb38c0c91895b527a3368f47f64a3a2a9279d1fde` |
| Original and relocated token bytes | `661c8b708323b262540a61fd918afa3f83bd915efbe57ef21b9c4826a38767c7` |

## Scope

`public/web-adapter/desktop.css`, `bridge.js`, `translations.js`, their runtime URLs, original business documents, JavaScript logic, SQL data, JSX, entrypoints and tests were not modified by this stylesheet task. App entrypoint imports are coordinated by the parent refactor. The Documents copy is not edited by this staging-only task.

Validation performed: PostCSS parsing of every extracted stylesheet, ordered import resolution, byte reconstruction equality, complete nested AST equality, top-level node counts, declaration counts, and unchanged token bytes. Browser and production build checks belong to the coordinated application refactor after entrypoint imports are updated.
