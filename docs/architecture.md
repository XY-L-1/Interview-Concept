# Architecture

## Current scope

The project starts as one deployable Next.js application and is designed to use
one PostgreSQL database when persistence is introduced. It is a modular
monolith: deployment stays simple while module ownership remains explicit in
code and data access.

The first vertical slice implements anonymous reading through the `content`
module using typed, file-backed published content. It deliberately does not yet
include database tables, authentication configuration, a search engine,
background jobs, or a component library.

## Dependency direction

```text
app routes and handlers
          |
          v
module public APIs
          |
          v
module-owned rules and data access
          |
          v
platform adapters
```

- `src/app` owns routing and request/response composition.
- Each directory under `src/modules` owns one product boundary.
- A module must not import another module's internal files or query its tables
  directly. Cross-module work goes through a small exported application API.
- `src/platform` contains technical adapters and no product policy.
- `src/shared/ui` contains only domain-neutral primitives.
- New layers or shared abstractions are added only after repeated use proves
  they are needed.

The initial product modules are:

- `content`: curriculum structure, canonical bilingual revisions, and
  publishing. Catalog and editorial responsibilities remain logically distinct
  but share one transactional code boundary.
- `discovery`: public search projections and relevance.
- `learning`: private learner state.
- `identity`: users, sessions, and authorization roles.
- `ai`: non-canonical generated artifacts and provenance.
- `preparation`: a browser-local personal fact profile, linked project stories,
  and company/role rehearsal context. It does not send personal data to the server.

## Route groups

- `(public)` contains anonymously readable, cacheable learning content.
- `(account)` is reserved for authenticated learner surfaces.
- `(editorial)` is reserved for staff-only authoring and publishing surfaces.
- `api/v1` is reserved for stable HTTP contracts. Server Components should call
  module application functions directly instead of making loopback HTTP calls.

Only a `page.tsx` or `route.ts` exposes a route. Reserved groups intentionally
contain no public route until that feature is implemented.

## Data boundaries

| Class | Examples | Rule |
| --- | --- | --- |
| Public | Published courses, sections, questions, editorial answers | Shared caching is allowed |
| Staff-private | Drafts, review state, previews, audit history | Staff authorization required |
| Learner-private | Identity, progress, confidence, bookmarks, notes | Owner-scoped and never shared-cacheable |
| Generated-private | AI outputs, prompts, model provenance | Never canonical without editorial review |

## Versioning rule

Stable course, section, and question identities are separated from immutable
editorial revisions. Identities own immutable routing slugs and explicit course
ownership, so learner references and public URLs are not rewritten by an
editorial release. A course revision is an atomic release root: it stores
catalog order plus ordered section revision IDs. Each section revision stores
ordered question revision IDs. Each question revision stores its difficulty,
English interview answer, and Chinese deep dive as one atomic version.

Publishing creates any changed child revisions, creates a new course revision
that fixes the complete curriculum tree, and then moves only the stable
course's publication pointer. An older release therefore keeps its original
section order, question membership, difficulty, and answers. Learner state
references the stable question ID and may record the last question revision
seen. Slug renaming is intentionally unsupported in the MVP; if it is added,
old slugs must remain as redirect aliases.

## Browser local preparation

The public `/prepare` route serves an empty workspace and generic role templates.
After hydration, its client component may read a versioned profile from the
browser's localStorage. File import, validation, editing, answer composition and
export run locally. Explicit save and clear actions control that browser's data;
there is no authenticated cloud persistence or cross-device synchronization.

The stable profile stores facts, contribution scope, evidence status and story
references. Separate company/role context changes ranking and interview prompts.
Only evidenced personal contributions enter first-person drafts; team context,
unverified claims and reflection notes remain separate. The public content module
must never import personal JSON or use personal profile data in page metadata.

`/prepare/studio` restores the existing offline practice application through a
same-origin iframe. Only generic templates and reviewed scripts are public;
the validated local JSON bundle is sent in memory after hydration through a
source- and origin-checked message handshake. The standalone runtime blocks
network connections and external embedded resources with CSP. Its original
progress keys remain compatible. Before clearing data, the parent synchronously
disposes the runtime so pending saves cannot recreate cleared records.

The 160-question Java/Spring source snapshot is public generic learning content.
Its originalGuide blocks preserve the original Chinese/English pairing rather
than fabricating examples to fill the newer lesson format. Sources and separate
correction notices remain visible without silently rewriting the original text.
