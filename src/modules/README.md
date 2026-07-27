# Product modules

Each child directory owns a product boundary. Start with files at the module
root and introduce `domain`, `application`, `infrastructure`, or `ui`
subdirectories only when real code makes the separation useful.

Modules may use `src/platform` and `src/shared`, but must not reach into another
module's internal files or data tables.
