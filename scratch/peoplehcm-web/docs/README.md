# Documentation

Current implementation and maintenance documentation:

- [Project structure and dependency rules](architecture/project-structure.md)
- [Business-document compatibility boundary](architecture/business-document-boundary.md)
- [Native module navigation and source routes](architecture/module-navigation.md)
- [Exported data model](architecture/data-model.md) and [MySQL instructions](../database/README.md)
- [Source feature coverage and limits](reports/feature-parity.md)
- [Native browser workflows](reports/web-native-validation.md)
- [Independent option and step review](reports/native-options-review.md)
- [Module structure parity](reports/module-structure-review.md)
- [Stylesheet structure parity](reports/style-structure-review.md)
- [Tooling and architecture verification](reports/tooling-structure-review.md)

`generated/` contains machine-generated inventories from `source-snapshot/`; use the migration commands to update them. `plans/` records accepted implementation work. `reports/screenshots/` contains current native desktop evidence.

`archive/` retains superseded embedded-workspace designs and their verification records for traceability. Those files describe earlier implementations and must not be used as current architecture or validation evidence.
