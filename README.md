# Interview Learning Platform

A bilingual software-engineering interview-learning platform. Each question
pairs a concise English interview answer with an independently authored Chinese
deep dive.

This repository currently contains the structural foundation only. Product
features, persistence, authentication, and visual design will be added in
small, verified increments.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- PostgreSQL planned as the source of truth

## Commands

```bash
npm run dev
npm run lint
npm run build
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
dependency rules.

## Working rules

- Published course content and private learner data must use separate query and
  caching paths.
- Canonical editorial content must never read directly from AI generation
  records.
- Route files compose module application APIs; they do not contain domain
  rules.
- Add abstractions and infrastructure only when the first real use case needs
  them.
