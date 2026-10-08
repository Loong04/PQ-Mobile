# MySQL 8 export review

The copied delivery at `C:/Users/loong/Documents/PeopleHCM-Web` passed `node database/verify-export.mjs` using its own frozen `source-snapshot`. The SQL, manifest, JSON seed, exporter and verifier are byte-identical to the validated staging versions. No original mobile path is required for this verification.

The review found no schema or payload blocker for the documented MySQL 8 defaults. This is a source and payload review; no MySQL server was started, no backend was installed, and an actual database import remains unrun.

| Check | Verified result |
| --- | --- |
| Archived source fidelity | 276 assets; 9,179,114 exact bytes; all SHA-256 values match |
| SQL JSON fidelity | 41,540 rows decoded, parsed and compared successfully |
| Foreign keys | Parent tables and rows precede dependents; no invalid references found |
| Text column bounds | Largest source path 66 characters, title 58, field ID 33, dataset name 38, employee number 9 and employee name 31; all fit their declared columns |
| Source path uniqueness | 276 distinct paths, also distinct after case folding |
| Largest SQL statement | 1,796,377 bytes |
| Largest dataset JSON | 44,608 bytes |
| JSON values | Maximum nesting 7; zero invalid Unicode surrogates; finite numeric values fit supported ranges |
| NULL handling | Missing evaluated data uses SQL NULL; JSON null remains JSON null; empty strings use valid literals |

The SQL explicitly converts UTF-8 hex payloads to text before assignment to JSON columns. MySQL documents binary hexadecimal literals, character-set conversion with `CONVERT(... USING utf8mb4)`, and parsing valid strings when inserting into a JSON column. These rules support the generated encoding. [Hexadecimal literals](https://dev.mysql.com/doc/refman/8.0/en/hexadecimal-literals.html), [character-set conversions](https://dev.mysql.com/doc/refman/8.0/en/cast-functions.html), [JSON values](https://dev.mysql.com/doc/refman/8.0/en/json.html).

The widest full-column text index is `VARCHAR(512)` with `utf8mb4`, a maximum of 2,048 bytes. This fits the documented 3,072-byte limit for the default DYNAMIC row format and default 16 KB InnoDB pages. [InnoDB limits](https://dev.mysql.com/doc/refman/8.0/en/innodb-limits.html), [default row format](https://dev.mysql.com/doc/refman/8.0/en/innodb-row-format.html).

The largest statement is below the documented default packet limits of 16 MB for the mysql client and 64 MB for the server. The total SQL file size is about 50.8 MB; statements are sent separately. [MySQL packet limits](https://dev.mysql.com/doc/refman/8.0/en/packet-too-large.html).

SQL file SHA-256: `8201d48d751a80245dfdaffaaaffa75d4b0797e3857009f589a29aa76272adc1`.
