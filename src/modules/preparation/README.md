# Private preparation

`/prepare` is the authenticated preparation hub, `/prepare/profile` edits the
stable profile and role context, and `/prepare/studio` opens the recovered
practice library. Supabase email login and server-side owner checks protect these
pages and the private document API. RLS restricts document access to the seeded
owner rows. Normal use loads account data automatically after login, without a
mandatory JSON import. Do not import private fixtures into this module or public
assets.

The private service keeps three documents: `profile` (the schema below), `studio`
(original practice content), and `progress` (learning states and Studio practice
records). Private payloads are fetched by the client after authorization, rather
than embedded in public JavaScript or static HTML. Requests use no-store caching.
The public code contains validators, empty templates, and generic role lenses.
No AI generation or model service is used.

`usePrivateDocument` loads a profile or Studio document and saves changes using
its expected database version. The profile editor saves explicitly to the account;
an optional backup exports the current draft, including unfinished edits. A 409
version conflict keeps the draft and does not overwrite another page's changes.
Reloading the cloud version is explicit and the profile editor confirms before
discarding unsaved edits. Drafts are in-memory until saved or exported. Database
versions are separate from the document's `schemaVersion`.

The learning provider automatically synchronizes question states and Studio
progress. Independent edits can merge on a version conflict; conflicting values
on the same field require an explicit local/cloud choice. See
[`../learning/README.md`](../learning/README.md) for synchronization details.

## JSON schema, version 1

All fields below are required. Unknown fields and unsupported schema versions are
rejected. IDs and fact text / story title are nonempty strings. IDs must be unique
within facts / stories. Story fact IDs must reference existing facts. Tags and
fact ID lists contain unique nonempty strings. Other text fields may be empty.
`interviewDate` is empty or a real `YYYY-MM-DD` date. The private API validates the
corresponding document schema and bounds request size before storing content.

```json
{
  "schemaVersion": 1,
  "profile": {
    "displayName": "",
    "facts": [],
    "stories": []
  },
  "context": {
    "company": "",
    "roleTitle": "",
    "focus": "payments-java",
    "interviewDate": "",
    "notes": ""
  }
}
```

`Fact` fields:

- `id`, `text`, `source`: strings; `text` should be an accurate English fact
  sentence, with the correct personal or team subject.
- `tags`: string array used for role relevance, e.g. `java`, `kafka`,
  `transactions`, `reliability`, `platform`, `performance`, `api`, `ai`, `ml`,
  `evaluation`, `python`, `data`, `latency`, `ownership`.
- `provenance`: `user-confirmed`, `code-evidence`, or `needs-review`.
- `contribution`: `personal`, `team`, or `context`.

`Story` fields: `id`, `title`, `factIds` (string array), `reflection` (string).
Stories reference the stable profile facts instead of duplicating them. Reflection
is a separate preparation note and is not included in experience statements.

`context.focus` is `payments-java`, `backend-platform`, or `applied-ai`.
Changing focus only changes ranking, a generic transition, and follow-up prompts;
it never rewrites profile facts or story references. Automatic English drafts
include only facts marked `personal` with `user-confirmed` or `code-evidence`
provenance. Code evidence should establish the claimed personal scope before the
owner selects that combination. Team and background statements remain separately
visible. `needs-review` is always excluded from automatic first-person drafts.
Company and role title personalize only an opportunity transition. Company-specific
motivation, verified JD details, and HR questions remain owner-written `context.notes`;
they are displayed separately and never inferred from a company name.

Editing a fact changes the shared source for every story that references it.
Deleting a fact removes its references from stories. New facts default to
`needs-review` / `context`, so adding text alone never certifies ownership.

## Verification

Pure-logic tests are in `tests/preparation/workspace.test.ts`: schema/import
failures, round-trip export, provenance filtering, empty profiles, and role
changes preserving facts. Browser checks should also cover authorized automatic
loading, explicit cloud save and reload, evidence labels, role switching, draft
backup, and a 409 that preserves unsaved work. Verify guest isolation and progress
restoration in another authenticated browser context.

## Existing Interview Studio

`/prepare/studio` automatically loads a separate
`{schemaVersion:1, behavior, foundations}` bundle from the private `studio`
document. The recovered baseline contains six stories, 31 behavioral questions,
94 foundation questions, and the locked introduction. This is intentionally
distinct from the editable fact-profile schema: original STAR drafts, question
IDs, evidence notes, and `needs-details` states are retained, not promoted into
verified profile facts. Editing a story does not certify its claims or change its
original preparation state.

Optional Studio bundle import validates before replacing the in-memory content;
an explicit versioned save is still required to replace cloud content. Backup
and old-progress transfer controls remain available. The original three
`simple-ai-*-v1` progress sections live inside the private `progress` document;
old browser sections can migrate after authorization when no cloud section
exists. Old file:// records require export/import from the corresponding old/new
panel.

Only generic public runtime code is embedded in the same-origin iframe; the
parent validates data and checks iframe source and origin. The runtime escapes
dynamic text and relays practice changes to the authenticated parent for cloud
synchronization. Clearing old browser caches disables the runtime before iframe
teardown; it does not delete account documents or cloud progress.
`tests/preparation/studio.test.ts` covers the schema and fact-boundary states.
