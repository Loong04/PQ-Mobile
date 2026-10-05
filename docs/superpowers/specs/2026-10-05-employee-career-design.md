# Employee & Career Module Design

## Goal

Add a standalone Employee & Career module to the PeopleHCM App page. The module provides Individual and Team scopes, separate files for every option, a Team View All sheet, and complete UI-only forms for Individual Feedback and Whereabout.

## Navigation and structure

- The App page entry opens `modules/employee-career/index.html` through the shared `navTo` router.
- The dashboard header returns to the theme-matched App page.
- Scope is represented by `?scope=individual` and `?scope=team` so option pages return to the correct dashboard state.
- Module assets live in `css/employee-career.css`, `js/employee-career-config.js`, `js/employee-career-app.js`, and `js/employee-career-forms.js`.
- Every option has its own HTML file under `options/individual/` or `options/team/`.

## Dashboard

The dashboard contains only the header, Individual/Team scope control, and Quick Options. Individual displays Onboard Activity, Feedback, and Whereabout. Team displays Confirm New User, Staff List, Staff Onboard, Manpower Stats, Confirm Staff, and View All. View All opens an accessible bottom sheet containing all fourteen Team options and closes by its button, backdrop, or Escape.

## Option files

Individual files:

- `onboard-activity.html`
- `feedback.html`
- `whereabout.html`

Team files:

- `confirm-new-user.html`
- `staff-list.html`
- `staff-onboard.html`
- `manpower-stats.html`
- `confirm-staff.html`
- `staff-exit.html`
- `staff-request.html`
- `staff-attrition.html`
- `staff-retention.html`
- `staff-whereabout.html`
- `staff-events.html`
- `staff-feedback.html`
- `key-staff-nomination.html`
- `staff-engagement.html`

Feedback and Whereabout are complete UI forms. The remaining fifteen pages are individual Coming Soon pages with their own title, icon, file, and scope-correct back link.

## Feedback form

Fields are Feedback Type, Category, Title, Feedback Date 1, Feedback Date 2, Reference 1, Reference 2, Your Feedback, Remarks, and Add Attachment. Feedback Type offers General, Suggestion, Compliment, and Complaint. Category offers Workplace, Management, Policy, Facilities, and Other. Attachment controls support file selection, camera selection, file-name display, and removal.

## Whereabout form

Fields are Date, To Date, Start Time, End Time, Location, State, Project, Task, and Remarks. State lists Malaysian states and federal territories. Project and Task use realistic example choices, with Task choices updating for the selected Project.

## Form behavior

- No field is required and no required marker is shown.
- Submit always succeeds, shows a toast, and does not persist data.
- Refreshing clears the form.
- Cancel returns to `../index.html?scope=individual`.
- Attachments remain local and are never uploaded.

## Visual and accessibility rules

- Reuse the existing PeopleHCM purple header, global theme variables, Plus Jakarta Sans, FontAwesome, shared phone shell, and bottom navigation.
- Use a three-column Quick Options grid at 360, 390, and 450 pixel widths without horizontal overflow.
- Use labels above form controls, visible focus states, keyboard-operable cards, and accessible dialog semantics.
- Support both light and dark themes and reduced motion.
- Use FontAwesome icons rather than emoji.

## Verification

Browser tests cover App routing, scope switching and restoration, exact option counts and names, Team View All behavior, all seventeen files and back links, complete form fields, absence of required controls, attachment UI, submit/cancel behavior, JavaScript errors, and horizontal overflow at mobile widths in both themes.
