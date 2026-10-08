# Desktop presentation boundary

The React host supplies the enterprise sidebar, dashboard, command palette and preferences. Every original business screen is served from `/workspace/` at desktop width. The source screen still owns its original HTML IDs, form names, event handlers, data arrays, validation, document state transitions and browser storage keys.

The files in `public/web-adapter` are intentionally independent of the mobile source:

| File | Responsibility |
| --- | --- |
| `desktop.css` | Desktop sizing, silver neumorphic surfaces, field grids, readable focus states, large calendars and centered dialogs. |
| `bridge.js` | Same-origin host messaging, centralized theme application, legacy violet color mapping, presentation standards and alias entry actions. |
| `translations.js` | Central English-to-Chinese UI catalog and reversible text/attribute translation. |

## Preference contract

The host sends a message to the screen's iframe, using its exact origin:

```js
iframe.contentWindow.postMessage({
  type: 'peoplehcm:preferences',
  theme: { primary: '#176b64', mode: 'light' },
  locale: 'en'
}, location.origin);
```

The screen accepts messages only from its parent and only from the same origin. It emits `peoplehcm:ready` and `peoplehcm:navigation` with a source-relative `path`, preserving query parameters and hashes. Navigation through original links, inline `window.location` handlers and the History API remains inside the source workspace. Navigation reports let the host synchronize its own route.

Theme customization has a single primary color. The adapter derives hover, border, translucent, foreground and dark-mode text variants. The warm silver surface, shadows and text have their own semantic CSS tokens. The existing `--purple-*` variables are compatibility aliases to the new primary tokens; their names do not imply a fixed violet color. Literal source violet/indigo colors are mapped through the CSSOM and inline style declarations. Red, amber, green and standard blue status colors remain semantic. The obsolete purple raster hero is hidden alongside phone status bars, preview controls and bottom navigation.

## Language behavior

`PeopleHcmWebI18n` exposes `setLocale`, `translate`, `t`, `dictionary` and `getLocale`. Add translations centrally in `translations.js`. Original text is retained in WeakMaps, so English can be restored without reloading or losing drafts. The dictionary covers shared navigation, headings, forms, labels, actions, statuses, common placeholders and record counters across all modules. Newly rendered source content is translated by the bridge's mutation observer.

Employee names, identifiers, free-text data table values, profile record values, input values, editable fields, scripts and styles are excluded from UI translation. All select-option captions are also retained: several original screens use the caption as an implicit option value or read it into saved records. Guest-visit request choice labels are likewise protected because the source saves their text. Document names and business data keep their original spelling. Unknown text falls back to the source English; adding specialized labels to the catalog does not require changing business code. `data-no-translate` is available for additional protected business content.

## Presentation standards

Employee ID elements are displayed as muted monospace lines with a leading `#`. Existing name/ID sibling groups are arranged with the ID directly below the name. Dedicated reporting table ID columns remain columns, because the repository's placement rule applies to employee cards and lists.

Known chart actions are normalized to a horizontal `View Chart` pill with FontAwesome's pie icon. Source approval headers already use `OT Plan Approval`, `Attendance Advice Approval` and `Final OT Approval`; the adapter retains those source names, with corresponding Chinese UI translations.

Known summary containers reuse `.history-card-item` with an 18px radius and hide only their redundant date badge. Real history cards retain their dates. Grids are applied to recognized repeated card lists and groups containing actual form fields; modal visibility, checked states, hidden views and source transitions are not changed.

## Legacy alias actions

The bridge supports `webAction=leave-apply`, `leave-history`, `leave-team`, `leave-balance`, `indicators`, `notifications` and `updates`. These call the existing source functions in a macrotask after the complete DOMContentLoaded dispatch, including source listeners attached to window. Profile aliases may use `scroll=bento-personal`, `bento-contact`, `bento-education` or `bento-finance` to open the appropriate existing profile section.

## Verification and scope

JavaScript syntax checks:

```sh
node --check public/web-adapter/bridge.js
node --check public/web-adapter/translations.js
```

The frontend preserves the mobile project's existing process implementations, including its existing local simulation of submissions, approvals and document data. It does not create a server or change that behavior into an authenticated production backend. The separately exported SQL is a reviewable data artifact and is not executed by this browser adapter.

Legacy source screens have substantial inline presentation code. The bridge provides a controlled migration boundary while keeping the entire workflow inventory available. New functionality should be built as native typed React modules and consume these same semantic tokens and centralized messages; original source behavior can then be migrated module by module with parity checks.
