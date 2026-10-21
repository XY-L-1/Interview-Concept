# Interview Learning Platform

A bilingual software-engineering interview-learning platform. Each question
pairs a concise English interview answer with an independently authored Chinese
deep dive.

The public reader contains React fundamentals and an eight-lesson backend
systems course. Follow a translation workflow from request acceptance through
Kafka, ordering, duplicates, concurrency, backlogs and payment timeouts. Each
backend lesson includes practice questions and official references; the capacity
lessons also include an interactive backlog model.

Open `/courses/backend-systems` to learn, or `/prepare` to import and rehearse a
private profile in your browser. The preparation workspace keeps factual history
separate from company and role context. Personal JSON is not bundled with the
site or uploaded to a server. It can be saved locally, exported and cleared;
there is no cloud synchronization or authenticated personal-data service.

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
