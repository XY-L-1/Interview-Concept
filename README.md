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

Open `/courses/backend-systems` to learn, or `/prepare` to import and rehearse a
private profile in your browser. The preparation workspace keeps factual history
separate from company and role context. Personal JSON is not bundled with the
site or uploaded to a server. It can be saved locally, exported and cleared;
there is no cloud synchronization or authenticated personal-data service.

Open `/prepare/studio` for the recovered offline Interview Studio. Import its
private JSON bundle once, then save it to this browser to restore the original
31 behavioral questions, six stories, locked introduction, 94 foundation
questions, timer, quizzes, notes and progress transfer. The public runtime under
`public/studio/` contains interaction code and empty templates only. Personal
content must stay outside this public repository. Previous file:// progress
requires export from the old HTML and import in the corresponding Studio panel.

The historical architecture HTML is linked from the catalog at
`/guides/architecture.html`; its roadmap is explicitly labeled as a past plan.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- PostgreSQL planned as the source of truth

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

## Working rules

- Published course content and private learner data must use separate query and
  caching paths.
- Canonical editorial content must never read directly from AI generation
  records.
- Route files compose module application APIs; they do not contain domain
  rules.
- Add abstractions and infrastructure only when the first real use case needs
  them.
