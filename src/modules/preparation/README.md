# Browser-local preparation

`/prepare` is an interactive local workspace. The public server-rendered page and
JavaScript contain only the empty profile, validation logic, and generic role
templates. The editor mounts after hydration and then reads browser localStorage.
It does not import learner files, call a server action, or send profile data over
the network. Do not import private fixture data into this module.

The owner explicitly saves to `interview-preparation:v1`. Valid saved JSON is
restored after reload. Invalid stored data remains untouched until an explicit
save or clear. Import validates before replacing the in-memory workspace; save
is separate. Export downloads the current validated workspace. Clear removes the
storage key and current in-memory profile, but cannot delete exported files.
Storage is not encrypted and is readable by users of this browser and same-origin
scripts. Cross-tab concurrent editing is not synchronized; the last explicit save
wins. No cloud storage, authentication, AI generation, or model service is used.

## JSON schema, version 1

All fields below are required. Unknown fields and unsupported schema versions are
rejected. IDs and fact text / story title are nonempty strings. IDs must be unique
within facts / stories. Story fact IDs must reference existing facts. Tags and
fact ID lists contain unique nonempty strings. Other text fields may be empty.
`interviewDate` is empty or a real `YYYY-MM-DD` date. JSON import accepts up to
1,000,000 characters; the file picker additionally limits file size to 4 MB.

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
changes preserving facts. Browser checks should also cover import, explicit save,
reload restoration, editing evidence labels, role switching, export and clear,
including a failed import that preserves the previous workspace.
