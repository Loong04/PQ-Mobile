# Current verification

The native desktop rebuild is verified by `tests/web-native.mjs`, `tests/native-navigation.test.mjs` and `tests/parity.test.mjs`. The current browser regression results are in `../web-native-validation.md`; current wide desktop screenshots are under `native/`.

Other earlier screenshots/reports in this directory describe the superseded iframe migration. They are historical evidence, not the current application architecture or current validation results.

Run `npm.cmd test`, `npm.cmd run build`, start `npm.cmd run preview`, then `npm.cmd run test:browser`. The browser suite checks every original document against the immutable snapshot, top-document routing, preserved controls/options, business workflows and document scrolling.
