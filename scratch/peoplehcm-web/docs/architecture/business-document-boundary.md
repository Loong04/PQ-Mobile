# Native enterprise presentation

Version 2 replaces the previous embedded workspace. Every business screen is a top-level browser document at `/workspace/<source-path>`. The React business shell moves the original `.phone-container` DOM node into `.business-outlet`; it does not recreate inputs, handlers, or records. Module home pages use the source-derived desktop option inventory, and details remain accessible through `webView=details`.

The browser document owns vertical scrolling. Native page, phone root, and main content have automatic heights and visible overflow. Source calls to main `scrollTop` and `scrollTo` are mapped to browser scrolling; browser scroll events are relayed to original main listeners. Profile category navigation uses document anchors with a sticky category bar and preserved active-pill state. Dialogs retain their original visibility and transitions, use viewport positioning, and can scroll within a bounded panel.

Chrome styles are scoped to `.enterprise-shell` and exclude `.business-outlet` descendants. This keeps global button, heading, and utility rules from changing source control contracts. Native desktop overrides are limited to presentation: neutral functional headers, source-derived form grids, record grids, wide calendars, readable fields, and source navigation chrome replacement. Duplicate source headings stay in the DOM and are visually hidden only when their text matches the shell heading.

The default palette is porcelain `#eef0f3`, slate blue `#435875`, and ink `#263140`. Dark mode uses graphite `#252930`. Colors and shadows are semantic tokens in `src/shared/styles/tokens.css`; legacy source variables are compatibility aliases. Primary colors derive accessible text, foreground, hover, border, and tint variants centrally. Soft raised shadows are reserved for controls and selected surfaces; content panels use quiet borders.

## Preferences

Preferences use a same-document event and do not require frame messaging:

```js
window.dispatchEvent(new CustomEvent('peoplehcm:preferences', {
  detail: { theme: { primary: '#435875', mode: 'light' }, locale: 'en' }
}));
```

`window.PeopleHcmDesktop.applyPreferences(detail)` is also available. English and Chinese presentation uses the existing centralized catalog. Input values, option text and implicit option values, employee names, data table cells, guest request labels, attachment file names, assignee names, clocking locations, and entitlement business labels remain protected. Preferences never reload business screens, so drafts remain intact.

## Source entry actions

Existing `webAction` aliases cover leave apply, history, team, balance, indicators, notifications, and updates. `webSection` calls the original leave section function with the requested individual/team scope. `profile-jd` calls the original job-description modal. Profile `scroll=bento-*` anchors run after initialization and again after the shell moves the original source root. Claims team scope is applied after source load initialization, which otherwise restores its default individual scope.

Employee IDs remain muted monospace lines directly below names with a leading `#`. Chart buttons retain the pie icon and single-line `View Chart` label. Approval detail names and history-style summary cards follow the repository rules. Source hidden attributes, inline visibility states, input IDs, option values, validation, event handlers, business computations, records, and storage keys remain owned by the original screen.

## Verification

JavaScript is checked with `node --check public/web-adapter/bridge.js`. All three CSS files are parsed with PostCSS. Native browser verification must inspect top-level documents, confirm zero frames, compare original controls and record data, check document scrolling and horizontal overflow, and exercise locale/theme changes without draft loss. The previous fixed-height embedded-page report is not evidence for native version 2.
