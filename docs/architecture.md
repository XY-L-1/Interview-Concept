# Architecture

## Current scope

The project starts as one deployable Next.js application backed by one
PostgreSQL database. It is a modular monolith: deployment stays simple while
module ownership remains explicit in code and data access.

This first pass establishes boundaries only. It deliberately does not include
database tables, authentication configuration, a search engine, background
jobs, or a component library.

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

Stable course, section, and question identities will be separated from mutable
editorial revisions. A published bilingual question revision will contain both
the English interview answer and Chinese deep dive as one atomic version.
Published revisions will be immutable; learner state will reference the stable
question ID and record the last version seen.
