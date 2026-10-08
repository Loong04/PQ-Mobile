# Native web validation

## Native regression results

The initial red test observed one iframe and an inner Work Plan viewport of 469 px with 1,274 px of content. The regression suite requires source business content to belong to the top document and grow its page.

URL: http://127.0.0.1:4173. Checks passed: 10/11.

- PASS native sidebar opens attendance options and expands live submenu actions

  ```json
  {"route":"#/module/attendance","iframeCount":0}
  ```

- PASS all native module landings show their original individual and team options

  ```json
  [{"module":"attendance","scope":"individual","options":8},{"module":"attendance","scope":"team","options":16},{"module":"leave","scope":"individual","options":7},{"module":"leave","scope":"team","options":4},{"module":"claims","scope":"individual","options":11},{"module":"claims","scope":"team","options":6},{"module":"payroll","scope":"individual","options":6},{"module":"payroll","scope":"team","options":2},{"module":"employee-career","scope":"individual","options":5},{"module":"employee-career","scope":"team","options":14},{"module":"project-task","scope":"individual","options":4},{"module":"project-task","scope":"team","options":4},{"module":"admin","scope":"individual","options":8},{"module":"admin","scope":"team","options":2},{"module":"profile","scope":"individual","options":17},{"module":"profile","scope":"team","options":1}]
  ```

- PASS Work Plan opens a full-width top document with all 21 original fields

  ```json
  {"viewportWidth":1440,"documentWidth":1440,"documentHeight":1518,"viewportHeight":900,"outletWidth":1124,"phoneWidth":1124,"phoneHeight":1173.5,"mainHeight":1174,"mainScrollHeight":1174,"mainOverflowY":"visible","internalVerticalScrollers":[],"formWidth":1124,"sourceHeader":{"height":0,"display":"none"}}
  ```

- PASS language and theme switches keep the current source form draft intact

  ```json
  {"saved":{"primary":"#435875","mode":"dark","locale":"zh"},"draftPreserved":true}
  ```

- PASS resource booking validates, saves, confirms and survives a document reload

  ```json
  {"originalRecords":1,"persistedRecords":2}
  ```

- PASS original form cancel returns to native module options with the original scope

  ```json
  {"route":"#/module/project-task"}
  ```

- PASS employee IDs remain below names with their leading hash

  ```json
  {"text":"#EBB01","name":"Sarah Jenkins","idTop":304.28125,"nameBottom":301.28125,"idLeft":366,"nameLeft":366,"idHeight":14,"nameHeight":30,"fontSize":11.5}
  ```

- PASS Leave Apply query opens the functional source form and entitlement filtering still works

  ```json
  {"entitlementRecords":"2","afterLanguageSwitch":"2"}
  ```

- PASS native toolbar Back respects both module navigation and the original Leave form step

  ```json
  {"moduleRoute":"#/module/project-task","leavePriorView":"viewApplyLeave","innerFormClosed":true}
  ```

- FAIL all 118 original documents retain source fields and use a native full-width document layout: Every selected source page must complete inspection

117 !== 118


- PASS tested native workflows introduce no JavaScript runtime errors

  ```json
  {"runtimeErrors":0}
  ```
