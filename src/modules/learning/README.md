# Learning

Owns private bookmarks, question progress, confidence, and last-viewed state.
Future notes, flashcards, and repetition features begin here only when their
requirements are defined.

`LearningProvider` owns one authenticated `progress` document. Mount it once in
the shared shell with `enabled={!!owner}`; guest mode performs no API calls and
exposes no private progress. `useLearningProgress(questionId)` changes an explicit
learning/review/confident status. `useProgressSummary()` reports recorded states,
and `useStudioProgress()` bridges the original Studio's three progress sections.
The owner-only API returns `{key, content, version, updatedAt}` and accepts
`{content, expectedVersion}`. The model validator is safe to import server-side.

After authorization, missing Studio sections can migrate from the old browser
keys. Existing cloud sections win over that legacy snapshot. New changes use the
cloud document, not an anonymous local cache. Saves debounce for 600 ms. Hidden
pages flush immediately, using keepalive only for small payloads; unacknowledged
changes remain marked pending and a full-page exit warns before losing them.

On a version conflict, a three-way merge preserves independent question/field
changes and append-only practice sessions. Same-field conflicts remain in memory
until an explicit local/remote choice. Choosing a remote conflicting value still
preserves unrelated local edits. A remote choice remounts Studio from the merged
progress so its older in-memory state cannot reapply the discarded value.

The generic iframe never calls a network API. Its same-origin, parent-only load
message can include `progress`; `KIT` reads this snapshot and reports subsequent
key/value changes to the parent via `interview-studio:progress`. The parent checks
origin, source and schema before autosaving. Data never enters URLs or public
assets. Offline save failures preserve the current page and expose retry/export;
they are not reported as saved.
