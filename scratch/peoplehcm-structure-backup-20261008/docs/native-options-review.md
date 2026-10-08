# Independent native option regression

Production URL: http://127.0.0.1:5173. Tested with isolated headless Google Chrome at 1440 × 900. External requests were blocked; frontend local storage was isolated from the user's browser.

- PASS: Leave Credit direct entry, complete controls, bilingual draft preservation. Evidence: `{"controls":9,"bilingualValuesPreserved":true,"bodyThemeUpdated":true}`.
- PASS: Time Off direct entry and original hours calculation. Evidence: `{"controls":7,"calculatedHours":"1.50","selectedReason":"personal","draftPreserved":true}`.
- PASS: Functional query favourite reopens Time Off. Evidence: `{"savedFunctionPath":"leave.html?webSection=viewApplyOffTimeForm&webView=details","reopenedFunction":"Time Off"}`.
- PASS: Native toolbar Back preserves Leave form to entitlement step. Evidence: `{"sequence":"Leave form → Leave entitlements → Leave hub","stayedInOriginalDocument":true,"draftPreserved":true}`.
- PASS: Profile anchor uses browser document scrolling. Evidence: `{"windowY":5893,"documentHeight":11808,"targetTop":77.84375,"internalTop":5893,"internalOverflow":"visible","categoryClickUsesWindow":true}`.
- PASS: Claims team calendar survives source load initializer. Evidence: `{"readyState":"complete","teamVisible":"block","calendarButtons":30,"sourceButtons":38,"text":true}`.
- PASS: View JD query opens the original job description modal. Evidence: `{"originalDocumentModal":true,"closeActionWorks":true}`.

Runtime page errors: 0.

These checks exercise existing source forms, calculations, navigation and dialogs. No submission or backend transaction was performed. Source placeholder pages remain source placeholders.
