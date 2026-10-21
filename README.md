# Interview Learning Platform

A bilingual software-engineering interview-learning platform with Chinese
explanations and English interview answers.

The public reader contains React fundamentals and an eight-lesson backend
systems course. Follow a translation workflow from request acceptance through
Kafka, ordering, duplicates, concurrency, backlogs and payment timeouts. Each
backend lesson includes practice questions and official references; the capacity
lessons also include an interactive backlog model.

Eight Java/Spring courses restore the complete 160-question original guide,
including all four paired Chinese/English blocks, original numbering and source
locations. Five documented wording corrections appear above the preserved text.
The catalog now has ten public courses and 173 questions.

Open `/courses/backend-systems` to learn. Public courses remain available without
an account. Supabase email login protects `/prepare`, `/prepare/profile`, and
`/prepare/studio`; only the configured, confirmed owner can access private data.
After login, the workspace automatically loads the account's profile, stories,
and progress. Normal use does not require importing a JSON file.

The private service stores three versioned documents: `profile`, `studio`, and
`progress`. Profile facts remain separate from company and role context. Profile
and story edits use explicit cloud saves; learning states and Studio practice
progress synchronize through the learning provider. Conflicting document writes
return 409 without overwriting the cloud version. Drafts remain in memory for an
explicit reload or backup; progress can merge independent edits and asks the owner
to resolve conflicts on the same field.

The recovered Interview Studio preserves its original 31 behavioral questions,
six stories, locked introduction, 94 foundation questions, timer, quizzes, notes,
and progress transfer. Original drafts and incomplete story states are not
automatically promoted into verified profile facts. The public runtime under
`public/studio/` contains generic interaction code and empty templates only;
private payloads are fetched after authorization. Keep private seed files and
exports outside this public repository. Optional backup and old-record migration
controls remain available; previous file:// progress requires export from the old
HTML and import in the corresponding Studio panel.

The historical architecture HTML remains available at
`/guides/architecture.html`; its roadmap is explicitly labeled as a past plan.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL with owner-scoped row-level security for private data

## Commands

```bash
npm run dev
npm run test
npm run lint
npm run typecheck
npm run build
npm run verify
```

## Structure

```text
src/
  app/             Routes and transport composition only
  modules/         Product-domain modules
  platform/        Database, auth, jobs, and observability adapters
  shared/ui/       Domain-neutral UI primitives
docs/              Architecture decisions
tests/             Cross-module integration and end-to-end tests
```

See [docs/architecture.md](docs/architecture.md) for module ownership and
dependency rules, and [docs/release-workflow.md](docs/release-workflow.md) for the
GitHub quality workflow and Vercel Git deployments. Use Node.js 24.
See [src/modules/identity/README.md](src/modules/identity/README.md) for generic
authentication configuration and document provisioning, and
[src/modules/preparation/README.md](src/modules/preparation/README.md) for the
profile schema and evidence boundaries. Configuration and private seeds do not
belong in public course content or deployment assets.

## Working rules

- Published course content and private learner data must use separate query and
  caching paths.
- Canonical editorial content must never read directly from AI generation
  records.
- Route files compose module application APIs; they do not contain domain
  rules.
- Add abstractions and infrastructure only when the first real use case needs
  them.
